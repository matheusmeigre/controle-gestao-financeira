import type { 
  FinancialContext, 
  Planning, 
  PlanningSimulation,
  RiskLevel 
} from '../types'

/**
 * Calcula quanto o usu\u00e1rio precisa guardar por m\u00eas
 */
export function calculateMonthlyRequired(
  targetAmount: number,
  currentAmount: number,
  startDate: string,
  targetDate?: string
): number {
  const remaining = targetAmount - currentAmount
  
  if (remaining <= 0) return 0
  
  if (!targetDate) {
    // Sem prazo definido, sugerir 12 meses
    return remaining / 12
  }
  
  const start = new Date(startDate)
  const end = new Date(targetDate)
  const today = new Date()
  
  // Usar a data mais recente entre hoje e startDate
  const effectiveStart = today > start ? today : start
  
  const monthsDiff = (end.getFullYear() - effectiveStart.getFullYear()) * 12 + 
                     (end.getMonth() - effectiveStart.getMonth())
  
  // M\u00ednimo 1 m\u00eas
  const months = Math.max(monthsDiff, 1)
  
  return remaining / months
}

/**
 * Calcula em quantos meses o objetivo ser\u00e1 alcan\u00e7ado
 */
export function calculateMonthsToComplete(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number
): number {
  const remaining = targetAmount - currentAmount
  
  if (remaining <= 0) return 0
  if (monthlyContribution <= 0) return Infinity
  
  return Math.ceil(remaining / monthlyContribution)
}

/**
 * Calcula percentual da renda comprometida
 */
export function calculateIncomePercentage(
  monthlyAmount: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) return 0
  return (monthlyAmount / monthlyIncome) * 100
}

/**
 * Avalia se o planejamento \u00e9 vi\u00e1vel
 */
export function evaluateViability(
  monthlyRequired: number,
  context: FinancialContext
): { isViable: boolean; reason?: string } {
  // N\u00e3o h\u00e1 renda livre suficiente
  if (monthlyRequired > context.freeIncome) {
    return {
      isViable: false,
      reason: `Voc\u00ea precisa de R$ ${monthlyRequired.toFixed(2)}/m\u00eas, mas tem apenas R$ ${context.freeIncome.toFixed(2)} livres`
    }
  }
  
  // Comprometeria mais de 80% da renda livre
  const percentage = (monthlyRequired / context.freeIncome) * 100
  if (percentage > 80) {
    return {
      isViable: false,
      reason: `Este planejamento comprometeria ${percentage.toFixed(0)}% da sua renda livre`
    }
  }
  
  return { isViable: true }
}

/**
 * Avalia n\u00edvel de risco do planejamento
 */
export function evaluateRiskLevel(
  monthlyRequired: number,
  context: FinancialContext,
  targetAmount: number
): RiskLevel {
  const incomePercentage = calculateIncomePercentage(monthlyRequired, context.monthlyIncome)
  const freeIncomePercentage = calculateIncomePercentage(monthlyRequired, context.freeIncome)
  
  // Risco CR\u00cdTICO: mais de 50% da renda total ou 80% da renda livre
  if (incomePercentage > 50 || freeIncomePercentage > 80) {
    return 'critical'
  }
  
  // Risco ALTO: mais de 30% da renda total ou 60% da renda livre
  if (incomePercentage > 30 || freeIncomePercentage > 60) {
    return 'high'
  }
  
  // Risco M\u00c9DIO: mais de 20% da renda total ou 40% da renda livre
  if (incomePercentage > 20 || freeIncomePercentage > 40) {
    return 'medium'
  }
  
  return 'low'
}

/**
 * Calcula valor recomendado para reserva de emerg\u00eancia
 */
export function calculateRecommendedReserve(
  monthlyFixedCosts: number,
  months: number = 6
): number {
  return monthlyFixedCosts * months
}

/**
 * Compara compra \u00e0 vista vs parcelada
 */
