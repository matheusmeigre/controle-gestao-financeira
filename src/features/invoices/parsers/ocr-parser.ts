import type { InvoiceParser, ParseResult, ParsedTransaction } from './types'
import { OcrService } from '@/lib/services/ocr-service'

/**
 * ====================================
 * 🤖 OCR Parser - Extração Inteligente de Faturas via API
 * ====================================
 * 
 * Este parser utiliza uma API OCR externa para extrair dados de PDFs de fatura
 * de forma automática e inteligente, sem necessidade de regex ou templates.
 * 
 * Benefícios:
 * - Funciona com qualquer banco brasileiro
 * - Não precisa de templates específicos
 * - Extrai dados estruturados automaticamente
 * - Alta taxa de acerto (confidence score)
 * 
 * API utilizada: https://ocr-api-leitura-financas.onrender.com
 * 
 * ⚠️ IMPORTANTE:
 * - Este parser SÓ funciona no servidor (Server Actions)
 * - Nunca chamar diretamente do client-side
 * - Requer conexão com internet
 * - Pode ter latência devido ao processamento OCR
 */

export class OcrParser implements InvoiceParser {
  name = 'OCR Parser (AI-Powered)'

  /**
   * Verifica se pode processar o arquivo
   * OCR Parser aceita apenas PDFs
   */
  async canParse(file: File): Promise<boolean> {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    
    if (!isPdf) {
      return false
    }

    // Verifica tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      console.warn('[OcrParser] Arquivo muito grande:', file.size, 'bytes')
      return false
    }

    // Verifica se não está vazio
    if (file.size === 0) {
      console.warn('[OcrParser] Arquivo vazio')
      return false
    }

