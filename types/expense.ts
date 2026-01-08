export interface Expense {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  description: string
  amount: number
  category: string
  date: string
  status?: "paid" | "pending" // Status de pagamento
  isRecurring?: boolean // Indica se é recorrente
  dueDate?: string // Data de vencimento para Contas, Estudos e Assinaturas
}

export interface CardBill {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  cardName: string
  totalAmount: number
  date: string
  description: string
  divisions: PersonDivision[]
  items?: CardBillItem[] // Itens categorizados da fatura
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

export interface Income {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  description: string
  amount: number
  type: "salary" | "extra"
  category?: string // Categoria da renda
  date: string
  status: "pending" | "received"
  registrationDate: string
  receivedDate: string | null
}

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Contas",
  "Saúde",
  "Compras",
  "Estudos",
  "Assinaturas",
  "Outros",
] as const

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Vendas",
  "Presente",
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
