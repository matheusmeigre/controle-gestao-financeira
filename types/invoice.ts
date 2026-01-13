import { z } from 'zod'

// Transaction item in an invoice
export const invoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  date: z.date(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number(),
  category: z.string().default('Outros'),
  installment: z.string().optional(), // e.g., "2/12" for parcela 2 de 12
  notes: z.string().optional(),
  createdAt: z.date().optional(),
})

// Invoice linked to a credit card and competency (month/year)
export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  cardId: z.string().uuid(),
  month: z.number().min(1).max(12), // 1 = Janeiro, 12 = Dezembro
  year: z.number().min(2020).max(2100),
  closingDate: z.date(),
  dueDate: z.date(),
  totalAmount: z.number().default(0),
  paidAmount: z.number().default(0),
  isPaid: z.boolean().default(false),
  items: z.array(invoiceItemSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createInvoiceSchema = invoiceSchema.omit({ 
  id: true, 
  userId: true,
  totalAmount: true,
  paidAmount: true,
  isPaid: true,
  createdAt: true, 
  updatedAt: true 
})

export const updateInvoiceSchema = invoiceSchema.partial().required({ id: true })

export const addInvoiceItemSchema = z.object({
  invoiceId: z.string().uuid(),
  item: invoiceItemSchema.omit({ id: true, invoiceId: true, createdAt: true }),
})

export type Invoice = z.infer<typeof invoiceSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type AddInvoiceItemInput = z.infer<typeof addInvoiceItemSchema>

/**
 * ====================================
 * 📊 Tipos Estendidos para Processamento de Faturas
 * ====================================
 */

/**
 * Metadados enriquecidos retornados pelo processamento de upload
 * Inclui informações do parser + dados do arquivo + contexto da fatura
 */
export interface InvoiceUploadMetadata {
  // Metadados do parser
  bankName?: string
  cardLast4?: string
  totalAmount?: number
  statementPeriod?: string
  confidence?: number // Confiança do OCR (0-1)
  
  // Metadados do arquivo
  fileName: string
  fileSize: number
  fileType?: string
  processedAt: string // ISO date
  
  // Contexto da fatura
  itemCount: number
  cardId: string
  month: number
  year: number
}

/**
 * Resultado do processamento de upload de fatura
 * Retornado pela Server Action processInvoiceUpload
 */
export interface InvoiceUploadResult {
  success: boolean
  data?: {
    items: InvoiceItem[]
    metadata: InvoiceUploadMetadata
    warnings?: string[]
  }
  error?: string
  details?: string[]
}

/**
 * Status de processamento para UI
 */
export type InvoiceProcessingStatus = 
  | 'idle' 
  | 'uploading' 
  | 'processing' 
  | 'success' 
  | 'error'

/**
 * Categorias padrão de transações
 * Podem ser estendidas conforme necessário
 */
export const TRANSACTION_CATEGORIES = [
  'Alimentação',
  'Supermercado',
  'Transporte',
  'Saúde',
  'Educação',
  'Entretenimento',
  'Vestuário',
  'Moradia',
  'Serviços',
  'Outros',
] as const

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]
