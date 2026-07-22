import type { Expense, CardBill, Income } from '@/types/expense'

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

export function getCurrentMonthData(data: DashboardData): CurrentMonthData {
  const currentMonth = new Date().toISOString().slice(0, 7)

  return {
    expenses: data.expenses.filter((expense) => expense.date.startsWith(currentMonth)),
    cardBills: data.cardBills.filter((bill) => bill.date.startsWith(currentMonth)),
    incomes: data.incomes.filter((income) => income.date.startsWith(currentMonth)),
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
