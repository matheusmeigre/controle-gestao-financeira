import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'

/**
 * Parser para faturas do Banco Inter (CSV)
 * 
 * Formato esperado do CSV Inter:
 * Data,Descrição,Valor
 * 15/01/2024,"COMPRA LOJA ABC",150.00
 */
export class InterParser implements InvoiceParser {
  readonly name = 'Banco Inter CSV Parser'
  
  async canParse(file: File): Promise<boolean> {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return false
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return false
    }
    
    try {
      const text = await this.readFileChunk(file, 500)
      const lines = text.split('\n')
      
      if (lines.length < 2) return false
      
      const firstLine = lines[0].toLowerCase()
      
      // Verifica padrão característico do Inter
      return (
        firstLine.includes('data') &&
        firstLine.includes('descrição') &&
        firstLine.includes('valor')
      )
    } catch {
      return false
    }
  }
  
  async parse(file: File): Promise<ParseResult> {
    const errors: string[] = []
    const transactions: ParsedTransaction[] = []
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return {
          success: false,
          transactions: [],
          errors: ['Arquivo CSV vazio ou inválido']
        }
      }
      
      const dataLines = lines.slice(1)
      
      for (let i = 0; i < dataLines.length; i++) {
        try {
          const transaction = this.parseInterLine(dataLines[i], i + 2)
          if (transaction) {
            transactions.push(transaction)
          }
        } catch (error) {
          errors.push(`Linha ${i + 2}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }
      
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        success: errors.length === 0 || transactions.length > 0,
        transactions,
        errors,
        metadata: {
          bankName: 'Banco Inter',
          totalAmount,
          cardLast4: this.extractCardLast4(text),
          statementPeriod: this.extractPeriod(transactions)
        }
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        errors: [`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }
    }
  }
  
  private parseInterLine(line: string, lineNumber: number): ParsedTransaction | null {
    const regex = /(?:^|,)("(?:[^"]|"")*"|[^,]*)/g
    const fields: string[] = []
    let match
    
    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined && match[1] !== '') {
        let field = match[1].replace(/^"|"$/g, '').trim()
        fields.push(field)
      }
    }
    
    if (fields.length < 3) {
      throw new Error('Número insuficiente de campos')
    }
    
    const [dateStr, description, amountStr] = fields
    
    // Parse date - formato brasileiro DD/MM/YYYY
    const date = this.parseBrazilianDate(dateStr)
    if (!date) {
      throw new Error(`Data inválida: ${dateStr}`)
    }
    
    // Parse amount - formato brasileiro com vírgula
    const amount = this.parseBrazilianAmount(amountStr)
    if (isNaN(amount)) {
      throw new Error(`Valor inválido: ${amountStr}`)
    }
    
    // Ignora valores negativos (podem ser estornos)
    if (amount <= 0) {
      return null
    }
    
    // Detecta parcelamento
    const installmentMatch = description.match(/(\d+)\/(\d+)/)
    const installment = installmentMatch ? `${installmentMatch[1]}/${installmentMatch[2]}` : undefined
    
    return {
      date,
      description: description.trim(),
      amount,
      category: this.inferCategory(description),
      installment,
      rawData: {
        lineNumber
      }
    }
  }
  
  private parseBrazilianDate(dateStr: string): Date | null {
    // Formato: DD/MM/YYYY ou DD-MM-YYYY
    const match = dateStr.match(/(\d{2})[/-](\d{2})[/-](\d{4})/)
    if (!match) return null
    
    const [, day, month, year] = match
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    
    return isNaN(date.getTime()) ? null : date
  }
  
  private parseBrazilianAmount(amountStr: string): number {
    // Remove "R$", espaços e pontos de milhares
    let cleaned = amountStr.replace(/R\$?\s*/g, '').replace(/\./g, '')
    // Substitui vírgula decimal por ponto
    cleaned = cleaned.replace(',', '.')
    return parseFloat(cleaned)
  }
  
  private inferCategory(description: string): string {
    const desc = description.toLowerCase()
    
    const patterns: Record<string, string> = {
      'supermercado|mercado|hortifruti|açougue': 'Alimentação',
      'uber|99|taxi|combustível|gasolina|posto': 'Transporte',
      'farmácia|drogaria|hospital|clínica|médico': 'Saúde',
      'netflix|spotify|amazon|prime|streaming': 'Assinaturas',
      'restaurante|lanchonete|pizzaria|ifood|delivery': 'Alimentação',
      'academia|gym|esporte': 'Saúde',
      'livro|curso|faculdade|escola': 'Educação'
    }
    
    for (const [pattern, category] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(desc)) {
        return category
      }
    }
    
    return 'Outros'
  }
  
  private extractCardLast4(text: string): string | undefined {
    // Tenta extrair últimos 4 dígitos do cartão do cabeçalho
    const match = text.match(/cart[ãa]o[:\s]*\*+(\d{4})/i)
    return match ? match[1] : undefined
  }
  
  private extractPeriod(transactions: ParsedTransaction[]): string {
    if (transactions.length === 0) return ''
    
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime())
    const firstDate = dates[0]
    const lastDate = dates[dates.length - 1]
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    }
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
  }
  
  private async readFileChunk(file: File, bytes: number): Promise<string> {
    const blob = file.slice(0, bytes)
    return await blob.text()
  }
}
