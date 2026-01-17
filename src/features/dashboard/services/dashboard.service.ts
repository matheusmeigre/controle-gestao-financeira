/**
 * Dashboard Service
 * 
 * Camada de serviço para gerenciar dados do dashboard
 * Separa a lógica de negócio da camada de apresentação
 */

import type { Expense, CardBill, Income } from '@/types/expense'
import { loadUserData, saveUserData } from '@/lib/user-data'

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

/**
 * Carrega todos os dados do usuário
 */
export function loadDashboardData(userId: string): DashboardData {
  const expenses = loadUserData<Expense>('expenses', userId)
  const cardBills = loadUserData<CardBill>('cardBills', userId)
  const incomes = loadUserData<Income>('incomes', userId)

  return { expenses, cardBills, incomes }
}

/**
 * Salva dados de despesas
 */
export function saveExpenses(userId: string, expenses: Expense[]): void {
  if (expenses.length === 0) return
  saveUserData('expenses', userId, expenses)
}

/**
 * Salva dados de faturas de cartão
 */
export function saveCardBills(userId: string, cardBills: CardBill[]): void {
  if (cardBills.length === 0) return
  saveUserData('cardBills', userId, cardBills)
}

/**
 * Salva dados de rendas
 */
export function saveIncomes(userId: string, incomes: Income[]): void {
  if (incomes.length === 0) return
  saveUserData('incomes', userId, incomes)
}

/**
 * Filtra dados do mês atual
 */
export function getCurrentMonthData(data: DashboardData): CurrentMonthData {
  const currentMonth = new Date().toISOString().slice(0, 7)

  return {
    expenses: data.expenses.filter((expense) => expense.date.startsWith(currentMonth)),
    cardBills: data.cardBills.filter((bill) => bill.date.startsWith(currentMonth)),
    incomes: data.incomes.filter((income) => income.date.startsWith(currentMonth)),
  }
}

/**
 * Filtra despesas gerais (exclui assinaturas)
 */
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

/**
 * Filtra assinaturas
 */
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

/**
 * Filtra faturas de cartão por categoria
 */
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

/**
 * Filtra rendas por categoria
 */
export function filterIncomesByCategory(
  incomes: Income[],
  categoryFilter: string
): Income[] {
  if (categoryFilter === 'all') {
    return incomes
  }

  return incomes.filter((income) => income.category === categoryFilter)
}

/**
 * Cria nova despesa
 */
export function createExpense(
  data: Omit<Expense, 'id' | 'date' | 'userId'>,
  userId: string
): Expense {
  return {
    ...data,
    id: Date.now().toString(),
    userId,
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * Cria nova fatura de cartão
 */
export function createCardBill(
  data: Omit<CardBill, 'id' | 'date' | 'userId'>,
  userId: string
): CardBill {
  return {
    ...data,
    id: Date.now().toString(),
    userId,
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * Cria nova renda
 */
export function createIncome(
  data: Omit<Income, 'id' | 'date' | 'userId'>,
  userId: string
): Income {
  return {
    ...data,
    id: Date.now().toString(),
    userId,
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * Atualiza despesa
 */
export function updateExpense(
  expenses: Expense[],
  id: string,
  updates: Partial<Expense>
): Expense[] {
  return expenses.map((expense) =>
    expense.id === id ? { ...expense, ...updates } : expense
  )
}

/**
 * Remove despesa
 */
export function deleteExpense(expenses: Expense[], id: string): Expense[] {
  return expenses.filter((expense) => expense.id !== id)
}

/**
 * Atualiza fatura de cartão
 */
export function updateCardBill(
  cardBills: CardBill[],
  id: string,
  updates: Partial<CardBill>
): CardBill[] {
  return cardBills.map((bill) => (bill.id === id ? { ...bill, ...updates } : bill))
}

/**
 * Remove fatura de cartão
 */
export function deleteCardBill(cardBills: CardBill[], id: string): CardBill[] {
  return cardBills.filter((bill) => bill.id !== id)
}

/**
 * Remove renda
 */
export function deleteIncome(incomes: Income[], id: string): Income[] {
  return incomes.filter((income) => income.id !== id)
}

/**
 * Marca renda como recebida
 */
export function markIncomeAsReceived(incomes: Income[], id: string): Income[] {
  return incomes.map((income) =>
    income.id === id
      ? {
          ...income,
          status: 'received' as const,
          receivedDate: new Date().toISOString(),
        }
      : income
  )
}
