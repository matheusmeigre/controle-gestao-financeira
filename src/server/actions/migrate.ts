'use server'

import { auth } from '@clerk/nextjs/server'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import { SupabaseCardBillRepository } from '@/features/dashboard/services/card-bill.supabase.repository'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import type { Expense } from '@/features/expenses/types'
import type { Income } from '@/features/incomes/types'
import type { CreditCard } from '@/features/cards/types'
import type { CardBill } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import type { Planning } from '@/features/planning/types'

export interface MigrationPayload {
  expenses: Expense[]
  incomes: Income[]
  cards: CreditCard[]
  cardBills: CardBill[]
  invoices: Invoice[]
  plannings: Planning[]
}

export interface MigrationResult {
  success: boolean
  migrated: {
    expenses: number
    incomes: number
    cards: number
    cardBills: number
    invoices: number
    plannings: number
  }
  errors: string[]
}

/**
 * Server Action: migra dados do localStorage para Supabase.
 * Usa upsert (insert or update) para ser idempotente — pode rodar múltiplas vezes.
 */
export async function migrateFromLocalStorage(payload: MigrationPayload): Promise<MigrationResult> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, migrated: { expenses: 0, incomes: 0, cards: 0, cardBills: 0, invoices: 0, plannings: 0 }, errors: ['Não autenticado'] }
  }

  const errors: string[] = []
  const migrated = { expenses: 0, incomes: 0, cards: 0, cardBills: 0, invoices: 0, plannings: 0 }

  const expRepo = new SupabaseExpenseRepository()
  const incRepo = new SupabaseIncomeRepository()
  const cardRepo = new SupabaseCardRepository()
  const billRepo = new SupabaseCardBillRepository()
  const invRepo = new SupabaseInvoiceRepository()
  const planRepo = new SupabasePlanningRepository()

  // Despesas
  for (const item of payload.expenses) {
    try {
      await expRepo.create(userId, { ...item, userId })
      migrated.expenses++
    } catch { /* ignora duplicatas */ }
  }

  // Receitas
  for (const item of payload.incomes) {
    try {
      await incRepo.create(userId, { ...item, userId })
      migrated.incomes++
    } catch { /* ignora duplicatas */ }
  }

  // Cartões
  for (const item of payload.cards) {
    try {
      await cardRepo.create(userId, { ...item, userId })
      migrated.cards++
    } catch { /* ignora duplicatas */ }
  }

  // Card Bills legados
  for (const item of payload.cardBills) {
    try {
      await billRepo.create(userId, { ...item, userId })
      migrated.cardBills++
    } catch { /* ignora duplicatas */ }
  }

  // Faturas (Invoice + invoice_items)
  for (const item of payload.invoices) {
    try {
      await invRepo.create(userId, { ...item, userId })
      migrated.invoices++
    } catch { /* ignora duplicatas */ }
  }

  // Planejamentos
  for (const item of payload.plannings) {
    try {
      await planRepo.create(userId, { ...item, userId })
      migrated.plannings++
    } catch { /* ignora duplicatas */ }
  }

  return { success: true, migrated, errors }
}
