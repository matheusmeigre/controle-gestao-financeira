import type { FinancialSummary } from '@domain/financial-calculations'

export { calculateFinancialSummary } from '@domain/financial-calculations'
export type { FinancialSummary } from '@domain/financial-calculations'

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Calcula porcentagem de gasto
 */
export function calculateExpensePercentage(spent: number, total: number): number {
  if (total === 0) return 0
  return Math.round((spent / total) * 100)
}

/**
 * Verifica se está no vermelho
 */
export function isOverBudget(summary: FinancialSummary): boolean {
  return summary.currentBalance < 0
}

/**
 * Verifica se projeção é negativa
 */
export function willBeOverBudget(summary: FinancialSummary): boolean {
  return summary.projectedBalance < 0
}
