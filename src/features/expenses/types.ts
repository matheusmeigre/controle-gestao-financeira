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

export type Category = (typeof CATEGORIES)[number]

export type CreateExpenseInput = Omit<Expense, "id" | "userId" | "date">
export type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: string }
