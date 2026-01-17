import { CardRepository } from './card.repository'
import type { CreditCard, CreateCreditCardInput, UpdateCreditCardInput } from '../types'

/**
 * Service para gerenciar cartões de crédito
 */
export class CardService {
  private repository = new CardRepository()

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Adiciona um novo cartão
   */
  async addCard(userId: string, data: CreateCreditCardInput): Promise<CreditCard> {
    // Validações de negócio
    if (!data.nickname?.trim()) {
      throw new Error('Apelido é obrigatório')
    }

    if (!data.bankName?.trim()) {
      throw new Error('Nome do banco é obrigatório')
    }

    if (!data.last4Digits || !/^\d{4}$/.test(data.last4Digits)) {
      throw new Error('Últimos 4 dígitos inválidos')
    }

    if (data.closingDay < 1 || data.closingDay > 31) {
      throw new Error('Dia de fechamento inválido (1-31)')
    }

    if (data.dueDay < 1 || data.dueDay > 31) {
      throw new Error('Dia de vencimento inválido (1-31)')
    }

    // Verifica se já existe cartão com os mesmos últimos 4 dígitos
    const existing = await this.repository.findByLast4Digits(userId, data.last4Digits)
    if (existing && existing.bankName === data.bankName) {
      throw new Error('Já existe um cartão deste banco com estes últimos 4 dígitos')
    }

    const card: CreditCard = {
      id: this.generateId(),
      userId,
      nickname: data.nickname.trim(),
      bankName: data.bankName.trim(),
      brand: data.brand,
      last4Digits: data.last4Digits,
      closingDay: data.closingDay,
      dueDay: data.dueDay,
      creditLimit: data.creditLimit,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return await this.repository.create(userId, card)
  }

  /**
   * Atualiza um cartão existente
   */
  async updateCard(userId: string, input: UpdateCreditCardInput): Promise<CreditCard | null> {
    const { id, ...updates } = input

    // Validações
    if (updates.closingDay !== undefined && (updates.closingDay < 1 || updates.closingDay > 31)) {
      throw new Error('Dia de fechamento inválido (1-31)')
    }

    if (updates.dueDay !== undefined && (updates.dueDay < 1 || updates.dueDay > 31)) {
      throw new Error('Dia de vencimento inválido (1-31)')
    }

    const updated = { ...updates, updatedAt: new Date() }
    return await this.repository.update(userId, id, updated)
  }

  /**
   * Remove (desativa) um cartão
   */
  async deleteCard(userId: string, id: string): Promise<boolean> {
    // Soft delete - apenas desativa
    const updated = await this.repository.update(userId, id, { 
      isActive: false,
      updatedAt: new Date()
    })
    return updated !== null
  }

  /**
   * Remove permanentemente um cartão
   */
  async permanentlyDeleteCard(userId: string, id: string): Promise<boolean> {
    return await this.repository.delete(userId, id)
  }

  /**
   * Busca todos os cartões
   */
  async getAllCards(userId: string): Promise<CreditCard[]> {
    return await this.repository.findAll(userId)
  }

  /**
   * Busca cartões ativos
   */
  async getActiveCards(userId: string): Promise<CreditCard[]> {
    return await this.repository.findActive(userId)
  }

  /**
   * Busca cartões por banco
   */
  async getCardsByBank(userId: string, bankName: string): Promise<CreditCard[]> {
    return await this.repository.findByBank(userId, bankName)
  }

  /**
   * Busca cartões com fechamento próximo
   */
  async getCardsClosingSoon(userId: string, days: number = 7): Promise<CreditCard[]> {
    return await this.repository.findClosingSoon(userId, days)
  }

  /**
   * Busca cartões com vencimento próximo
   */
  async getCardsDueSoon(userId: string, days: number = 7): Promise<CreditCard[]> {
    return await this.repository.findDueSoon(userId, days)
  }

  /**
   * Reativa um cartão
   */
  async reactivateCard(userId: string, id: string): Promise<CreditCard | null> {
    return await this.repository.update(userId, id, { 
      isActive: true,
      updatedAt: new Date()
    })
  }
}
