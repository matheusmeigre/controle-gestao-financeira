/**
 * Strategy Pattern: Interface comum para todos os parsers de fatura
 * Cada banco/instituição terá sua própria implementação
 */

export interface ParsedTransaction {
  date: Date
  description: string
  amount: number
  category?: string
  installment?: string
  rawData?: Record<string, unknown> // Dados brutos para debug
}

export interface ParseResult {
  success: boolean
  transactions: ParsedTransaction[]
  errors: string[]
  metadata?: {
    bankName?: string
    cardLast4?: string
    totalAmount?: number
    statementPeriod?: string
  }
}

export interface InvoiceParser {
  /**
   * Identifica se o parser pode processar este arquivo
   */
  canParse(file: File): Promise<boolean>
  
  /**
   * Processa o arquivo e retorna as transações
   */
  parse(file: File): Promise<ParseResult>
  
  /**
   * Nome do parser para identificação
   */
  readonly name: string
}

export type ParserType = 'nubank' | 'inter' | 'pdf' | 'generic-ofx' | 'generic-csv'

export interface ParserConfig {
  type: ParserType
  parser: InvoiceParser
  supportedExtensions: string[]
  priority: number // Parsers com maior prioridade são testados primeiro
}
