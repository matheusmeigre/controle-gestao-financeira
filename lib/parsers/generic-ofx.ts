import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'

/**
 * Parser genérico para arquivos OFX (Open Financial Exchange)
 * Suportado por diversos bancos brasileiros: Itaú, Bradesco, Santander, etc.
 * 
 * OFX é um formato XML-like usado para troca de dados financeiros
 */
export class GenericOFXParser implements InvoiceParser {
  readonly name = 'Generic OFX Parser'
  
  async canParse(file: File): Promise<boolean> {
    const validExtensions = ['.ofx', '.qfx']
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidExtension || file.size > 10 * 1024 * 1024) {
      return false
    }
    
    try {
      const text = await this.readFileChunk(file, 1000)
      // Verifica se contém tags OFX características
      return text.includes('<OFX>') || text.includes('OFXHEADER')
    } catch {
      return false
    }
  }
  
  async parse(file: File): Promise<ParseResult> {
    const errors: string[] = []
    const transactions: ParsedTransaction[] = []
    
    try {
      const text = await file.text()
      
      // OFX pode ter um header não-XML seguido de conteúdo XML
      const xmlStart = text.indexOf('<OFX>')
      if (xmlStart === -1) {
        return {
          success: false,
          transactions: [],
          errors: ['Arquivo OFX inválido: tag <OFX> não encontrada']
        }
      }
      
      const xmlContent = text.substring(xmlStart)
      
      // Extrai transações usando regex (parsing simplificado)
      const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g
      const matches = xmlContent.matchAll(stmtTrnRegex)
      
      for (const match of matches) {
        try {
          const trnContent = match[1]
          const transaction = this.parseOFXTransaction(trnContent)
          if (transaction) {
            transactions.push(transaction)
          }
        } catch (error) {
          errors.push(`Erro ao processar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }
      
      if (transactions.length === 0) {
        errors.push('Nenhuma transação encontrada no arquivo OFX')
      }
      
      const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        success: transactions.length > 0,
        transactions,
        errors,
        metadata: {
          bankName: this.extractBankName(xmlContent),
          totalAmount,
          statementPeriod: this.extractPeriod(transactions)
        }
      }
    } catch (error) {
      return {
        success: false,
        transactions: [],
        errors: [`Erro ao processar arquivo OFX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }
    }
  }
  
  private parseOFXTransaction(content: string): ParsedTransaction | null {
    // Extrai campos do OFX
    const extractTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]*)<\/${tag}>`, 'i')
      const match = content.match(regex)
      return match ? match[1].trim() : ''
    }
    
    // DTPOSTED: Data da transação (formato: YYYYMMDD ou YYYYMMDDHHMMSS)
    const dateStr = extractTag('DTPOSTED')
    const date = this.parseOFXDate(dateStr)
    if (!date) {
      throw new Error(`Data inválida: ${dateStr}`)
    }
    
    // TRNAMT: Valor da transação (negativo para débitos)
    const amountStr = extractTag('TRNAMT')
    const amount = parseFloat(amountStr)
    if (isNaN(amount)) {
      throw new Error(`Valor inválido: ${amountStr}`)
    }
    
    // Ignora créditos (valores positivos) em faturas de cartão
    if (amount > 0) {
      return null
    }
    
    // MEMO ou NAME: Descrição da transação
    const description = extractTag('MEMO') || extractTag('NAME') || 'Transação sem descrição'
    
    // TRNTYPE: Tipo de transação (DEBIT, CREDIT, etc.)
    const trnType = extractTag('TRNTYPE')
    
    return {
      date,
      description: description.trim(),
      amount: Math.abs(amount),
      category: 'Outros',
      rawData: {
        trnType,
        originalAmount: amount,
        fitId: extractTag('FITID')
      }
    }
  }
  
  private parseOFXDate(dateStr: string): Date | null {
    // OFX date format: YYYYMMDD[HHMMSS[.XXX[TZ]]]
    if (!dateStr || dateStr.length < 8) return null
    
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6))
    const day = parseInt(dateStr.substring(6, 8))
    
    const date = new Date(year, month - 1, day)
    return isNaN(date.getTime()) ? null : date
  }
  
  private extractBankName(xmlContent: string): string {
    // Tenta extrair o nome do banco do OFX
    const orgMatch = xmlContent.match(/<ORG>([^<]+)<\/ORG>/i)
    if (orgMatch) return orgMatch[1]
    
    const fidMatch = xmlContent.match(/<FID>([^<]+)<\/FID>/i)
    if (fidMatch) return `Banco (FID: ${fidMatch[1]})`
    
    return 'Banco Genérico'
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
