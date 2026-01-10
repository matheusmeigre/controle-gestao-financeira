import { z } from 'zod'

// Privacy by Design: Never store full card number or CVV
export const creditCardSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  nickname: z.string().min(1, 'Apelido é obrigatório').max(50),
  bankName: z.string().min(1, 'Instituição é obrigatória'),
  brand: z.enum(['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros']),
  last4Digits: z.string().regex(/^\d{4}$/, 'Últimos 4 dígitos inválidos'),
  closingDay: z.number().min(1).max(31), // Dia de fechamento da fatura
  dueDay: z.number().min(1).max(31), // Dia de vencimento
  creditLimit: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const createCreditCardSchema = creditCardSchema.omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
})

export const updateCreditCardSchema = creditCardSchema.partial().required({ id: true })

export type CreditCard = z.infer<typeof creditCardSchema>
export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>
