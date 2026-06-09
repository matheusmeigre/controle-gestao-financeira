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
  baseUrl: process.env.OCR_API_BASE_URL ?? 'https://ocr-api-leitura-financas.onrender.com',
  endpoint: '/extract',
  healthEndpoint: '/health/ready',
  timeout: 60000, // 60 segundos para primeira requisição (warm-up)
  timeoutSubsequent: 30000, // 30 segundos para requisições subsequentes
  minConfidence: 0.7, // Confiança mínima aceitável
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxRetries: 2, // Número máximo de tentativas em caso de timeout
  retryDelay: 2000, // 2 segundos entre tentativas
  healthCheckTimeout: 5000, // 5 segundos para health check
} as const

// Contador de requisições para ajustar timeout dinamicamente
let requestCount = 0

// ====================================
// 🚀 Serviço Principal
// ====================================

export class OcrService {
  /**
   * Processa um PDF usando a API OCR
   * 
   * @param file - Arquivo PDF para processar
   * @param options - Opções de processamento (timeout, retries)
   * @returns Resultado processado e normalizado
   */
  static async processInvoicePdf(
    file: File,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<OcrProcessedResult> {
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

      // 2. Verifica se API está pronta (health check opcional mas recomendado)
      const isReady = await this.checkApiHealth()
      if (!isReady) {
        console.warn('[OcrService] API OCR não está pronta, aguardando...')
        // Aguarda 2 segundos e tenta novamente
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // 3. Envia para API OCR com retry automático
      const rawResponse = await this.callOcrApiWithRetry(file, options)

      // 4. Valida resposta com Zod
      const validatedResponse = ocrResponseSchema.parse(rawResponse)

      // 4. Verifica sucesso na resposta
      if (!validatedResponse.success) {
        return {
          success: false,
          error: validatedResponse.error || validatedResponse.message || 'OCR falhou sem mensagem de erro',
        }
      }

      // 5. Verifica se há dados
      if (!validatedResponse.data) {
        return {
          success: false,
          error: 'OCR não retornou dados',
          warnings: [
            'O PDF pode estar vazio, com baixa qualidade ou em formato não suportado',
            'Tente usar um PDF exportado diretamente do aplicativo do banco',
          ],
        }
      }

      // 5.1. Se não há itens estruturados, tenta extrair do raw_text
      if (!validatedResponse.data.itens || validatedResponse.data.itens.length === 0) {
        console.log('[OcrService] Itens vazios, tentando extrair do raw_text...')
        
        if (validatedResponse.raw_text) {
          const extractedItems = this.extractTransactionsFromRawText(validatedResponse.raw_text)
          
          if (extractedItems.length > 0) {
            console.log(`[OcrService] ✅ Extraídas ${extractedItems.length} transações do raw_text`)
            validatedResponse.data.itens = extractedItems
          } else {
            console.log('[OcrService] ❌ Não foi possível extrair transações do raw_text')
            return {
              success: false,
              error: 'OCR não extraiu nenhuma transação do PDF',
              warnings: [
                'A API retornou o texto mas não conseguiu estruturar as transações',
                'O formato do PDF pode não ser compatível',
                'Tente usar um PDF exportado diretamente do aplicativo do banco',
              ],
            }
          }
        } else {
          return {
            success: false,
            error: 'OCR não extraiu nenhuma transação do PDF',
            warnings: [
              'O PDF pode estar vazio, com baixa qualidade ou em formato não suportado',
              'Tente usar um PDF exportado diretamente do aplicativo do banco',
            ],
          }
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
        if (error.name === 'AbortError' || error.message.includes('Timeout')) {
          return {
            success: false,
            error: '⏱️ Tempo esgotado ao processar PDF com OCR',
            warnings: [
              'A API OCR pode estar fazendo warm-up (primeira requisição é mais lenta)',
              'Já foi feita retry automática, mas todas as tentativas falharam',
              'Sugestões:',
              '  • Aguarde 30 segundos e tente novamente',
              '  • Verifique sua conexão com a internet',
              '  • Tente com um PDF menor se possível',
            ],
          }
        }

        // Erro de conexão
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return {
            success: false,
            error: '🌐 Erro de conexão com a API OCR',
            warnings: [
              'Não foi possível conectar à API OCR',
              'Verifique sua conexão com a internet',
              'A API pode estar temporariamente indisponível',
            ],
          }
        }

        // Erro HTTP da API
        if (error.message.includes('API OCR retornou erro')) {
          return {
            success: false,
            error: error.message,
            warnings: [
              'A API rejeitou o arquivo',
              'Verifique se o PDF está corrompido ou em formato válido',
              'Tente exportar o PDF novamente do aplicativo do banco',
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
   * Verifica se a API OCR está pronta para processar requisições
   * Usa o endpoint /health/ready implementado na API
   */
  private static async checkApiHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), OCR_API_CONFIG.healthCheckTimeout)

      const response = await fetch(`${OCR_API_CONFIG.baseUrl}${OCR_API_CONFIG.healthEndpoint}`, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 200 = pronto, 503 = carregando
      if (response.status === 200) {
        console.log('[OcrService] ✅ API OCR está pronta')
        return true
      } else if (response.status === 503) {
        console.log('[OcrService] ⏳ API OCR ainda está carregando...')
        return false
      }

      return false

    } catch (error) {
      console.warn('[OcrService] Não foi possível verificar health da API:', error)
      // Se health check falhar, assume que está disponível e deixa o erro acontecer na requisição principal
      return true
    }
  }

  /**
   * Chama a API OCR com retry automático em caso de timeout
   * 
   * @param file - Arquivo PDF para processar
   * @param options - Opções de timeout e retries
   * @returns Resposta da API
   */
  private static async callOcrApiWithRetry(
    file: File,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<unknown> {
    // Define timeout baseado no número de requisições (primeira é mais lenta)
    const isFirstRequest = requestCount === 0
    const defaultTimeout = isFirstRequest ? OCR_API_CONFIG.timeout : OCR_API_CONFIG.timeoutSubsequent
    
    const timeout = options.timeout ?? defaultTimeout
    const maxRetries = options.retries ?? OCR_API_CONFIG.maxRetries

    let lastError: Error | null = null
    
    // Tenta até maxRetries vezes
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[OcrService] Tentativa ${attempt + 1}/${maxRetries + 1} após falha...`)
          await new Promise(resolve => setTimeout(resolve, OCR_API_CONFIG.retryDelay))
        }

        const response = await this.callOcrApi(file, timeout)
        
        // Sucesso! Incrementa contador
        requestCount++
        return response

      } catch (error) {
        lastError = error as Error

        // Se é timeout e ainda tem tentativas, continua
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`[OcrService] ⏱️ Timeout na tentativa ${attempt + 1}/${maxRetries + 1}`)
          
          if (attempt < maxRetries) {
            console.log('[OcrService] Tentando novamente...')
            continue
          }
        }

        // Se não é timeout ou acabaram as tentativas, lança erro
        throw error
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    throw new Error(
      `OCR falhou após ${maxRetries + 1} tentativas. ` +
      `Última falha: ${lastError?.message || 'Erro desconhecido'}. ` +
      `A API pode estar sobrecarregada, tente novamente em alguns instantes.`
    )
  }

  /**
   * Chama a API OCR com tratamento de timeout
   * 
   * @param file - Arquivo para enviar
   * @param timeout - Tempo máximo de espera em ms
   */
  private static async callOcrApi(file: File, timeout: number): Promise<unknown> {
    // Cria FormData
    const formData = new FormData()
    formData.append('file', file)

    // Cria AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    console.log(`[OcrService] ⏱️ Timeout configurado para ${timeout / 1000}s`)

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
      
      // Melhora mensagem de erro para timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Timeout: A API OCR não respondeu em ${timeout / 1000} segundos. ` +
          `Isso pode acontecer na primeira requisição enquanto a API faz warm-up.`
        )
      }
      
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
   * Extrai transações do raw_text como fallback quando a API não estrutura os itens
   * Usa regex para identificar padrões de transações brasileiras
   */
  private static extractTransactionsFromRawText(rawText: string): OcrItem[] {
    const transactions: OcrItem[] = []
    
    // Mapeia mês português para número
    const monthMap: Record<string, string> = {
      'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04',
      'MAI': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
      'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
    }
    
    // Extrai ano do documento (procura por YYYY no contexto da fatura)
    const yearMatch = rawText.match(/20\d{2}/)
    const documentYear = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear()
    
    const lines = rawText.split('\n')
    
    // Padrão completo para transações Nubank
    // Formato: DD MMM •••• NNNN Descrição R$ VALOR,CC
    const nubankPattern = /^(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+[•\*]+\s*\d{4}\s+(.+?)\s+R\$\s*([\d.,]+)$/i
    
    // Padrão simplificado como fallback
    const simplePattern = /(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+.*?R\$\s*([\d.,]+)/i
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Ignora linhas muito curtas ou que são claramente cabeçalhos/separadores
      if (trimmedLine.length < 10 || 
          trimmedLine.includes('TRANSAÇÕES') || 
          trimmedLine.includes('Pagamentos e Financiamentos') ||
          trimmedLine.includes('---') ||
          trimmedLine.startsWith('Página') ||
          /^Total de compras/i.test(trimmedLine) ||
          /cartões.*R\$/i.test(trimmedLine)) {
        continue
      }
      
      // Tenta padrão Nubank primeiro
      let match = trimmedLine.match(nubankPattern)
      let description = ''
      let day = ''
      let monthStr = ''
      let amountStr = ''
      
      if (match) {
        day = match[1]
        monthStr = match[2]
        description = match[3]
        amountStr = match[4]
      } else {
        // Fallback para padrão simplificado
        match = trimmedLine.match(simplePattern)
        if (match) {
          day = match[1]
          monthStr = match[2]
          amountStr = match[3]
          
          // Extrai descrição manualmente
          const descStart = trimmedLine.indexOf(monthStr) + monthStr.length
          const descEnd = trimmedLine.lastIndexOf('R$')
          description = trimmedLine.substring(descStart, descEnd).trim()
        }
      }
      
      if (match && description && amountStr) {
        // Normaliza valor
        const cleanAmount = amountStr.replace(/\./g, '').replace(',', '.')
        const amount = parseFloat(cleanAmount)
        
        // Remove padrões de cartão e limpa descrição
        description = description
          .replace(/[•\*]{4}\s*\d{4}/g, '') // Remove •••• NNNN ou **** NNNN
          .replace(/\s+/g, ' ') // Normaliza espaços
          .trim()
        
        // Valida dados e descrição mínima
        if (description && 
            description.length >= 3 && // Descrição deve ter pelo menos 3 caracteres
            !/^(a|de|em|para)\s+\d{1,2}\s+[A-Z]{3}/i.test(description) && // Ignora fragmentos como "a 17 NOV"
            amount > 0 && 
            !isNaN(amount)) {
          const month = monthMap[monthStr.toUpperCase()] || '01'
          const formattedDay = day.padStart(2, '0')
          
          transactions.push({
            descricao: description,
            valor: amount,
            data: `${documentYear}-${month}-${formattedDay}`
          })
        }
      }
    }
    
    console.log(`[OcrService] Extraídas ${transactions.length} transações do raw_text`)
    
    return transactions
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
