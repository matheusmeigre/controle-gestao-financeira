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
