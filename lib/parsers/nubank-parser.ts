import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'

/**
 * Parser para faturas do Nubank (CSV)
 * 
 * Formato esperado do CSV Nubank:
 * date,category,title,amount
 * 2024-01-15,outros,"Compra Loja XYZ",-150.00
 * 
 * IMPORTANTE: Nubank usa valores negativos para débitos
 */
export class NubankParser implements InvoiceParser {
  readonly name = 'Nubank CSV Parser'
  
  private readonly EXPECTED_HEADERS = ['date', 'category', 'title', 'amount']
  
  async canParse(file: File): Promise<boolean> {
    // Valida extensão
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return false
    }
    
    // Valida tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return false
    }
    
    try {
      // Lê as primeiras linhas para validar estrutura
      const text = await this.readFileChunk(file, 500)
      const lines = text.split('\n')
      
      if (lines.length < 2) return false
      
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      
      // Verifica se contém os headers esperados do Nubank
      return this.EXPECTED_HEADERS.every(expected => 
        headers.some(header => header.includes(expected))
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
      
      // Pula o header
      const dataLines = lines.slice(1)
      
      for (let i = 0; i < dataLines.length; i++) {
        try {
          const transaction = this.parseNubankLine(dataLines[i], i + 2)
          if (transaction) {
            transactions.push(transaction)
          }
        } catch (error) {
          errors.push(`Linha ${i + 2}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }
      
      // Calcula total
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        success: errors.length === 0 || transactions.length > 0,
        transactions,
        errors,
        metadata: {
          bankName: 'Nubank',
          totalAmount,
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
  
  private parseNubankLine(line: string, lineNumber: number): ParsedTransaction | null {
    // Regex para fazer parse de CSV com campos entre aspas
    const regex = /(?:^|,)("(?:[^"]|"")*"|[^,]*)/g
    const fields: string[] = []
    let match
    
    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined && match[1] !== '') {
        // Remove aspas e espaços
        let field = match[1].replace(/^"|"$/g, '').trim()
        fields.push(field)
      }
    }
    
    if (fields.length < 4) {
      throw new Error('Número insuficiente de campos')
    }
    
    const [dateStr, category, description, amountStr] = fields
    
    // Parse date (formato: YYYY-MM-DD)
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${dateStr}`)
    }
    
    // Parse amount - Nubank usa valores negativos para débitos
    const amount = parseFloat(amountStr.replace(',', '.'))
    if (isNaN(amount)) {
      throw new Error(`Valor inválido: ${amountStr}`)
    }
    
    // Converte para valor absoluto (sempre positivo nas faturas)
    const absoluteAmount = Math.abs(amount)
    
    // Ignora valores positivos (créditos/estornos) - pode ser configurado
    if (amount > 0) {
      return null
    }
    
    // Detecta parcelamento na descrição
    const installmentMatch = description.match(/(\d+)\/(\d+)/);
    const installment = installmentMatch ? `${installmentMatch[1]}/${installmentMatch[2]}` : undefined
    
    return {
      date,
      description: description.trim(),
      amount: absoluteAmount,
      category: this.mapNubankCategory(category),
      installment,
      rawData: {
        originalAmount: amount,
        lineNumber
      }
    }
  }
  
  private mapNubankCategory(nubankCategory: string): string {
    const categoryMap: Record<string, string> = {
      'casa': 'Casa',
      'alimentação': 'Alimentação',
      'transporte': 'Transporte',
      'saúde': 'Saúde',
      'lazer': 'Lazer',
      'educação': 'Educação',
      'compras': 'Compras',
      'serviços': 'Serviços',
      'outros': 'Outros',
      'viagem': 'Viagem',
      'eletrônicos': 'Eletrônicos'
    }
    
    return categoryMap[nubankCategory.toLowerCase()] || 'Outros'
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
