import { BaseRepository } from '@/lib/repositories/base.repository'
import type { Expense } from '../types'

/**
 * Repository para gerenciar Expenses
 * Extende BaseRepository com métodos específicos
 */
export class ExpenseRepository extends BaseRepository<Expense> {
  constructor() {
    super('expenses')
  }

  /**
   * Busca despesas por categoria
   */
  async findByCategory(userId: string, category: string): Promise<Expense[]> {
    const all = await this.findAll(userId)
    return all.filter(expense => expense.category === category)
  }

  /**
   * Busca despesas por período
   */
  async findByPeriod(userId: string, startDate: string, endDate: string): Promise<Expense[]> {
    const all = await this.findAll(userId)
    return all.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate)
    })
  }

  /**
   * Busca despesas por mês/ano
   */
  async findByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
    const all = await this.findAll(userId)
    return all.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })
  }

  /**
   * Busca despesas recorrentes
   */
  async findRecurring(userId: string): Promise<Expense[]> {
    const all = await this.findAll(userId)
    return all.filter(expense => expense.isRecurring === true)
  }

  /**
   * Busca despesas por status
   */
  async findByStatus(userId: string, status: "paid" | "pending"): Promise<Expense[]> {
    const all = await this.findAll(userId)
    return all.filter(expense => expense.status === status)
  }

  /**
   * Calcula total de despesas por período
   */
  async getTotalByPeriod(userId: string, startDate: string, endDate: string): Promise<number> {
    const expenses = await this.findByPeriod(userId, startDate, endDate)
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  /**
   * Calcula total de despesas por categoria
   */
  async getTotalByCategory(userId: string, category: string): Promise<number> {
    const expenses = await this.findByCategory(userId, category)
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }
}
