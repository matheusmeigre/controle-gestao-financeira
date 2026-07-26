import type { Income } from '../types'

/**
 * @deprecated Use server actions (@/server/actions/incomes) directly instead.
 * Mantido apenas para compatibilidade durante migração.
 */
export class IncomeService {
  /**
   * Calcula total recebido a partir de dados já carregados.
   */
  getTotalReceived(incomes: Income[]): number {
    return incomes
      .filter(i => i.status === 'received')
      .reduce((sum, i) => sum + i.amount, 0)
  }
}
