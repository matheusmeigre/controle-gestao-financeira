export interface Income {
  id: string
  userId: string
  description: string
  amount: number
  type: "salary" | "extra"
  category?: string
  date: string
  status: "pending" | "received"
  registrationDate: string
  receivedDate: string | null
}

/**
 * @deprecated Use INCOME_CATEGORIES from @/features/categories instead
 * This constant will be removed in a future version
 */
export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Vendas",
  "Presente",
  "Outros",
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

export type CreateIncomeInput = Omit<Income, "id" | "userId" | "registrationDate">
export type UpdateIncomeInput = Partial<CreateIncomeInput> & { id: string }