    console.log('[OcrParser] Arquivo válido para OCR:', file.name)
    return true
  }

  /**
   * Processa o PDF usando OCR e retorna transações estruturadas
   */
  async parse(file: File): Promise<ParseResult> {
    console.log('[OcrParser] Iniciando processamento OCR:', file.name)

    try {
      // Chama serviço OCR
      const ocrResult = await OcrService.processInvoicePdf(file)

      // Se OCR falhou, retorna erro
      if (!ocrResult.success || !ocrResult.data) {
        return {
          success: false,
          transactions: [],
          errors: [
            ocrResult.error || 'OCR falhou ao processar o PDF',
            ...(ocrResult.warnings || []),
          ],
        }
      }

      // Converte itens OCR para transações
      const transactions: ParsedTransaction[] = ocrResult.data.items.map((item, index) => ({
        date: item.date,
        description: item.description,
        amount: item.amount,
        category: this.categorizeTransaction(item.description),
        rawData: {
          ocrIndex: index,
          confidence: ocrResult.data!.confidence,
          rawDescription: item.description,
        },
      }))

      console.log('[OcrParser] ✅ Sucesso! Transações extraídas:', transactions.length)

      // Calcula mês e ano de referência baseado nas datas
      let referenceMonth: number | undefined
      let referenceYear: number | undefined
      
      if (ocrResult.data.issuedDate) {
        referenceMonth = ocrResult.data.issuedDate.getMonth() + 1
        referenceYear = ocrResult.data.issuedDate.getFullYear()
      } else if (ocrResult.data.dueDate) {
        // Se não tem data de emissão, usa o mês anterior ao vencimento
        const dueDate = ocrResult.data.dueDate
        referenceMonth = dueDate.getMonth() // Mês anterior
        referenceYear = dueDate.getFullYear()
        
        if (referenceMonth === 0) {
          referenceMonth = 12
          referenceYear--
        }
      }

      // Monta resultado
      const result: ParseResult = {
        success: true,
        transactions,
        metadata: {
          bankName: ocrResult.data.bankName,
          totalAmount: ocrResult.data.totalAmount,
          statementPeriod: this.formatStatementPeriod(ocrResult.data.issuedDate, ocrResult.data.dueDate),
          // Adiciona datas extraídas
          closingDate: ocrResult.data.issuedDate?.toISOString(),
          dueDate: ocrResult.data.dueDate?.toISOString(),
          referenceMonth,
          referenceYear,
        },
        errors: [],
      }

      // Adiciona warnings se houver
      if (ocrResult.warnings && ocrResult.warnings.length > 0) {
        result.errors = [
          `✅ OCR processado com sucesso (${transactions.length} transações)`,
          '',
          ...ocrResult.warnings,
          '',
          '👉 Revise os dados antes de salvar',
        ]
      } else {
        result.errors = [
          `✅ OCR processado com ${(ocrResult.data.confidence * 100).toFixed(0)}% de confiança`,
          `📊 ${transactions.length} transações extraídas`,
          `💰 Total: R$ ${ocrResult.data.totalAmount.toFixed(2)}`,
          `🏦 Banco: ${ocrResult.data.bankName}`,
        ]
      }

      return result

    } catch (error) {
      console.error('[OcrParser] Erro inesperado:', error)

      return {
        success: false,
        transactions: [],
        errors: [
          'Erro inesperado ao processar PDF com OCR',
          error instanceof Error ? error.message : String(error),
          '',
          '💡 Dicas:',
          '- Certifique-se de que o PDF é uma fatura válida',
          '- Tente exportar o PDF novamente do app do banco',
          '- Verifique sua conexão com internet',
        ],
      }
    }
  }

  /**
   * Categoriza transação baseado na descrição
   * Esta é uma categorização básica - pode ser melhorada com ML/LLM no futuro
   */
  private categorizeTransaction(description: string): string {
    const descLower = description.toLowerCase()

    // Alimentação
    if (descLower.match(/restaurante|lanchonete|padaria|cafe|coffee|bar|pizzaria|hamburger|ifood|uber\s*eats|rappi/)) {
      return 'Alimentação'
    }

    // Supermercado
    if (descLower.match(/supermercado|mercado|hortifruti|açougue|pão de açúcar|carrefour|extra/)) {
      return 'Supermercado'
    }

    // Transporte
    if (descLower.match(/uber|99|taxi|combustivel|posto|gasolina|etanol|diesel|estacionamento|pedágio/)) {
      return 'Transporte'
    }

    // Saúde
    if (descLower.match(/farmacia|drogaria|medic|hospital|clinica|laboratorio|consulta/)) {
      return 'Saúde'
    }

    // Educação
    if (descLower.match(/livraria|faculdade|escola|curso|udemy|coursera|alura/)) {
      return 'Educação'
    }

    // Entretenimento
    if (descLower.match(/cinema|teatro|show|spotify|netflix|amazon\s*prime|disney|hbo|youtube|gaming|steam/)) {
      return 'Entretenimento'
    }

    // Vestuário
    if (descLower.match(/loja\s*de\s*roupa|vestuario|moda|calcado|sapato|tenis|nike|adidas|zara|c&a/)) {
      return 'Vestuário'
    }

    // Moradia
    if (descLower.match(/aluguel|condominio|iptu|luz|energia|agua|gas|internet|telefone/)) {
      return 'Moradia'
    }

    // Serviços
    if (descLower.match(/seguro|banco|taxa|tarifa|juros|servico|manutencao/)) {
      return 'Serviços'
    }

    // Default
    return 'Outros'
  }

  /**
   * Formata período da fatura para exibição
   */
  private formatStatementPeriod(issuedDate?: Date, dueDate?: Date): string {
    if (!issuedDate && !dueDate) {
      return 'Período não identificado'
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    if (issuedDate && dueDate) {
      return `${formatDate(issuedDate)} - ${formatDate(dueDate)}`
    }

    if (dueDate) {
      return `Vencimento: ${formatDate(dueDate)}`
    }

    if (issuedDate) {
      return `Emissão: ${formatDate(issuedDate)}`
    }

    return 'Período não identificado'
  }
}
