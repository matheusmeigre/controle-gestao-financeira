import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'

/**
 * Parser para faturas em PDF - Versão Melhorada
 * 
 * Suporta extração de texto de PDFs de bancos brasileiros
 * Usa múltiplas estratégias de regex para identificar transações
 * Inclui validações e tratamento robusto de erros
 */
export class PDFParser implements InvoiceParser {
  name = 'PDF Parser (Enhanced)'
  
  // Padrões de regex mais robustos
  private readonly DATE_PATTERNS = [
    // DD/MM/YYYY
    /(\d{2})\/(\d{2})\/(\d{4})/g,
    // DD/MM/YY
    /(\d{2})\/(\d{2})\/(\d{2})/g,
    // DD/MM
    /(\d{2})\/(\d{2})(?!\/)/g,
  ]
  
  private readonly VALUE_PATTERNS = [
    // R$ 1.234,56 ou R$1.234,56
    /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    // 1.234,56 (sem símbolo)
/(?<!\d)(\d{1,3}(?:\.\d{3})*,\d{2})(?!\d)/g,
  ]
  
  private readonly AMOUNT_INDICATORS = [
    'R$', 'RS', 'BRL', 'VALOR', 'TOTAL'
  ]
  
  async canParse(file: File): Promise<boolean> {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  }
  
