import { z } from 'zod'

/**
 * ====================================
 * 🔍 OCR Service - Integração com API Externa
 * ====================================
 * 
 * Serviço responsável por integrar com a API OCR hospedada em:
 * https://ocr-api-leitura-financas.onrender.com
 * 
 * ⚠️ IMPORTANTE: Este serviço só deve ser usado no servidor (Server Actions)
 * Nunca exponha chamadas diretas à API OCR no client-side
 * 
 * Funcionalidades:
 * - Validação de entrada com Zod
 * - Upload seguro de PDFs
 * - Tratamento robusto de erros
 * - Timeout configurável
 * - Normalização de dados financeiros
 */

// ====================================
// 📋 Schemas de Validação
// ====================================

/**
 * Schema para um item individual extraído pela OCR
 */
const ocrItemSchema = z.object({
  descricao: z.string(),
  valor: z.number(),
  data: z.string(), // ISO date string
})

/**
 * Schema completo da resposta da API OCR
 */
const ocrResponseSchema = z.object({
  success: z.boolean(),
  document_type: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  raw_text: z.string().optional(),
  data: z.object({
    empresa: z.string().optional(),
    cnpj: z.string().optional(),
    data_emissao: z.string().optional(),
    data_vencimento: z.string().optional(),
    valor_total: z.number().optional(),
    moeda: z.string().optional().default('BRL'),
    itens: z.array(ocrItemSchema).optional().default([]),
  }).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

/**
 * Tipos TypeScript derivados dos schemas
 */
export type OcrItem = z.infer<typeof ocrItemSchema>
export type OcrResponse = z.infer<typeof ocrResponseSchema>

/**
 * Resultado processado e normalizado do OCR
 */
export interface OcrProcessedResult {
  success: boolean
  data?: {
    bankName: string
    totalAmount: number
    confidence: number
    issuedDate?: Date
    dueDate?: Date
    currency: string
    items: Array<{
      date: Date
      description: string
      amount: number
    }>
    rawText?: string
  }
  error?: string
  warnings?: string[]
}

// ====================================
// 🔧 Configuração
// ====================================

const OCR_API_CONFIG = {
  baseUrl: 'https://ocr-api-leitura-financas.onrender.com',
  endpoint: '/extract',
  timeout: 90000, // 90 segundos - APIs OCR podem ser lentas
  minConfidence: 0.7, // Confiança mínima aceitável
  maxFileSize: 10 * 1024 * 1024, // 10MB
} as const

// ====================================
// 🚀 Serviço Principal
// ====================================

export class OcrService {
  /**
   * Processa um PDF usando a API OCR
   * 
   * @param file - Arquivo PDF para processar
   * @returns Resultado processado e normalizado
   */
  static async processInvoicePdf(file: File): Promise<OcrProcessedResult> {
    try {
      // 1. Validações iniciais
      const validationError = this.validateFile(file)
      if (validationError) {
        return {
          success: false,
          error: validationError,
        }
      }

      console.log('[OcrService] Enviando PDF para OCR:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`)

      // 2. Envia para API OCR
      const rawResponse = await this.callOcrApi(file)

      // 3. Valida resposta com Zod
      const validatedResponse = ocrResponseSchema.parse(rawResponse)

      // 4. Verifica sucesso na resposta
      if (!validatedResponse.success) {
        return {
          success: false,
          error: validatedResponse.error || validatedResponse.message || 'OCR falhou sem mensagem de erro',
        }
      }

      // 5. Verifica se há dados
      if (!validatedResponse.data || !validatedResponse.data.itens || validatedResponse.data.itens.length === 0) {
        return {
          success: false,
          error: 'OCR não extraiu nenhuma transação do PDF',
          warnings: [
            'O PDF pode estar vazio, com baixa qualidade ou em formato não suportado',
            'Tente usar um PDF exportado diretamente do aplicativo do banco',
          ],
        }
      }

      // 6. Normaliza e retorna dados
      return this.normalizeOcrResponse(validatedResponse)

    } catch (error) {
      console.error('[OcrService] Erro ao processar PDF:', error)

      // Tratamento específico de erros
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Resposta da API OCR está em formato inválido',
          warnings: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        }
      }

      if (error instanceof Error) {
        // Timeout ou erro de rede
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: A API OCR demorou muito para responder',
            warnings: [
              'A API pode estar sobrecarregada',
              'Tente novamente em alguns instantes',
            ],
          }
        }

        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: 'Erro desconhecido ao processar PDF com OCR',
      }
    }
  }

  /**
   * Valida o arquivo antes de enviar
   */
  private static validateFile(file: File): string | null {
    // Verifica tipo
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Apenas arquivos PDF são suportados pelo OCR'
    }

    // Verifica tamanho
    if (file.size > OCR_API_CONFIG.maxFileSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const maxMB = (OCR_API_CONFIG.maxFileSize / (1024 * 1024)).toFixed(0)
      return `Arquivo muito grande (${sizeMB}MB). Máximo permitido: ${maxMB}MB`
    }

    // Verifica se não está vazio
    if (file.size === 0) {
      return 'Arquivo PDF está vazio'
    }

    return null
  }

  /**
   * Chama a API OCR com tratamento de timeout
   */
  private static async callOcrApi(file: File): Promise<unknown> {
    // Cria FormData
    const formData = new FormData()
    formData.append('file', file)

    // Cria AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), OCR_API_CONFIG.timeout)

    try {
      const response = await fetch(`${OCR_API_CONFIG.baseUrl}${OCR_API_CONFIG.endpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Não define Content-Type - deixa o browser definir com boundary correto
      })

      clearTimeout(timeoutId)

      // Verifica status HTTP
      if (!response.ok) {
        let errorMessage = `API OCR retornou erro ${response.status}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // Ignora erro ao parsear JSON de erro
        }

        throw new Error(errorMessage)
      }

      // Parse JSON
      const data = await response.json()
      return data

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Normaliza a resposta da OCR para o formato esperado pela aplicação
   */
  private static normalizeOcrResponse(response: OcrResponse): OcrProcessedResult {
    const { data, confidence = 0, raw_text } = response

    if (!data) {
      return {
        success: false,
        error: 'Dados não encontrados na resposta da OCR',
      }
    }

    const warnings: string[] = []

    // Verifica confiança
    if (confidence < OCR_API_CONFIG.minConfidence) {
      warnings.push(
        `⚠️ Confiança baixa (${(confidence * 100).toFixed(0)}%). Revise os dados cuidadosamente antes de salvar.`
      )
    }

    // Normaliza itens
    const items = (data.itens || []).map(item => ({
      date: this.parseDate(item.data),
      description: this.normalizeDescription(item.descricao),
      amount: Math.abs(item.valor), // Garante valor positivo
    }))

    // Calcula total (ou usa o total da API se disponível)
    const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0)
    const totalAmount = data.valor_total || calculatedTotal

    // Aviso se total divergir
    if (data.valor_total && Math.abs(data.valor_total - calculatedTotal) > 0.01) {
      warnings.push(
        `Total da fatura (R$ ${totalAmount.toFixed(2)}) difere da soma dos itens (R$ ${calculatedTotal.toFixed(2)})`
      )
    }

    return {
      success: true,
      data: {
        bankName: data.empresa || 'Banco não identificado',
        totalAmount,
        confidence,
        issuedDate: data.data_emissao ? this.parseDate(data.data_emissao) : undefined,
        dueDate: data.data_vencimento ? this.parseDate(data.data_vencimento) : undefined,
        currency: data.moeda || 'BRL',
        items,
        rawText: raw_text,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Parseia string de data para Date
   * Suporta: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
   */
  private static parseDate(dateStr: string): Date {
    // Remove espaços
    const cleaned = dateStr.trim()

    // Tenta ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
      return new Date(cleaned)
    }

    // Tenta DD/MM/YYYY ou DD-MM-YYYY
    const match = cleaned.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/)
    if (match) {
      const [, day, month, year] = match
      return new Date(`${year}-${month}-${day}`)
    }

    // Fallback: tenta parse direto
    const date = new Date(cleaned)
    if (!isNaN(date.getTime())) {
      return date
    }

    // Se falhar, retorna data atual
    console.warn('[OcrService] Não foi possível parsear data:', dateStr)
    return new Date()
  }

  /**
   * Normaliza descrição de transação
   * - Remove espaços extras
   * - Capitaliza primeira letra
   * - Remove caracteres especiais problemáticos
   */
  private static normalizeDescription(description: string): string {
    return description
      .trim()
      .replace(/\s+/g, ' ') // Remove espaços duplicados
      .replace(/[^\w\sÀ-ÿ\-\/\*]/gi, '') // Remove caracteres especiais exceto acentos, hífen, barra e asterisco
      .substring(0, 200) // Limita tamanho
  }

  /**
   * Verifica se a API OCR está disponível
   * Útil para health checks
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${OCR_API_CONFIG.baseUrl}/docs`, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok

    } catch {
      return false
    }
  }
}
