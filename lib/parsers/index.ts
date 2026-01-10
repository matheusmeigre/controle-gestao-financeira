import { NubankParser } from './nubank-parser'
import { InterParser } from './inter-parser'
import { GenericOFXParser } from './generic-ofx'
import type { InvoiceParser, ParseResult, ParserConfig } from './types'

/**
 * Parser Factory - Strategy Pattern Implementation
 * 
 * Responsável por:
 * 1. Registrar todos os parsers disponíveis
 * 2. Detectar automaticamente qual parser usar
 * 3. Processar arquivos de fatura
 * 
 * Para adicionar um novo banco:
 * 1. Crie uma classe que implemente InvoiceParser
 * 2. Adicione-a ao array PARSERS abaixo
 */

export class InvoiceParserFactory {
  private static readonly PARSERS: ParserConfig[] = [
    {
      type: 'nubank',
      parser: new NubankParser(),
      supportedExtensions: ['.csv'],
      priority: 100, // Alta prioridade - teste primeiro
    },
    {
      type: 'inter',
      parser: new InterParser(),
      supportedExtensions: ['.csv'],
      priority: 90,
    },
    {
      type: 'generic-ofx',
      parser: new GenericOFXParser(),
      supportedExtensions: ['.ofx', '.qfx'],
      priority: 50, // Menor prioridade - testa por último
    },
  ]
  
  /**
   * Detecta automaticamente e processa o arquivo
   */
  static async parseInvoice(file: File): Promise<ParseResult> {
    // Validação inicial
    const validationError = this.validateFile(file)
    if (validationError) {
      return {
        success: false,
        transactions: [],
        errors: [validationError]
      }
    }
    
    // Ordena parsers por prioridade (maior primeiro)
    const sortedParsers = [...this.PARSERS].sort((a, b) => b.priority - a.priority)
    
    // Tenta cada parser em ordem de prioridade
    for (const config of sortedParsers) {
      try {
        const canParse = await config.parser.canParse(file)
        if (canParse) {
          console.log(`[ParserFactory] Usando parser: ${config.parser.name}`)
          return await config.parser.parse(file)
        }
      } catch (error) {
        console.error(`[ParserFactory] Erro ao testar parser ${config.parser.name}:`, error)
        continue
      }
    }
    
    // Nenhum parser compatível encontrado
    return {
      success: false,
      transactions: [],
      errors: [
        'Formato de arquivo não reconhecido.',
        `Extensão: ${this.getFileExtension(file.name)}`,
        'Formatos suportados: CSV (Nubank, Inter), OFX/QFX (Genérico)'
      ]
    }
  }
  
  /**
   * Retorna parser específico por tipo
   */
  static getParser(type: ParserConfig['type']): InvoiceParser | null {
    const config = this.PARSERS.find(p => p.type === type)
    return config ? config.parser : null
  }
  
  /**
   * Lista todos os parsers disponíveis
   */
  static getAvailableParsers(): ParserConfig[] {
    return [...this.PARSERS]
  }
  
  /**
   * Valida arquivo antes de processar
   */
  private static validateFile(file: File): string | null {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    
    if (!file) {
      return 'Nenhum arquivo fornecido'
    }
    
    if (file.size === 0) {
      return 'Arquivo vazio'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande (máximo ${MAX_FILE_SIZE / 1024 / 1024}MB)`
    }
    
    const extension = this.getFileExtension(file.name)
    const supportedExtensions = this.PARSERS.flatMap(p => p.supportedExtensions)
    
    if (!supportedExtensions.includes(extension)) {
      return `Extensão não suportada: ${extension}`
    }
    
    return null
  }
  
  private static getFileExtension(filename: string): string {
    const parts = filename.toLowerCase().split('.')
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
  }
}

// Export convenience function
export async function parseInvoiceFile(file: File): Promise<ParseResult> {
  return InvoiceParserFactory.parseInvoice(file)
}

// Export types
export type { ParseResult, ParsedTransaction, InvoiceParser } from './types'
