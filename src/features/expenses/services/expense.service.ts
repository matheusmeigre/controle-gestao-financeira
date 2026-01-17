import { ExpenseRepository } from './expense.repository'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types'

/**
 * Service para gerenciar despesas
 * Contém a lógica de negócio e orquestra o repository
 */
export class ExpenseService {
  private repository = new ExpenseRepository()

  /**
   * Adiciona uma nova despesa
   */
  async addExpense(userId: string, data: CreateExpenseInput): Promise<Expense> {
    // Validações de negócio
    if (!data.description?.trim()) {
      throw new Error('Descrição é obrigatória')
    }

    if (data.amount <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    if (!data.category) {
      throw new Error('Categoria é obrigatória')
    }

    const expense: Expense = {
      id: this.generateId(),
      userId,
      description: data.description.trim(),
      amount: data.amount,
      category: data.category,
      date: new Date().toISOString(),
      status: data.status || 'pending',
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency,
      dueDate: data.dueDate,
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes?.trim()
    }

    return await this.repository.create(userId, expense)
  }

  /**
   * Atualiza uma despesa existente
   */
  async updateExpense(userId: string, input: UpdateExpenseInput): Promise<Expense | null> {
    const { id, ...updates } = input

    // Validações
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    if (updates.description !== undefined && !updates.description.trim()) {
      throw new Error('Descrição não pode ser vazia')
    }

    return await this.repository.update(userId, id, updates)
  }

  /**
   * Remove uma despesa
   */
  async deleteExpense(userId: string, id: string): Promise<boolean> {
    return await this.repository.delete(userId, id)
  }

  /**
   * Busca todas as despesas do usuário
   */
  async getAllExpenses(userId: string): Promise<Expense[]> {
    return await this.repository.findAll(userId)
  }

  /**
   * Busca despesas por categoria
   */
  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    return await this.repository.findByCategory(userId, category)
  }

  /**
   * Busca despesas por mês
   */
  async getExpensesByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
    return await this.repository.findByMonth(userId, month, year)
  }

  /**
   * Calcula total mensal
   */
  async getMonthlyTotal(userId: string, month: number, year: number): Promise<number> {
    const expenses = await this.repository.findByMonth(userId, month, year)
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  /**
   * Calcula total por categoria
   */
  async getTotalByCategory(userId: string, category: string): Promise<number> {
    return await this.repository.getTotalByCategory(userId, category)
  }

  /**
   * Busca despesas recorrentes
   */
  async getRecurringExpenses(userId: string): Promise<Expense[]> {
    return await this.repository.findRecurring(userId)
  }

  /**
   * Busca despesas por status
   */
  async getExpensesByStatus(userId: string, status: "paid" | "pending"): Promise<Expense[]> {
    return await this.repository.findByStatus(userId, status)
  }

  /**
   * Gera relatório mensal
   */
  async getMonthlyReport(userId: string, month: number, year: number) {
    const expenses = await this.getExpensesByMonth(userId, month, year)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Agrupa por categoria
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

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
