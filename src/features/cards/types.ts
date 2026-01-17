import { z } from 'zod'

// Privacy by Design: Never store full card number or CVV
export const creditCardSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  nickname: z.string().min(1, 'Apelido é obrigatório').max(50),
  bankName: z.string().min(1, 'Instituição é obrigatória'),
  brand: z.enum(['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'], {
    errorMap: () => ({ message: 'Selecione uma bandeira' })
  }),
  last4Digits: z.string().regex(/^\d{4}$/, 'Deve conter exatamente 4 dígitos'),
  closingDay: z.number({ 
    required_error: 'Dia de fechamento é obrigatório',
    invalid_type_error: 'Digite um número válido'
  }).int().min(1, 'Mínimo 1').max(31, 'Máximo 31'),
  dueDay: z.number({
    required_error: 'Dia de vencimento é obrigatório',
    invalid_type_error: 'Digite um número válido'
  }).int().min(1, 'Mínimo 1').max(31, 'Máximo 31'),
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

export interface CardBill {
  id: string
  userId: string
  cardName: string
  totalAmount: number
  date: string
  description: string
  divisions: PersonDivision[]
  items?: CardBillItem[]
}

export interface PersonDivision {
  personName: string
  amount: number
  description?: string
}

export interface CardBillItem {
  id: string
  description: string
  amount: number
  category: string
  personName: string
  date?: string
}

export const CARD_OPTIONS = [
  "Nubank",
  "Inter",
  "PicPay",
  "Itaú",
  "Bradesco",
  "Santander",
  "C6 Bank",
  "BTG Pactual",
  "Outros",
] as const

export const PERSON_OPTIONS = ["Eu", "Mãe", "Irmão"] as const

export type CardOption = (typeof CARD_OPTIONS)[number]
export type PersonOption = (typeof PERSON_OPTIONS)[number]
