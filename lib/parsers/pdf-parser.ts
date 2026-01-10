import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'

/**
 * Parser para faturas em PDF
 * 
 * Suporta extração de texto de PDFs de bancos brasileiros
 * Usa técnicas de regex para identificar transações
 */
export class PDFParser implements InvoiceParser {
  name = 'PDF Parser'
  
  async canParse(file: File): Promise<boolean> {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  }
  
  async parse(file: File): Promise<ParseResult> {
    try {
      // Lê o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Converte para texto (extração básica)
      const text = await this.extractTextFromPDF(arrayBuffer)
      
      // Detecta banco e extrai transações
      const bankType = this.detectBankType(text)
      const transactions = this.extractTransactions(text, bankType)
      
      if (transactions.length === 0) {
        return {
          success: false,
          transactions: [],
          errors: [
            'Não foi possível extrair transações do PDF.',
            'Certifique-se de que o PDF contém dados de fatura de cartão de crédito.'
          ]
        }
      }
      
      return {
        success: true,
        transactions,
        metadata: {
          bankName: bankType,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
        },
        errors: [
          'Extração de PDF pode não capturar todos os dados.',
          'Revise as transações antes de salvar.'
        ]
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        errors: [
          'Erro ao processar arquivo PDF',
          error instanceof Error ? error.message : String(error)
        ]
      }
    }
  }
  
  /**
   * Extração básica de texto do PDF
   * Para produção, usar biblioteca como pdf-parse ou pdfjs-dist
   */
  private async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    // Conversão básica do buffer para string
    const uint8Array = new Uint8Array(arrayBuffer)
    const decoder = new TextDecoder('utf-8', { fatal: false })
    let text = decoder.decode(uint8Array)
    
    // Remove caracteres de controle e normaliza
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    text = text.replace(/\s+/g, ' ')
    
    return text
  }
  
  /**
   * Detecta o banco baseado no conteúdo do PDF
   */
  private detectBankType(text: string): string {
    const textLower = text.toLowerCase()
    
    if (textLower.includes('nubank') || textLower.includes('nu pagamentos')) {
      return 'Nubank'
    }
    if (textLower.includes('banco inter') || textLower.includes('inter.co')) {
      return 'Inter'
    }
    if (textLower.includes('itaú') || textLower.includes('itau')) {
      return 'Itaú'
    }
    if (textLower.includes('bradesco')) {
      return 'Bradesco'
    }
    if (textLower.includes('santander')) {
      return 'Santander'
    }
    if (textLower.includes('banco do brasil') || textLower.includes('bb.com.br')) {
      return 'Banco do Brasil'
    }
    if (textLower.includes('caixa') || textLower.includes('cef')) {
      return 'Caixa Econômica'
    }
    
    return 'Banco Desconhecido'
  }
  
  /**
   * Extrai transações do texto usando regex
   */
  private extractTransactions(text: string, bankType: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    
    // Padrões comuns de data em faturas brasileiras
    // Formato: DD/MM/YYYY ou DD/MM
    const datePattern = /(\d{2}\/\d{2}(?:\/\d{4})?)/g
    
    // Padrão de valor em Real: R$ 1.234,56 ou 1.234,56
    const amountPattern = /R?\$?\s*([\d.]+,\d{2})/g
    
    // Divide o texto em linhas
    const lines = text.split(/\n|\r\n/)
    
    let currentDate: Date | null = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Tenta extrair data
      const dateMatch = line.match(/(\d{2})\/(\d{2})(?:\/(\d{4}))?/)
      if (dateMatch) {
        const day = parseInt(dateMatch[1])
        const month = parseInt(dateMatch[2]) - 1
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear()
        currentDate = new Date(year, month, day)
      }
      
      // Tenta extrair valor
      const amountMatch = line.match(/R?\$?\s*([\d.]+,\d{2})/)
      if (amountMatch && currentDate) {
        const amountStr = amountMatch[1].replace(/\./g, '').replace(',', '.')
        const amount = parseFloat(amountStr)
        
        if (amount > 0) {
          // Extrai descrição (texto antes do valor)
          let description = line.substring(0, line.indexOf(amountMatch[0])).trim()
          
          // Remove data da descrição se existir
          if (dateMatch) {
            description = description.replace(dateMatch[0], '').trim()
          }
          
          // Remove caracteres especiais e espaços extras
          description = description.replace(/\s+/g, ' ').trim()
          
          if (description.length > 3) {
            transactions.push({
              date: new Date(currentDate),
              description: description.substring(0, 200), // Limita tamanho
              amount,
              category: this.categorizeTransaction(description),
            })
          }
        }
      }
    }
    
    // Remove duplicatas
    return this.removeDuplicates(transactions)
  }
  
  /**
   * Categoriza transação baseada na descrição
   */
  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase()
    
    if (desc.includes('uber') || desc.includes('99') || desc.includes('taxi')) {
      return 'Transporte'
    }
    if (desc.includes('ifood') || desc.includes('restaurante') || desc.includes('lanchonete')) {
      return 'Alimentação'
    }
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('padaria')) {
      return 'Mercado'
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('amazon prime')) {
      return 'Assinaturas'
    }
    if (desc.includes('farmacia') || desc.includes('drogaria')) {
      return 'Saúde'
    }
    if (desc.includes('gasolina') || desc.includes('posto')) {
      return 'Combustível'
    }
    
    return 'Outros'
  }
  
  /**
   * Remove transações duplicadas
   */
  private removeDuplicates(transactions: ParsedTransaction[]): ParsedTransaction[] {
    const seen = new Set<string>()
    return transactions.filter(t => {
      const key = `${t.date.toISOString()}-${t.description}-${t.amount}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
