import { BaseRepository } from '@/lib/repositories/base.repository'
import type { Income } from '../types'

/**
 * Repository para gerenciar Incomes (Rendas)
 */
export class IncomeRepository extends BaseRepository<Income> {
  constructor() {
    super('incomes')
  }

  /**
   * Busca rendas por tipo
   */
  async findByType(userId: string, type: "salary" | "extra"): Promise<Income[]> {
    const all = await this.findAll(userId)
    return all.filter(income => income.type === type)
  }

  /**
   * Busca rendas por status
   */
  async findByStatus(userId: string, status: "pending" | "received"): Promise<Income[]> {
    const all = await this.findAll(userId)
    return all.filter(income => income.status === status)
  }

  /**
   * Busca rendas por categoria
   */
  async findByCategory(userId: string, category: string): Promise<Income[]> {
    const all = await this.findAll(userId)
    return all.filter(income => income.category === category)
  }

  /**
   * Busca rendas por período
   */
  async findByPeriod(userId: string, startDate: string, endDate: string): Promise<Income[]> {
    const all = await this.findAll(userId)
    return all.filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate >= new Date(startDate) && incomeDate <= new Date(endDate)
    })
  }

  /**
   * Calcula total de rendas por período
   */
  async getTotalByPeriod(userId: string, startDate: string, endDate: string): Promise<number> {
    const incomes = await this.findByPeriod(userId, startDate, endDate)
    return incomes.reduce((sum, income) => sum + income.amount, 0)
  }

  /**
   * Calcula total de rendas recebidas
   */
  async getTotalReceived(userId: string): Promise<number> {
    const received = await this.findByStatus(userId, "received")
    return received.reduce((sum, income) => sum + income.amount, 0)
  }
}
