export interface Expense {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  description: string
  amount: number
  category: string
  date: string
}

export interface CardBill {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  cardName: string
  totalAmount: number
  date: string
  description: string
  divisions: PersonDivision[]
}

export interface PersonDivision {
  personName: string
  amount: number
  description?: string
}

export interface Income {
  id: string
  userId: string // ✅ Campo obrigatório para segregação
  description: string
  amount: number
  type: "salary" | "extra"
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
