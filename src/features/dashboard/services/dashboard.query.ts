import 'server-only'

import { auth } from '@clerk/nextjs/server'
import type { CreditCard } from '@/features/cards/types'
import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import type { Planning } from '@/features/planning/types'
import type { CardBill, Expense, Income } from '@/types/expense'
import { SupabaseCardBillRepository } from './card-bill.supabase.repository'
import { getCurrentYearMonth, getCurrentYearMonthParts } from './dashboard.service'
import type { DashboardInitialData } from '../hooks/useDashboardData'

const expenseRepository = new SupabaseExpenseRepository()
const incomeRepository = new SupabaseIncomeRepository()
const invoiceRepository = new SupabaseInvoiceRepository()
const cardBillRepository = new SupabaseCardBillRepository()
const cardRepository = new SupabaseCardRepository()
const planningRepository = new SupabasePlanningRepository()

export async function getDashboardInitialData(): Promise<DashboardInitialData> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Não autenticado')
  }

  const yearMonth = getCurrentYearMonth()
  const { year, month } = getCurrentYearMonthParts()

  const [expenses, incomes, invoices, cardBills, cards, plannings] = await Promise.all([
    expenseRepository.findByMonth(userId, yearMonth),
    incomeRepository.findByMonth(userId, yearMonth),
    invoiceRepository.findAll(userId),
    cardBillRepository.findByMonth(userId, yearMonth),
    cardRepository.findActive(userId),
    planningRepository.findAll(userId),
  ])

  return {
    expenses: expenses as Expense[],
    cardBills: cardBills as CardBill[],
    incomes: incomes as Income[],
    invoices,
    cards: cards as CreditCard[],
    plannings: plannings as Planning[],
    loadedAt: new Date().toISOString(),
    yearMonth,
    currentPeriod: { year, month },
  }
}
