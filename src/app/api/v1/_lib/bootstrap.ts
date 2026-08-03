import 'server-only'

import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import { getCurrentYearMonth, getCurrentYearMonthParts } from '@/features/dashboard/services/dashboard.service'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import { mobileBootstrapResponseSchema, type MobileBootstrapResponse } from '@contracts'

const expenseRepository = new SupabaseExpenseRepository()
const incomeRepository = new SupabaseIncomeRepository()
const invoiceRepository = new SupabaseInvoiceRepository()
const cardRepository = new SupabaseCardRepository()
const planningRepository = new SupabasePlanningRepository()

export async function buildMobileBootstrap(userId: string): Promise<MobileBootstrapResponse> {
  const yearMonth = getCurrentYearMonth()
  const { year, month } = getCurrentYearMonthParts()

  const [expenses, incomes, invoices, cards, plannings] = await Promise.all([
    expenseRepository.findByMonth(userId, yearMonth),
    incomeRepository.findByMonth(userId, yearMonth),
    invoiceRepository.findAll(userId),
    cardRepository.findAll(userId),
    planningRepository.findAll(userId),
  ])

  return mobileBootstrapResponseSchema.parse({
    data: {
      apiVersion: 'v1',
      serverTime: new Date().toISOString(),
      currentPeriod: {
        year,
        month,
        yearMonth,
      },
      summary: {
        expensesCount: expenses.length,
        incomesCount: incomes.length,
        invoicesCount: invoices.length,
        cardsCount: cards.length,
        planningsCount: plannings.length,
      },
      capabilities: {
        me: '/api/v1/me',
        bootstrap: '/api/v1/bootstrap',
      },
    },
  })
}
