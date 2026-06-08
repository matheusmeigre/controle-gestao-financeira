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

  // Processa itens em paralelo com batch de 20 para evitar rate limit
  const migrateBatch = async <T>(
    items: T[],
    createFn: (item: T) => Promise<unknown>
  ): Promise<number> => {
    if (items.length === 0) return 0
    let count = 0
    const BATCH_SIZE = 20
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map((item) => createFn(item))
      )
      count += results.filter((r) => r.status === 'fulfilled').length
    }
    return count
  }

  const results = await Promise.all([
    migrateBatch(payload.expenses, (item) => expRepo.create(userId, { ...item, userId })),
    migrateBatch(payload.incomes, (item) => incRepo.create(userId, { ...item, userId })),
    migrateBatch(payload.cards, (item) => cardRepo.create(userId, { ...item, userId })),
    migrateBatch(payload.cardBills, (item) => billRepo.create(userId, { ...item, userId })),
    migrateBatch(payload.invoices, (item) => invRepo.create(userId, { ...item, userId })),
    migrateBatch(payload.plannings, (item) => planRepo.create(userId, { ...item, userId })),
  ])

  migrated.expenses = results[0]
  migrated.incomes = results[1]
  migrated.cards = results[2]
  migrated.cardBills = results[3]
  migrated.invoices = results[4]
  migrated.plannings = results[5]

  return { success: true, migrated, errors }
}
