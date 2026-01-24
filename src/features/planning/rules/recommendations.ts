import type { 
  PlanningRecommendation, 
  FinancialContext,
  PlanningSimulation 
} from '../types'
import { 
  calculateMonthlyRequired, 
  calculateIncomePercentage,
  evaluateRiskLevel 
} from './calculations'

/**
 * Gera recomenda\u00e7\u00f5es de ajuste para o planejamento
 */
export function generateRecommendations(
  targetAmount: number,
  currentAmount: number,
  startDate: string,
  targetDate: string | undefined,
  simulation: PlanningSimulation,
  context: FinancialContext
): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = []
  
  // Recomenda\u00e7\u00e3o: Aumentar prazo
  if (simulation.freeIncomePercentage > 50 && targetDate) {
    const currentMonths = simulation.monthsToComplete
    const suggestedMonths = Math.ceil(currentMonths * 1.5)
    const newMonthlyRequired = calculateMonthlyRequired(
      targetAmount, 
      currentAmount, 
      startDate,
      addMonthsToDate(startDate, suggestedMonths)
    )
    const newPercentage = calculateIncomePercentage(newMonthlyRequired, context.freeIncome)
    const improvement = simulation.freeIncomePercentage - newPercentage
    
    recommendations.push({
      type: 'increase_deadline',
      title: `Estender prazo para ${suggestedMonths} meses`,
      description: `Aumentar o prazo em ${Math.round(suggestedMonths - currentMonths)} meses reduz significativamente o impacto mensal`,
      impact: {
        before: simulation.freeIncomePercentage,
        after: newPercentage,
        improvement
      },
      actionable: true
    })
  }
  
  // Recomenda\u00e7\u00e3o: Reduzir valor alvo
  if (!simulation.isViable) {
    const maxViableAmount = context.freeIncome * 0.6 * simulation.monthsToComplete
    const suggestedAmount = Math.floor(maxViableAmount + currentAmount)
    const reduction = targetAmount - suggestedAmount
    
    if (suggestedAmount > currentAmount) {
      recommendations.push({
        type: 'reduce_amount',
        title: `Reduzir meta para R$ ${suggestedAmount.toFixed(2)}`,
        description: `Com sua renda atual, uma meta de R$ ${suggestedAmount.toFixed(2)} \u00e9 mais sustent\u00e1vel`,
        impact: {
          before: targetAmount,
          after: suggestedAmount,
          improvement: (reduction / targetAmount) * 100
        },
        actionable: true
      })
    }
  }
  
  // Recomenda\u00e7\u00e3o: Aguardar melhoria financeira
  if (simulation.incomePercentage > 40) {
    const monthsToWait = 3
    const expectedImprovement = 10 // Assumir 10% de melhoria
    
    recommendations.push({
      type: 'wait_period',
      title: `Aguardar ${monthsToWait} meses`,
      description: 'Esperar alguns meses pode melhorar sua capacidade financeira e reduzir o risco',
      impact: {
        before: simulation.incomePercentage,
        after: simulation.incomePercentage * (1 - expectedImprovement / 100),
        improvement: expectedImprovement
      },
      actionable: true
    })
  }
  
  // Recomenda\u00e7\u00e3o: Ajustar forma de pagamento
  if (simulation.comparisons?.cashVsInstallments) {
    const comp = simulation.comparisons.cashVsInstallments
    if (comp.difference > 0) {
      const savingsPercentage = (comp.difference / comp.installmentsTotal) * 100
      
      recommendations.push({
        type: 'adjust_payment',
        title: 'Preferir pagamento \u00e0 vista',
        description: `Economize R$ ${comp.difference.toFixed(2)} pagando \u00e0 vista ao inv\u00e9s de parcelar`,
        impact: {
          before: comp.installmentsTotal,
          after: comp.cashTotal,
          improvement: savingsPercentage
        },
        actionable: true
      })
    }
  }
  
  // Recomenda\u00e7\u00e3o: Reconsiderar necessidade
  if (evaluateRiskLevel(simulation.monthlyRequired, context, targetAmount) === 'critical') {
    recommendations.push({
      type: 'reconsider',
      title: 'Reconsiderar prioridade',
      description: 'Este planejamento representa risco crítico para sua saúde financeira',
      impact: {
        before: simulation.incomePercentage,
        after: 0,
        improvement: 100
      },
      actionable: false
    })
  }
  
  return recommendations
}

/**
 * Ordena recomendações por impacto
 */
export function sortRecommendationsByImpact(
  recommendations: PlanningRecommendation[]
): PlanningRecommendation[] {
  return [...recommendations].sort((a, b) => b.impact.improvement - a.impact.improvement)
}

/**
 * Filtra recomendações acionáveis
 */
export function getActionableRecommendations(
  recommendations: PlanningRecommendation[]
): PlanningRecommendation[] {
  return recommendations.filter(r => r.actionable)
}

/**
 * Utilitário: adiciona meses a uma data
 */
function addMonthsToDate(dateString: string, months: number): string {
  const date = new Date(dateString)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}
