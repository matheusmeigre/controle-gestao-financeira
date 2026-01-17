import { IncomeRepository } from './income.repository'
import type { Income, CreateIncomeInput, UpdateIncomeInput } from '../types'

/**
 * Service para gerenciar rendas
 */
export class IncomeService {
  private repository = new IncomeRepository()

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Adiciona uma nova renda
   */
  async addIncome(userId: string, data: CreateIncomeInput): Promise<Income> {
    if (!data.description?.trim()) {
      throw new Error('Descrição é obrigatória')
    }

    if (data.amount <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    const income: Income = {
      id: this.generateId(),
      userId,
      description: data.description.trim(),
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      status: data.status,
      registrationDate: new Date().toISOString(),
      receivedDate: data.receivedDate
    }

    return await this.repository.create(userId, income)
  }

  /**
   * Atualiza uma renda
   */
  async updateIncome(userId: string, input: UpdateIncomeInput): Promise<Income | null> {
    const { id, ...updates } = input

    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    return await this.repository.update(userId, id, updates)
  }

  /**
   * Remove uma renda
   */
  async deleteIncome(userId: string, id: string): Promise<boolean> {
    return await this.repository.delete(userId, id)
  }

  /**
   * Marca renda como recebida
   */
  async markAsReceived(userId: string, id: string): Promise<Income | null> {
    return await this.repository.update(userId, id, {
      status: "received",
      receivedDate: new Date().toISOString()
    })
  }

  /**
   * Busca todas as rendas
   */
  async getAllIncomes(userId: string): Promise<Income[]> {
    return await this.repository.findAll(userId)
  }

  /**
   * Busca rendas por tipo
   */
  async getIncomesByType(userId: string, type: "salary" | "extra"): Promise<Income[]> {
    return await this.repository.findByType(userId, type)
  }

  /**
   * Busca rendas pendentes
   */
  async getPendingIncomes(userId: string): Promise<Income[]> {
    return await this.repository.findByStatus(userId, "pending")
  }

  /**
   * Calcula total recebido
   */
  async getTotalReceived(userId: string): Promise<number> {
    return await this.repository.getTotalReceived(userId)
  }
}
