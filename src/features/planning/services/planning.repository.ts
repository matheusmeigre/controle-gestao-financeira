import { BaseRepository } from '@/lib/repositories/base.repository'
import type { Planning, PlanningFilters } from '../types'

/**
 * Repository para planejamentos financeiros
 * Extende BaseRepository para aproveitar funcionalidades comuns
 */
export class PlanningRepository extends BaseRepository<Planning> {
  constructor() {
    super('plannings')
  }

  /**
   * Busca planejamentos por status
   */
  async findByStatus(userId: string, status: string): Promise<Planning[]> {
    const all = await this.findAll(userId)
    return all.filter((planning) => planning.status === status)
  }

  /**
   * Busca planejamentos por categoria
   */
  async findByCategory(userId: string, category: string): Promise<Planning[]> {
    const all = await this.findAll(userId)
    return all.filter((planning) => planning.category === category)
  }

  /**
   * Busca planejamentos ativos (não cancelados nem completados)
   */
  async findActive(userId: string): Promise<Planning[]> {
    const all = await this.findAll(userId)
    return all.filter(
      (planning) => 
        planning.status !== 'cancelled' && 
        planning.status !== 'completed'
    )
  }

  /**
   * Busca planejamentos com filtros
   */
  async findWithFilters(userId: string, filters: PlanningFilters): Promise<Planning[]> {
    let plannings = await this.findAll(userId)

    // Filtro por status
    if (filters.status) {
      plannings = plannings.filter((p) => p.status === filters.status)
    }

    // Filtro por categoria
    if (filters.category) {
      plannings = plannings.filter((p) => p.category === filters.category)
    }

    // Filtro por busca (nome ou notas)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      plannings = plannings.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por data de início
    if (filters.startDateFrom) {
      const fromDate = new Date(filters.startDateFrom)
      plannings = plannings.filter((p) => new Date(p.startDate) >= fromDate)
    }

    if (filters.startDateTo) {
      const toDate = new Date(filters.startDateTo)
      plannings = plannings.filter((p) => new Date(p.startDate) <= toDate)
    }

    return plannings
  }

  /**
   * Busca planejamentos atrasados
   */
  async findDelayed(userId: string): Promise<Planning[]> {
    const active = await this.findActive(userId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return active.filter((planning) => {
      if (!planning.targetDate) return false
      const targetDate = new Date(planning.targetDate)
      targetDate.setHours(0, 0, 0, 0)
      return targetDate < today && planning.currentAmount < planning.targetAmount
    })
  }

  /**
   * Busca planejamentos com orçamento estourado
   */
  async findOverBudget(userId: string): Promise<Planning[]> {
    const active = await this.findActive(userId)
    return active.filter((planning) => planning.currentAmount > planning.targetAmount)
  }

  /**
   * Busca planejamentos vinculados a um gasto específico
   */
  async findByExpenseId(userId: string, expenseId: string): Promise<Planning[]> {
    const all = await this.findAll(userId)
    return all.filter((planning) => planning.linkedExpenseIds.includes(expenseId))
  }

  /**
   * Vincula um gasto a um planejamento
   */
  async linkExpense(userId: string, planningId: string, expenseId: string): Promise<Planning | null> {
    const planning = await this.findById(userId, planningId)
    if (!planning) return null

    if (planning.linkedExpenseIds.includes(expenseId)) {
      return planning // Já vinculado
    }

    const updatedLinkedIds = [...planning.linkedExpenseIds, expenseId]
    return await this.update(userId, planningId, { 
      linkedExpenseIds: updatedLinkedIds 
    })
  }

  /**
   * Desvincula um gasto de um planejamento
   */
  async unlinkExpense(userId: string, planningId: string, expenseId: string): Promise<Planning | null> {
    const planning = await this.findById(userId, planningId)
    if (!planning) return null

    const updatedLinkedIds = planning.linkedExpenseIds.filter(id => id !== expenseId)
    return await this.update(userId, planningId, { 
      linkedExpenseIds: updatedLinkedIds 
    })
  }

  /**
   * Override do deserializeDates para incluir campos específicos de Planning
   */
  protected deserializeDates(item: any): Planning {
    const deserialized = super.deserializeDates(item)
    
    // Garantir que linkedExpenseIds seja array
    if (!deserialized.linkedExpenseIds) {
      deserialized.linkedExpenseIds = []
    }
    
    return deserialized as Planning
  }
}