  async parse(file: File): Promise<ParseResult> {
    try {
      console.log('[PDFParser] Iniciando processamento de PDF:', file.name)
      
      // Lê o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Converte para texto (extração básica)
      const text = await this.extractTextFromPDF(arrayBuffer)
      
      console.log('[PDFParser] Texto extraído, tamanho:', text.length)
      console.log('[PDFParser] Primeiros 500 caracteres:', text.substring(0, 500))
      
      if (text.length < 100) {
        return {
          success: false,
          transactions: [],
          errors: [
            'PDF parece estar vazio ou criptografado.',
            'Tente exportar o PDF novamente do app do banco.',
            'Verifique se o PDF não está protegido por senha.'
          ]
        }
      }
      
      // Detecta banco e extrai transações
      const bankType = this.detectBankType(text)
      console.log('[PDFParser] Banco detectado:', bankType)
      
      const transactions = this.extractTransactions(text, bankType)
      console.log('[PDFParser] Transações extraídas:', transactions.length)
      
      if (transactions.length === 0) {
        return {
          success: false,
          transactions: [],
          errors: [
            'Não foi possível extrair transações do PDF.',
            'Certifique-se de que o PDF contém uma fatura de cartão de crédito.',
            `Banco detectado: ${bankType}`,
            'Tente usar o formato CSV ou OFX se disponível.'
          ]
        }
      }
      
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        success: true,
        transactions,
        metadata: {
          bankName: bankType,
          totalAmount
        },
        errors: [
          'PDF processado com sucesso!',
          `${transactions.length} transações encontradas.`,
          'Revise os dados antes de salvar.'
        ]
      }
    } catch (error) {
      console.error('[PDFParser] Erro:', error)
      return {
        success: false,
        transactions: [],
        errors: [
          'Erro ao processar arquivo PDF',
          error instanceof Error ? error.message : String(error),
          'Tente converter o PDF para texto ou use outro formato.'
        ]
      }
    }
  }
  
  /**
   * Extração melhorada de texto do PDF
   * Tenta múltiplas codificações e limpa melhor o texto
   */
  private async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Tenta UTF-8 primeiro
    let text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
    
    // Se falhar, tenta Latin1
    if (text.includes('�') || text.length < 100) {
      text = new TextDecoder('latin1', { fatal: false }).decode(uint8Array)
    }
    
    // Limpa caracteres de controle mas mantém quebras de linha importantes
    text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    
    // Normaliza espaços mas mantém estrutura de linhas
    text = text.replace(/[ \t]+/g, ' ')
    text = text.replace(/\n\s*\n/g, '\n')
    
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
   * Extrai transações do texto usando múltiplas estratégias
   */
  private extractTransactions(text: string, bankType: string): ParsedTransaction[] {
    console.log('[PDFParser] Iniciando extração de transações')
    
    const transactions: ParsedTransaction[] = []
    const lines = text.split(/\n/)
    
    console.log('[PDFParser] Total de linhas:', lines.length)
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.length < 10) continue
      
      // Tenta extrair transação da linha
      const transaction = this.parseTransactionLine(line, i)
      
      if (transaction) {
        transactions.push(transaction)
        console.log('[PDFParser] Transação encontrada:', transaction.description, transaction.amount)
      }
    }
    
    console.log('[PDFParser] Total transações antes de filtrar:', transactions.length)
    
    // Remove duplicatas e transações inválidas
    const cleaned = this.removeDuplicates(transactions)
    const validated = cleaned.filter(t => this.validateTransaction(t))
    
    console.log('[PDFParser] Total após limpeza:', validated.length)
    
    return validated
  }
  
  /**
   * Tenta extrair transação de uma linha individual
   */
  private parseTransactionLine(line: string, lineIndex: number): ParsedTransaction | null {
    // Ignora linhas de cabeçalho comuns
    const skipKeywords = [
      'TOTAL', 'SALDO', 'PAGAMENTO', 'RESUMO', 'FATURA',
      'VENCIMENTO', 'FECHAMENTO', 'LIMITE', 'CARTÃO',
      'DATA', 'DESCRIÇÃO', 'VALOR', 'ESTABELECIMENTO'
    ]
    
    if (skipKeywords.some(keyword => line.toUpperCase().includes(keyword) && line.length < 50)) {
      return null
    }
    
    // Procura data na linha
    let date: Date | null = null
    let dateStr = ''
    
    for (const pattern of this.DATE_PATTERNS) {
      const match = pattern.exec(line)
      if (match) {
        date = this.parseDate(match[0])
        dateStr = match[0]
        pattern.lastIndex = 0 // Reset regex
        break
      }
    }
    
    if (!date) return null
    
    // Procura valor na linha
    let amount = 0
    let amountStr = ''
    
    for (const pattern of this.VALUE_PATTERNS) {
      const matches = Array.from(line.matchAll(pattern))
      if (matches.length > 0) {
        // Pega o último valor na linha (geralmente o correto)
        const lastMatch = matches[matches.length - 1]
        amountStr = lastMatch[1] || lastMatch[0]
        amount = this.parseAmount(amountStr)
        break
      }
    }
    
    if (amount <= 0 || amount > 1000000) return null
    
    // Extrai descrição (texto entre data e valor)
    let description = line
    if (dateStr) {
      description = description.replace(dateStr, '')
    }
    if (amountStr) {
      const amountIndex = description.lastIndexOf(amountStr)
      if (amountIndex > 0) {
        description = description.substring(0, amountIndex)
      }
    }
    
    // Limpa descrição
    description = description
      .replace(/R\$?\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (description.length < 3 || description.length > 200) {
      return null
    }
    
    return {
      date,
      description,
      amount,
      category: this.categorizeTransaction(description)
    }
  }
  
  /**
   * Parse flexível de datas
   */
  private parseDate(dateStr: string): Date | null {
    const parts = dateStr.split('/')
    
    if (parts.length >= 2) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      let year = new Date().getFullYear()
      
      if (parts.length === 3) {
        year = parseInt(parts[2])
        if (year < 100) {
          year += 2000
        }
      }
      
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        return new Date(year, month, day)
      }
    }
    
    return null
  }
  
  /**
   * Parse de valores monetários brasileiros
   */
  private parseAmount(amountStr: string): number {
    // Remove R$, espaços, e converte pontos e vírgulas
    const cleaned = amountStr
      .replace(/R\$?\s*/gi, '')
      .replace(/\./g, '')
      .replace(',', '.')
    
    const amount = parseFloat(cleaned)
    return isNaN(amount) ? 0 : amount
  }
  
  /**
   * Valida se transação é plausível
   */
  private validateTransaction(t: ParsedTransaction): boolean {
    if (!t.date || isNaN(t.date.getTime())) return false
    if (t.amount <= 0 || t.amount > 1000000) return false
    if (!t.description || t.description.length < 3) return false
    
    // Data não pode ser muito antiga ou no futuro
    const now = new Date()
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    const oneMonthAhead = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    
    if (t.date < twoYearsAgo || t.date > oneMonthAhead) return false
    
    return true
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
