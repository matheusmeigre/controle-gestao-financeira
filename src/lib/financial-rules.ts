/**
 * Regras Financeiras por Tipo de Planejamento
 * 
 * Cada tipo de planejamento possui lógica própria de:
 * - Cálculo de aportes
 * - Validações específicas
 * - Alertas contextuais
 * - Métricas de progresso
 */

import { addDays, differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns'

export interface FinancialCalculation {
  remaining: number // Valor restante para atingir o alvo
  progress: number // Progresso em %
  dailyRequired: number // Aporte necessário por dia
  weeklyRequired: number // Aporte necessário por semana
  monthlyRequired: number // Aporte necessário por mês
  daysRemaining: number // Dias até a data alvo
  weeksRemaining: number // Semanas até a data alvo
  monthsRemaining: number // Meses até a data alvo
  isAchievable: boolean // Se é viável com base no prazo
  alerts: FinancialAlert[]
}

export interface FinancialAlert {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
}

/**
 * Calcula métricas financeiras para planejamento de VIAGEM
 */
export function calculateTravelFinancials(
  targetAmount: number,
  currentAmount: number,
  targetDate: string | null,
  numberOfPeople: number = 1
): FinancialCalculation {
  const remaining = Math.max(0, targetAmount - currentAmount)
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

  // Se não há data alvo, retorna apenas métricas básicas
  if (!targetDate) {
    return {
      remaining,
      progress,
      dailyRequired: 0,
      weeklyRequired: 0,
      monthlyRequired: 0,
      daysRemaining: 0,
      weeksRemaining: 0,
      monthsRemaining: 0,
      isAchievable: false,
      alerts: [
        {
          type: 'info',
          title: 'Defina uma data',
          message: 'Adicione a data da viagem para calcular quanto economizar por mês.',
        },
      ],
    }
  }

  const today = new Date()
  const target = new Date(targetDate)
  const daysRemaining = Math.max(0, differenceInDays(target, today))
  const weeksRemaining = Math.max(0, differenceInWeeks(target, today))
  const monthsRemaining = Math.max(0, differenceInMonths(target, today))

  // Cálculo de aportes necessários
  const dailyRequired = daysRemaining > 0 ? remaining / daysRemaining : 0
  const weeklyRequired = weeksRemaining > 0 ? remaining / weeksRemaining : 0
  const monthlyRequired = monthsRemaining > 0 ? remaining / monthsRemaining : 0

  // Validação de viabilidade
  const isAchievable = daysRemaining > 0 && remaining > 0

  // Alertas contextuais para VIAGEM
  const alerts: FinancialAlert[] = []

  if (progress >= 100) {
    alerts.push({
      type: 'success',
      title: 'Parabéns! Objetivo atingido! 🎉',
      message: 'Você já possui o valor necessário para esta viagem!',
    })
  } else if (daysRemaining <= 0) {
    alerts.push({
      type: 'error',
      title: 'Data da viagem já passou',
      message: 'Atualize a data da viagem ou ajuste o planejamento.',
    })
  } else if (daysRemaining < 30) {
    const costPerPerson = targetAmount / numberOfPeople
    alerts.push({
      type: 'warning',
      title: 'Viagem se aproxima',
      message: `Faltam apenas ${daysRemaining} dias! Economize ${dailyRequired.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} por dia.`,
    })
  } else if (monthlyRequired > 0) {
    const costPerPerson = targetAmount / numberOfPeople
    alerts.push({
      type: 'info',
      title: 'Planejamento em dia',
      message: `Economize ${monthlyRequired.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}/mês para atingir o objetivo. Custo por pessoa: ${costPerPerson.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}.`,
    })
  }

  // Alerta específico para viagem em grupo
  if (numberOfPeople > 1) {
    const costPerPerson = targetAmount / numberOfPeople
    alerts.push({
      type: 'info',
      title: `Viagem em grupo (${numberOfPeople} pessoas)`,
      message: `Custo por pessoa: ${costPerPerson.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })}. Considere criar planejamentos individuais se cada um for economizar separadamente.`,
    })
  }

  return {
    remaining,
    progress: Math.min(progress, 100),
    dailyRequired,
    weeklyRequired,
    monthlyRequired,
    daysRemaining,
    weeksRemaining,
    monthsRemaining,
    isAchievable,
    alerts,
  }
}

/**
 * Valida se reduzir o valor alvo é permitido
 */
export function validateTargetAmountReduction(
  newTargetAmount: number,
  currentAmount: number
): { valid: boolean; message?: string } {
  if (newTargetAmount < currentAmount) {
    return {
      valid: false,
      message: `O valor alvo não pode ser menor que o valor já acumulado (${currentAmount.toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL',
        }
      )}).`,
    }
  }

  return { valid: true }
}

/**
 * Sugere aporte mensal ideal baseado em prazo
 */
export function suggestMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: string,
  maxPercentageOfIncome: number = 20
): {
  suggested: number
  isSafe: boolean
  message: string
} {
  const remaining = targetAmount - currentAmount
  const today = new Date()
  const target = new Date(targetDate)
  const monthsRemaining = Math.max(1, differenceInMonths(target, today))

  const monthlyRequired = remaining / monthsRemaining

  return {
    suggested: monthlyRequired,
    isSafe: true, // Pode integrar com renda do usuário
    message: `Para atingir o objetivo, economize ${monthlyRequired.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })}/mês durante ${monthsRemaining} ${monthsRemaining === 1 ? 'mês' : 'meses'}.`,
  }
}
