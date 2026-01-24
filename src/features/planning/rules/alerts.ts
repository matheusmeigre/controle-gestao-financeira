import type { 
  FinancialAlert, 
  FinancialContext, 
  PlanningSimulation,
  RiskLevel,
  Planning
} from '../types'
import { evaluateRiskLevel } from './calculations'

/**
 * Gera alertas financeiros baseados na simula\u00e7\u00e3o
 */
export function generateFinancialAlerts(
  simulation: PlanningSimulation,
  context: FinancialContext,
  targetAmount: number,
  category: string
): FinancialAlert[] {
  const alerts: FinancialAlert[] = []
  
  // Alerta: Planejamento invi\u00e1vel
  if (!simulation.isViable) {
    alerts.push({
      id: 'unviable',
      type: 'error',
      severity: 'critical',
      title: 'Planejamento Invi\u00e1vel',
      message: 'Este planejamento n\u00e3o \u00e9 sustent\u00e1vel com sua renda atual',
      explanation: simulation.viabilityReason || 'O valor mensal necess\u00e1rio excede sua capacidade financeira',
      recommendation: 'Considere aumentar o prazo, reduzir o valor alvo ou aguardar melhoria na sua situa\u00e7\u00e3o financeira',
      isBlocker: true
    })
  }
  
  // Alerta: Alto comprometimento da renda
  if (simulation.incomePercentage > 30) {
    const severity: RiskLevel = simulation.incomePercentage > 50 ? 'critical' : 'high'
    alerts.push({
      id: 'high_commitment',
      type: simulation.incomePercentage > 50 ? 'error' : 'warning',
      severity,
      title: 'Comprometimento Elevado da Renda',
      message: `Este planejamento comprometer\u00e1 ${simulation.incomePercentage.toFixed(0)}% da sua renda total`,
      explanation: 'Especialistas recomendam n\u00e3o comprometer mais de 30% da renda com planejamentos',
      recommendation: simulation.incomePercentage > 50 
        ? 'Reconsidere este planejamento ou aumente significativamente o prazo'
        : 'Considere aumentar o prazo em alguns meses para reduzir o impacto mensal',
      isBlocker: simulation.incomePercentage > 50
    })
  }
  
  // Alerta: Alto comprometimento da renda livre
  if (simulation.freeIncomePercentage > 60) {
    alerts.push({
      id: 'high_free_income_commitment',
      type: 'warning',
      severity: 'high',
      title: 'Renda Livre Muito Comprometida',
      message: `${simulation.freeIncomePercentage.toFixed(0)}% da sua renda dispon\u00edvel ser\u00e1 comprometida`,
      explanation: 'Isso reduz drasticamente sua margem de seguran\u00e7a para imprevistos',
      recommendation: 'Mantenha ao menos 40% da renda livre para emerg\u00eancias',
      isBlocker: false
    })
  }
  
  // Alerta: M\u00faltiplos planejamentos ativos
  if (context.activePlanningsCount >= 3) {
    alerts.push({
      id: 'multiple_plannings',
      type: 'warning',
      severity: 'medium',
      title: 'M\u00faltiplos Planejamentos Ativos',
      message: `Voc\u00ea j\u00e1 possui ${context.activePlanningsCount} planejamentos em andamento`,
      explanation: 'Gerenciar muitos objetivos simult\u00e2neos pode dificultar o cumprimento de todos',
      recommendation: 'Considere priorizar e finalizar alguns planejamentos antes de adicionar novos',
      isBlocker: false
    })
  }
  
  // Alerta: Prazo muito curto
  if (simulation.monthsToComplete < 3 && simulation.monthsToComplete > 0) {
    alerts.push({
      id: 'short_deadline',
      type: 'info',
      severity: 'medium',
      title: 'Prazo Curto',
      message: `Voc\u00ea tem apenas ${simulation.monthsToComplete} ${simulation.monthsToComplete === 1 ? 'm\u00eas' : 'meses'} para completar`,
      explanation: 'Prazos muito curtos exigem alto comprometimento mensal',
      recommendation: 'Se poss\u00edvel, estenda o prazo para reduzir a press\u00e3o or\u00e7ament\u00e1ria',
      isBlocker: false
    })
  }
  
  // Alerta: Prazo muito longo
  if (simulation.monthsToComplete > 36) {
    alerts.push({
      id: 'long_deadline',
      type: 'info',
      severity: 'low',
      title: 'Prazo Muito Longo',
      message: `Completar levar\u00e1 mais de ${Math.round(simulation.monthsToComplete / 12)} anos`,
      explanation: 'Planejamentos muito longos podem perder relev\u00e2ncia ou sofrer com infla\u00e7\u00e3o',
      recommendation: 'Revise periodicamente o valor alvo para ajustar \u00e0 infla\u00e7\u00e3o',
      isBlocker: false
    })
  }
  
  // Alertas espec\u00edficos por categoria
  if (category === 'emergency') {
    const recommended = context.monthlyFixedExpenses * 6
    if (targetAmount < recommended) {
      alerts.push({
        id: 'insufficient_reserve',
        type: 'warning',
        severity: 'high',
        title: 'Reserva Abaixo do Recomendado',
        message: `Especialistas recomendam ${6} meses de gastos fixos`,
        explanation: `Com seus gastos atuais, isso seria R$ ${recommended.toFixed(2)}`,
        recommendation: `Considere aumentar sua meta em R$ ${(recommended - targetAmount).toFixed(2)}`,
        isBlocker: false
      })
    }
  }
  
  // Alerta: Compara\u00e7\u00e3o parcelamento
  if (simulation.comparisons?.cashVsInstallments) {
    const comp = simulation.comparisons.cashVsInstallments
    if (comp.difference > targetAmount * 0.15) {
      alerts.push({
        id: 'expensive_installments',
        type: 'warning',
        severity: 'medium',
        title: 'Parcelamento Caro',
        message: `Parcelar custar\u00e1 R$ ${comp.difference.toFixed(2)} a mais`,
        explanation: `Isso representa ${((comp.difference / comp.cashTotal) * 100).toFixed(0)}% do valor \u00e0 vista`,
        recommendation: comp.recommendation,
        isBlocker: false
      })
    }
  }
  
  return alerts
}

/**
 * Avalia se os alertas impedem a cria\u00e7\u00e3o do planejamento
 */
export function hasBlockingAlerts(alerts: FinancialAlert[]): boolean {
  return alerts.some(alert => alert.isBlocker)
}

/**
 * Filtra alertas por severidade
 */
export function filterAlertsBySeverity(
  alerts: FinancialAlert[], 
  minSeverity: RiskLevel
): FinancialAlert[] {
  const severityOrder: Record<RiskLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3
  }
  
  const minLevel = severityOrder[minSeverity]
  
  return alerts.filter(alert => severityOrder[alert.severity] >= minLevel)
}

/**
 * Conta alertas por tipo
 */
export function countAlertsByType(alerts: FinancialAlert[]): {
  errors: number
  warnings: number
  info: number
} {
  return {
    errors: alerts.filter(a => a.type === 'error').length,
    warnings: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
  }
}
