import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types'

/**
 * @deprecated Use server actions (@/server/actions/expenses) directly instead.
 * Este service foi mantido apenas para compatibilidade durante migração.
 * Novos códigos devem importar getExpenses, createExpense, updateExpense, deleteExpense.
 */
export class ExpenseService {
  /**
   * Gera relatório mensal a partir de dados já carregados (sem acesso a repository).
   */
  getMonthlyReport(expenses: Expense[], month: number, year: number) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)

    const byCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { total: 0, count: 0, items: [] }
      }
      acc[expense.category].total += expense.amount
      acc[expense.category].count++
      acc[expense.category].items.push(expense)
      return acc
    }, {} as Record<string, { total: number; count: number; items: Expense[] }>)

    return {
      period: { month, year },
      total,
      count: expenses.length,
      byCategory,
      expenses
    }
  }
}