export function compareCashVsInstallments(
  cashPrice: number,
  installments: number,
  interestRate: number
): {
  cashTotal: number
  installmentsTotal: number
  difference: number
  recommendation: string
} {
  const cashTotal = cashPrice
  const installmentAmount = cashPrice * Math.pow(1 + interestRate / 100, installments) / installments
  const installmentsTotal = installmentAmount * installments
  const difference = installmentsTotal - cashTotal
  
  let recommendation = ''
  
  if (difference > cashPrice * 0.2) {
    recommendation = `Parcelar custa ${((difference / cashTotal) * 100).toFixed(0)}% a mais. Considere esperar para comprar \u00e0 vista.`
  } else if (difference > 0) {
    recommendation = `Parcelar custa R$ ${difference.toFixed(2)} a mais, mas pode ser vi\u00e1vel se n\u00e3o comprometer seu or\u00e7amento.`
  } else {
    recommendation = `Compra sem juros. Parcelar pode ser uma boa op\u00e7\u00e3o.`
  }
  
  return {
    cashTotal,
    installmentsTotal,
    difference,
    recommendation
  }
}

/**
 * Simula impacto de esperar antes de comprar
 */
export function compareWaitVsNow(
  monthlyRequired: number,
  context: FinancialContext,
  monthsToWait: number
): {
  impactNow: number
  impactLater: number
  monthsToWait: number
  recommendation: string
} {
  const impactNow = calculateIncomePercentage(monthlyRequired, context.freeIncome)
  
  // Assumir que a renda livre aumenta ligeiramente com o tempo
  const futureContext = { ...context, freeIncome: context.freeIncome * 1.05 }
  const impactLater = calculateIncomePercentage(monthlyRequired, futureContext.freeIncome)
  
  const improvement = impactNow - impactLater
  
  let recommendation = ''
  
  if (improvement > 10) {
    recommendation = `Esperar ${monthsToWait} meses reduz o impacto em ${improvement.toFixed(0)}%. Recomendado.`
  } else if (improvement > 5) {
    recommendation = `Esperar ${monthsToWait} meses traz melhoria moderada de ${improvement.toFixed(0)}%.`
  } else {
    recommendation = `Esperar não traz benefício significativo. Pode prosseguir agora.`
  }
  
  return {
    impactNow,
    impactLater,
    monthsToWait,
    recommendation,
  }
}

/**
 * Gera simula\u00e7\u00e3o completa do planejamento
 */
export function generateSimulation(
  targetAmount: number,
  currentAmount: number,
  startDate: string,
  targetDate: string | undefined,
  context: FinancialContext,
  categoryData?: any
): PlanningSimulation {
  const monthlyRequired = calculateMonthlyRequired(targetAmount, currentAmount, startDate, targetDate)
  const monthsToComplete = calculateMonthsToComplete(targetAmount, currentAmount, monthlyRequired)
  const incomePercentage = calculateIncomePercentage(monthlyRequired, context.monthlyIncome)
  const freeIncomePercentage = calculateIncomePercentage(monthlyRequired, context.freeIncome)
  const viability = evaluateViability(monthlyRequired, context)
  
  const simulation: PlanningSimulation = {
    monthlyRequired,
    monthsToComplete: monthsToComplete === Infinity ? 999 : monthsToComplete,
    incomePercentage,
    freeIncomePercentage,
    isViable: viability.isViable,
    viabilityReason: viability.reason,
  }
  
  // Adicionar compara\u00e7\u00f5es espec\u00edficas
  if (categoryData) {
    simulation.comparisons = {}
    
    // Compara\u00e7\u00e3o \u00e0 vista vs parcelado
    if (categoryData.paymentMethod === 'installments' && categoryData.installments) {
      simulation.comparisons.cashVsInstallments = compareCashVsInstallments(
        targetAmount,
        categoryData.installments.numberOfInstallments,
        categoryData.installments.interestRate
      )
    }
    
    // Compara\u00e7\u00e3o esperar vs agora
    if (categoryData.canWait !== undefined) {
      simulation.comparisons.waitVsNow = compareWaitVsNow(
        monthlyRequired,
        context,
        3 // 3 meses de espera padr\u00e3o
      )
    }
  }
  
  return simulation
}
