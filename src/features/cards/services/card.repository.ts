import { BaseRepository } from '@/lib/repositories/base.repository'
import type { CreditCard } from '../types'

/**
 * Repository para gerenciar Cards
 */
export class CardRepository extends BaseRepository<CreditCard> {
  constructor() {
    super('cards')
  }

  /**
   * Busca cartões ativos
   */
  async findActive(userId: string): Promise<CreditCard[]> {
    const all = await this.findAll(userId)
    return all.filter(card => card.isActive)
  }

  /**
   * Busca cartões por banco
   */
  async findByBank(userId: string, bankName: string): Promise<CreditCard[]> {
    const all = await this.findAll(userId)
    return all.filter(card => card.bankName === bankName)
  }

  /**
   * Busca cartão pelos últimos 4 dígitos
   */
  async findByLast4Digits(userId: string, last4: string): Promise<CreditCard | null> {
    const all = await this.findAll(userId)
    return all.find(card => card.last4Digits === last4) || null
  }

  /**
   * Busca cartões com fechamento próximo
   */
  async findClosingSoon(userId: string, days: number = 7): Promise<CreditCard[]> {
    const all = await this.findActive(userId)
    const today = new Date().getDate()
    
    return all.filter(card => {
      const daysUntilClosing = card.closingDay - today
      return daysUntilClosing >= 0 && daysUntilClosing <= days
    })
  }

  /**
   * Busca cartões com vencimento próximo
   */
  async findDueSoon(userId: string, days: number = 7): Promise<CreditCard[]> {
    const all = await this.findActive(userId)
    const today = new Date().getDate()
    
    return all.filter(card => {
      const daysUntilDue = card.dueDay - today
      return daysUntilDue >= 0 && daysUntilDue <= days
    })
  }
}
