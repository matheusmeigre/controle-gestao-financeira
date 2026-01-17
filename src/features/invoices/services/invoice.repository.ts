import { BaseRepository } from '@/lib/repositories/base.repository'
import type { Invoice } from '../types'

/**
 * Repository para gerenciar Invoices
 */
export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices')
  }

  /**
   * Busca faturas por cartão
   */
  async findByCard(userId: string, cardId: string): Promise<Invoice[]> {
    const all = await this.findAll(userId)
    return all.filter(invoice => invoice.cardId === cardId)
  }

  /**
   * Busca fatura específica por cartão e competência
   */
  async findByCardAndPeriod(
    userId: string, 
    cardId: string, 
    month: number, 
    year: number
  ): Promise<Invoice | null> {
    const all = await this.findAll(userId)
    return all.find(
      invoice => 
        invoice.cardId === cardId && 
        invoice.month === month && 
        invoice.year === year
    ) || null
  }

  /**
   * Busca faturas por período
   */
  async findByPeriod(userId: string, month: number, year: number): Promise<Invoice[]> {
    const all = await this.findAll(userId)
    return all.filter(invoice => invoice.month === month && invoice.year === year)
  }

  /**
   * Busca faturas pagas
   */
  async findPaid(userId: string): Promise<Invoice[]> {
    const all = await this.findAll(userId)
    return all.filter(invoice => invoice.isPaid)
  }

  /**
   * Busca faturas pendentes
   */
  async findPending(userId: string): Promise<Invoice[]> {
    const all = await this.findAll(userId)
    return all.filter(invoice => !invoice.isPaid)
  }

  /**
   * Busca faturas com vencimento próximo
   */
  async findDueSoon(userId: string, days: number = 7): Promise<Invoice[]> {
    const all = await this.findPending(userId)
    const today = new Date()
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    
    return all.filter(invoice => {
      const dueDate = new Date(invoice.dueDate)
      return dueDate >= today && dueDate <= futureDate
    })
  }

  /**
   * Calcula total de faturas por período
   */
  async getTotalByPeriod(userId: string, month: number, year: number): Promise<number> {
    const invoices = await this.findByPeriod(userId, month, year)
    return invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  }
}
