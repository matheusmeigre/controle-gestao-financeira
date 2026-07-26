import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import type { Planning } from '@/features/planning/types'

export type DashboardData = {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

export type CurrentMonthData = {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

export type PlanningAlertsData = {
  delayed: Planning[]
  overBudget: Planning[]
}

const FINANCIAL_TIME_ZONE = 'America/Sao_Paulo'

function formatCurrentMonthParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: FINANCIAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)

  return {
    year,
    month,
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
  }
}

export function getCurrentYearMonth(date = new Date()): string {
  return formatCurrentMonthParts(date).yearMonth
}

export function getCurrentYearMonthParts(date = new Date()) {
  const { year, month } = formatCurrentMonthParts(date)

  return { year, month }
}

export function getCurrentMonthData(data: DashboardData): CurrentMonthData {
  const currentMonth = getCurrentYearMonth()

  return {
    expenses: data.expenses.filter((expense) => expense.date.startsWith(currentMonth)),
    cardBills: data.cardBills.filter((bill) => bill.date.startsWith(currentMonth)),
    incomes: data.incomes.filter((income) => income.date.startsWith(currentMonth)),
  }
}

export function getSummaryInvoices(invoices: Invoice[]): Invoice[] {
  const { year, month } = getCurrentYearMonthParts()

  return invoices.filter((invoice) => {
    if (invoice.isPaid) {
      return false
    }

    const isCurrentMonth = invoice.year === year && invoice.month === month
    const isOverdue = invoice.year < year || (invoice.year === year && invoice.month < month)

    return isCurrentMonth || isOverdue
  })
}

export function getPlanningAlerts(plannings: Planning[]): PlanningAlertsData {
  return {
    delayed: plannings.filter((planning) => planning.status === 'delayed'),
    overBudget: plannings.filter(
      (planning) =>
        planning.currentAmount > planning.targetAmount &&
        planning.status !== 'completed' &&
        planning.status !== 'cancelled'
    ),
  }
}

export function filterGeneralExpenses(
  expenses: Expense[],
  categoryFilter: string
): Expense[] {
  const generalExpenses = expenses.filter((e) => e.category !== 'Assinaturas')

  if (categoryFilter === 'all') {
    return generalExpenses
  }

  return generalExpenses.filter((e) => e.category === categoryFilter)
}

export function filterSubscriptions(
  expenses: Expense[],
  categoryFilter: string
): Expense[] {
  const subscriptions = expenses.filter((e) => e.category === 'Assinaturas')

  if (categoryFilter === 'all') {
    return subscriptions
  }

  return subscriptions.filter((e) => e.category === categoryFilter)
}

export function filterCardBillsByCategory(
  cardBills: CardBill[],
  categoryFilter: string
): CardBill[] {
  if (categoryFilter === 'all') {
    return cardBills
  }

  return cardBills.filter((bill) =>
    bill.items?.some((item) => item.category === categoryFilter)
  )
}

export function filterIncomesByCategory(
  incomes: Income[],
  categoryFilter: string
): Income[] {
  if (categoryFilter === 'all') {
    return incomes
  }

  return incomes.filter((income) => income.category === categoryFilter)
}
