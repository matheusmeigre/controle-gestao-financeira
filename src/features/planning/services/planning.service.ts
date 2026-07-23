import type { 
  Planning, 
  PlanningIndicators,
  PlanningSummary,
  PlanningStatus
} from '../types'
import { PLANNING_STATUS } from '../types'

/**
 * Service para gerenciar planejamentos financeiros
 * Contém lógica de negócio pura (sem acesso a repository/localStorage).
 * Dados devem ser obtidos via server actions (@/server/actions/planning).
 */
export class PlanningService {
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
   * Calcula o resumo a partir de um array já carregado (sem acesso a repositório).
   */
  calculateSummaryFromData(plannings: Planning[]): PlanningSummary {
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
      switch (planning.status) {
        case PLANNING_STATUS.PLANNED: summary.planned++; break
        case PLANNING_STATUS.IN_PROGRESS: summary.inProgress++; break
        case PLANNING_STATUS.COMPLETED: summary.completed++; break
        case PLANNING_STATUS.CANCELLED: summary.cancelled++; break
      }
      if (planning.status !== PLANNING_STATUS.CANCELLED) {
        summary.totalTargetAmount += planning.targetAmount
        summary.totalCurrentAmount += planning.currentAmount
      }
    })

    if (summary.totalTargetAmount > 0) {
      summary.totalProgress = Math.round(
        (summary.totalCurrentAmount / summary.totalTargetAmount) * 100
      )
    }
    return summary
  }

  /**
   * Determina o status baseado nos valores atuais
   */
  determineStatus(
    currentAmount: number, 
    targetAmount: number,
    currentStatus: PlanningStatus
  ): PlanningStatus {
    if (currentStatus === PLANNING_STATUS.CANCELLED) {
      return 'cancelled'
    }
    if (currentAmount >= targetAmount) {
      return 'completed'
    }
    if (currentAmount > 0) {
      return 'in_progress'
    }
    return 'planned'
  }
}
