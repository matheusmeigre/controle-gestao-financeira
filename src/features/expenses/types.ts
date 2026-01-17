export interface Expense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  date: string
  status?: "paid" | "pending"
  isRecurring?: boolean
  recurringFrequency?: "monthly" | "yearly"
  dueDate?: string
  isActive?: boolean
  notes?: string
}

/**
 * @deprecated Use CATEGORIES from @/features/categories instead
 * This constant will be removed in a future version
 */
export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Contas",
  "Saúde",
  "Compras",
  "Estudos",
  "Outros",
] as const

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

export type Category = (typeof CATEGORIES)[number]
export type CardOption = (typeof CARD_OPTIONS)[number]
export type PersonOption = (typeof PERSON_OPTIONS)[number]

export type CreateExpenseInput = Omit<Expense, "id" | "userId" | "date">
export type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: string }
