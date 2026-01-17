import { z } from 'zod'

// Transaction item in an invoice
export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().optional(),
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
  id: z.string().optional(),
  userId: z.string(),
  cardId: z.string(),
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
  invoiceId: z.string(),
  item: invoiceItemSchema.omit({ id: true, invoiceId: true, createdAt: true }),
})

export type Invoice = z.infer<typeof invoiceSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type AddInvoiceItemInput = z.infer<typeof addInvoiceItemSchema>

/**
 * Metadados enriquecidos retornados pelo processamento de upload
 */
export interface InvoiceUploadMetadata {
  bankName?: string
  cardLast4?: string
  totalAmount?: number
  statementPeriod?: string
  confidence?: number
  fileName: string
  fileSize: number
  fileType?: string
  processedAt: string
  itemCount: number
  cardId: string
  month: number
  year: number
}

/**
 * Resultado do processamento de upload de fatura
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
