import { PlanningRepository } from './planning.repository'
import type { 
  Planning, 
  CreatePlanningInput, 
  UpdatePlanningInput,
  PlanningIndicators,
  PlanningSummary,
  PlanningFilters,
  PlanningStatus
} from '../types'
import { PLANNING_STATUS } from '../types'

/**
 * Service para gerenciar planejamentos financeiros
 * Contém toda a lógica de negócio
 */
export class PlanningService {
  private repository = new PlanningRepository()

  /**
   * Cria um novo planejamento
   */
  async createPlanning(userId: string, data: CreatePlanningInput): Promise<Planning> {
    // Validações de negócio
    if (!data.name?.trim()) {
      throw new Error('Nome do planejamento é obrigatório')
    }

    if (data.targetAmount <= 0) {
      throw new Error('Valor alvo deve ser maior que zero')
    }

    if (data.currentAmount < 0) {
      throw new Error('Valor atual não pode ser negativo')
    }

    if (data.currentAmount > data.targetAmount) {
      console.warn('Planejamento criado com valor atual maior que o alvo')
    }

    // Validação de datas
    const startDate = new Date(data.startDate)
    if (isNaN(startDate.getTime())) {
      throw new Error('Data de início inválida')
    }

    if (data.targetDate) {
      const targetDate = new Date(data.targetDate)
      if (isNaN(targetDate.getTime())) {
        throw new Error('Data alvo inválida')
      }
      if (targetDate <= startDate) {
        throw new Error('Data alvo deve ser posterior à data de início')
      }
    }

    const planning: Planning = {
      id: this.generateId(),
      userId,
      name: data.name.trim(),
      category: data.category,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      startDate: data.startDate,
      targetDate: data.targetDate,
      status: this.determineInitialStatus(data.currentAmount || 0, data.targetAmount),
      notes: data.notes?.trim(),
      linkedExpenseIds: data.linkedExpenseIds || [],
      categoryData: data.categoryData,
      creationContext: data.creationContext,
      simulation: data.simulation,
      alerts: data.alerts || [],
      riskLevel: data.riskLevel || 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await this.repository.create(userId, planning)
  }

  /**
   * Atualiza um planejamento existente
   */
  async updatePlanning(userId: string, input: UpdatePlanningInput): Promise<Planning | null> {
    const { id, ...updates } = input

    const existing = await this.repository.findById(userId, id)
    if (!existing) {
      throw new Error('Planejamento não encontrado')
    }

    // Validações
    if (updates.targetAmount !== undefined && updates.targetAmount <= 0) {
      throw new Error('Valor alvo deve ser maior que zero')
    }

    if (updates.currentAmount !== undefined && updates.currentAmount < 0) {
      throw new Error('Valor atual não pode ser negativo')
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Nome não pode ser vazio')
    }

    // Validação de datas
    if (updates.targetDate !== undefined || updates.startDate !== undefined) {
      const startDate = new Date(updates.startDate || existing.startDate)
      const targetDate = updates.targetDate ? new Date(updates.targetDate) : 
                         existing.targetDate ? new Date(existing.targetDate) : null

      if (targetDate && targetDate <= startDate) {
        throw new Error('Data alvo deve ser posterior à data de início')
      }
    }

    // Atualizar status automaticamente se valores mudarem
    const newCurrentAmount = updates.currentAmount ?? existing.currentAmount
    const newTargetAmount = updates.targetAmount ?? existing.targetAmount
    
    if (updates.status === undefined) {
      updates.status = this.determineStatus(
        newCurrentAmount,
        newTargetAmount,
        existing.status
      )
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    }

    return await this.repository.update(userId, id, updatedData)
  }

  /**
   * Deleta um planejamento
   */
  async deletePlanning(userId: string, id: string): Promise<boolean> {
    const planning = await this.repository.findById(userId, id)
    if (!planning) {
      throw new Error('Planejamento não encontrado')
    }

    // Hard delete - remove permanentemente
    return await this.repository.delete(userId, id)
  }

  /**
   * Busca todos os planejamentos
   */
  async getAllPlannings(userId: string): Promise<Planning[]> {
    const plannings = await this.repository.findAll(userId)
    // Filtra planejamentos cancelados por padrão
    return plannings.filter(p => p.status !== PLANNING_STATUS.CANCELLED)
  }

  /**
   * Busca planejamentos com filtros
   */
  async getPlanningsWithFilters(userId: string, filters: PlanningFilters): Promise<Planning[]> {
    return await this.repository.findWithFilters(userId, filters)
  }

  /**
   * Busca um planejamento por ID
   */
  async getPlanningById(userId: string, id: string): Promise<Planning | null> {
    return await this.repository.findById(userId, id)
  }

  /**
   * Calcula indicadores de um planejamento
   */
  calculateIndicators(planning: Planning): PlanningIndicators {
    const progress = Math.min(
      Math.round((planning.currentAmount / planning.targetAmount) * 100),
      100
    )

    const isOverBudget = planning.currentAmount > planning.targetAmount
    const isCompleted = planning.status === PLANNING_STATUS.COMPLETED
    const isCancelled = planning.status === PLANNING_STATUS.CANCELLED

    let isDelayed = false
    let daysRemaining: number | undefined

    if (planning.targetDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const targetDate = new Date(planning.targetDate)
      targetDate.setHours(0, 0, 0, 0)

      const diffTime = targetDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      isDelayed = daysRemaining < 0 && !isCompleted && !isCancelled
    }

    const amountRemaining = Math.max(planning.targetAmount - planning.currentAmount, 0)

    return {
      progress,
      isOverBudget,
      isDelayed,
      isCompleted,
      isCancelled,
      daysRemaining,
      amountRemaining,
    }
  }

  /**
   * Calcula resumo de todos os planejamentos
   */
  async getSummary(userId: string): Promise<PlanningSummary> {
    const plannings = await this.repository.findAll(userId)

    const summary: PlanningSummary = {
      total: plannings.length,
      planned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      totalTargetAmount: 0,
      totalCurrentAmount: 0,
      totalProgress: 0,
    }

    plannings.forEach((planning) => {
      // Contagem por status
      switch (planning.status) {
        case PLANNING_STATUS.PLANNED:
          summary.planned++
          break
        case PLANNING_STATUS.IN_PROGRESS:
          summary.inProgress++
          break
        case PLANNING_STATUS.COMPLETED:
          summary.completed++
          break
        case PLANNING_STATUS.CANCELLED:
          summary.cancelled++
          break
      }

      // Somas
      if (planning.status !== PLANNING_STATUS.CANCELLED) {
        summary.totalTargetAmount += planning.targetAmount
        summary.totalCurrentAmount += planning.currentAmount
      }
    })

    // Progresso total
    if (summary.totalTargetAmount > 0) {
      summary.totalProgress = Math.round(
        (summary.totalCurrentAmount / summary.totalTargetAmount) * 100
      )
    }

    return summary
  }

  /**
   * Adiciona valor ao planejamento
   */
  async addAmount(userId: string, planningId: string, amount: number): Promise<Planning | null> {
    if (amount <= 0) {
      throw new Error('Valor deve ser maior que zero')
    }

    const planning = await this.repository.findById(userId, planningId)
    if (!planning) {
      throw new Error('Planejamento não encontrado')
    }

    const newCurrentAmount = planning.currentAmount + amount
    const newStatus = this.determineStatus(newCurrentAmount, planning.targetAmount, planning.status)

    return await this.repository.update(userId, planningId, {
      currentAmount: newCurrentAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
  }

  /**
   * Vincula um gasto ao planejamento e atualiza o valor
   */
  async linkExpense(
    userId: string, 
    planningId: string, 
    expenseId: string,
    expenseAmount: number
  ): Promise<Planning | null> {
    if (expenseAmount < 0) {
      throw new Error('Valor do gasto inválido')
    }

    // Vincular o gasto
    const planning = await this.repository.linkExpense(userId, planningId, expenseId)
    if (!planning) {
      throw new Error('Planejamento não encontrado')
    }

    // Atualizar o valor atual
    return await this.addAmount(userId, planningId, expenseAmount)
  }

  /**
   * Desvincula um gasto do planejamento e atualiza o valor
   */
  async unlinkExpense(
    userId: string,
    planningId: string,
    expenseId: string,
    expenseAmount: number
  ): Promise<Planning | null> {
    if (expenseAmount < 0) {
      throw new Error('Valor do gasto inválido')
    }

    const planning = await this.repository.findById(userId, planningId)
    if (!planning) {
      throw new Error('Planejamento não encontrado')
    }

    // Desvincular o gasto
    await this.repository.unlinkExpense(userId, planningId, expenseId)

    // Atualizar o valor atual
    const newCurrentAmount = Math.max(planning.currentAmount - expenseAmount, 0)
    const newStatus = this.determineStatus(newCurrentAmount, planning.targetAmount, planning.status)

    return await this.repository.update(userId, planningId, {
      currentAmount: newCurrentAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
  }

  /**
   * Marca planejamento como completo
   */
  async markAsCompleted(userId: string, planningId: string): Promise<Planning | null> {
    return await this.repository.update(userId, planningId, {
      status: PLANNING_STATUS.COMPLETED,
      updatedAt: new Date(),
    })
  }

  /**
   * Marca planejamento como cancelado
   */
  async markAsCancelled(userId: string, planningId: string): Promise<Planning | null> {
    return await this.repository.update(userId, planningId, {
      status: PLANNING_STATUS.CANCELLED,
      updatedAt: new Date(),
    })
  }

  /**
   * Busca planejamentos atrasados
   */
  async getDelayedPlannings(userId: string): Promise<Planning[]> {
    return await this.repository.findDelayed(userId)
  }

  /**
   * Busca planejamentos com orçamento estourado
   */
  async getOverBudgetPlannings(userId: string): Promise<Planning[]> {
    return await this.repository.findOverBudget(userId)
  }

  /**
   * Determina o status inicial baseado nos valores
   */
  private determineInitialStatus(currentAmount: number, targetAmount: number): PlanningStatus {
    if (currentAmount === 0) {
      return PLANNING_STATUS.PLANNED
    }
    if (currentAmount >= targetAmount) {
      return PLANNING_STATUS.COMPLETED
    }
    return PLANNING_STATUS.IN_PROGRESS
  }

  /**
   * Determina o status baseado nos valores atuais
   */
  private determineStatus(
    currentAmount: number, 
    targetAmount: number,
    currentStatus: PlanningStatus
  ): 'planned' | 'in_progress' | 'completed' | 'cancelled' {
    // Não alterar se já está cancelado
    if (currentStatus === PLANNING_STATUS.CANCELLED) {
      return currentStatus as 'cancelled'
    }

    // Completado se atingiu ou ultrapassou o alvo
    if (currentAmount >= targetAmount) {
      return PLANNING_STATUS.COMPLETED as 'completed'
    }

    // Em progresso se tem algum valor
    if (currentAmount > 0) {
      return PLANNING_STATUS.IN_PROGRESS as 'in_progress'
    }

    // Planejado se não tem valor
    return PLANNING_STATUS.PLANNED as 'planned'
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return crypto.randomUUID()
  }
}
