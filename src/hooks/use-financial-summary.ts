'use client'

/**
 * useFinancialSummary Hook
 * 
 * Hook customizado para cálculos financeiros com cache e memoização
 * Separa claramente Saldo Atual (caixa) de Projeção (competência)
 */

import { useMemo } from 'react'
import type { Expense, Income, CardBill } from '@/types/expense'
import { calculateFinancialSummary, type FinancialSummary } from '@/lib/financial-calculations'

interface UseFinancialSummaryProps {
  incomes: Income[]
  expenses: Expense[]
  cardBills: CardBill[]
}

export function useFinancialSummary({
  incomes,
  expenses,
  cardBills,
}: UseFinancialSummaryProps): FinancialSummary {
  
  // Memoiza cálculo para evitar reprocessamento desnecessário
  const summary = useMemo(() => {
    return calculateFinancialSummary(incomes, expenses, cardBills)
  }, [incomes, expenses, cardBills])
  
  return summary
}

/**
 * Hook auxiliar para estado visual baseado no saldo
 */
export function useBalanceState(balance: number) {
  return useMemo(() => {
    const isPositive = balance > 0
    const isNeutral = balance === 0
    const isNegative = balance < 0
    
    return {
      isPositive,
      isNeutral,
      isNegative,
      color: isPositive 
        ? 'text-green-600 dark:text-green-500' 
        : isNeutral 
        ? 'text-muted-foreground' 
        : 'text-red-600 dark:text-red-500',
      bgColor: isPositive 
        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50' 
        : isNeutral 
        ? 'bg-muted dark:bg-slate-800/50' 
        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
      icon: isPositive ? 'trending-up' : isNeutral ? 'minus' : 'trending-down',
    }
  }, [balance])
}
