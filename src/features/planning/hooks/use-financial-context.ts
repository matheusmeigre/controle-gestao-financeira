'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import type { FinancialContext } from '../types'
import { evaluateRiskLevel } from '../rules'

// Cache global para reduzir leituras de localStorage
let cachedContext: FinancialContext | null = null
let cacheUserId: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 30000 // 30 segundos

/**
 * Invalida o cache do contexto financeiro
 * Deve ser chamado sempre que houver mudanças em receitas, gastos ou planejamentos
 */
export function invalidateFinancialContextCache() {
  cachedContext = null
  cacheUserId = null
  cacheTimestamp = 0
}

/**
 * Hook para obter contexto financeiro completo do usuário
 * 
 * Este hook calcula automaticamente:
 * - Renda mensal e média
 * - Gastos fixos e variáveis
 * - Planejamentos ativos e seus compromissos
 * - Renda livre disponível
 * - Nível de risco financeiro
 */
export function useFinancialContext() {
  const { user } = useUser()
  const [context, setContext] = useState<FinancialContext | null>(null)
  const [loading, setLoading] = useState(true)

  const calculateContext = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    // Verifica cache
    const now = Date.now()
    if (cachedContext && cacheUserId === user.id && (now - cacheTimestamp) < CACHE_DURATION) {
      setContext(cachedContext)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Buscar todos os dados de uma vez para reduzir I/O
      const incomesData = localStorage.getItem(`incomes_${user.id}`)
      const expensesData = localStorage.getItem(`expenses_${user.id}`)
      const planningsData = localStorage.getItem(`plannings_${user.id}`)
      
      const incomes = incomesData ? JSON.parse(incomesData) : []
      const expenses = expensesData ? JSON.parse(expensesData) : []
      const plannings = planningsData ? JSON.parse(planningsData) : []
      
      // Calcular renda mensal
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const currentMonthIncomes = incomes.filter((income: any) => {
        const date = new Date(income.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      
      const monthlyIncome = currentMonthIncomes.reduce(
        (sum: number, income: any) => sum + income.amount, 
        0
      )

      // Calcular m\u00e9dia dos \u00faltimos 3 meses
      const last3MonthsIncomes = incomes.filter((income: any) => {
        const date = new Date(income.date)
        const monthsDiff = (currentYear - date.getFullYear()) * 12 + (currentMonth - date.getMonth())
        return monthsDiff >= 0 && monthsDiff < 3
      })
      
      const averageIncome = last3MonthsIncomes.length > 0
        ? last3MonthsIncomes.reduce((sum: number, income: any) => sum + income.amount, 0) / 3
        : monthlyIncome
      
      // Gastos fixos (recorrentes ou assinaturas)
      const fixedExpenses = expenses
        .filter((exp: any) => exp.isRecurring || exp.category === 'Assinaturas')
        .reduce((sum: number, exp: any) => sum + exp.amount, 0)

      // Gastos variáveis do mês atual
      const currentMonthExpenses = expenses.filter((exp: any) => {
        const date = new Date(exp.date)
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               !exp.isRecurring
      })
      
      const variableExpenses = currentMonthExpenses.reduce(
        (sum: number, exp: any) => sum + exp.amount, 
        0
      )
      
      const activePlannings = plannings.filter(
        (p: any) => p.status === 'planned' || p.status === 'in_progress'
      )

      // Calcular compromisso mensal com planejamentos
      const monthlyCommittedAmount = activePlannings.reduce((sum: number, planning: any) => {
        const remaining = planning.targetAmount - planning.currentAmount
        const startDate = new Date(planning.startDate)
        const targetDate = planning.targetDate ? new Date(planning.targetDate) : null
        
        if (!targetDate) return sum
        
        const monthsDiff = Math.max(
          (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
          (targetDate.getMonth() - startDate.getMonth()),
          1
        )
        
        return sum + (remaining / monthsDiff)
      }, 0)

      // Calcular renda livre
      const freeIncome = monthlyIncome - fixedExpenses - monthlyCommittedAmount
      const freeIncomePercentage = monthlyIncome > 0 
        ? (freeIncome / monthlyIncome) * 100 
        : 0

      // Avaliar saúde financeira
      const isHealthy = freeIncome > monthlyIncome * 0.2 // Pelo menos 20% livre
      
      // Calcular nível de risco
      const riskLevel = evaluateRiskLevel(
        monthlyCommittedAmount, 
        {
          monthlyIncome,
          monthlyFixedExpenses: fixedExpenses,
          freeIncome,
        } as FinancialContext,
        monthlyCommittedAmount * 12
      )

      const financialContext: FinancialContext = {
        monthlyIncome,
        averageIncome,
        monthlyFixedExpenses: fixedExpenses,
        monthlyVariableExpenses: variableExpenses,
        activePlanningsCount: activePlannings.length,
        monthlyCommittedAmount,
        freeIncome,
        freeIncomePercentage,
        isHealthy,
        riskLevel,
      }

      // Atualiza cache
      cachedContext = financialContext
      cacheUserId = user.id
      cacheTimestamp = Date.now()
      
      setContext(financialContext)
    } catch (error) {
      console.error('[useFinancialContext] Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    calculateContext()
  }, [calculateContext])

  return context
}

/**
 * Hook para calcular contexto financeiro de forma manual
 * Útil quando os dados já estão disponíveis
 */
export function useCalculateFinancialContext(
  monthlyIncome: number,
  fixedExpenses: number,
  activePlannings: number,
  committedAmount: number
): FinancialContext {
  const freeIncome = monthlyIncome - fixedExpenses - committedAmount
  const freeIncomePercentage = monthlyIncome > 0 ? (freeIncome / monthlyIncome) * 100 : 0
  const isHealthy = freeIncome > monthlyIncome * 0.2
  
  const riskLevel = evaluateRiskLevel(
    committedAmount,
    {
      monthlyIncome,
      monthlyFixedExpenses: fixedExpenses,
      freeIncome,
    } as FinancialContext,
    committedAmount * 12
  )

  return {
    monthlyIncome,
    averageIncome: monthlyIncome,
    monthlyFixedExpenses: fixedExpenses,
    monthlyVariableExpenses: 0,
    activePlanningsCount: activePlannings,
    monthlyCommittedAmount: committedAmount,
    freeIncome,
    freeIncomePercentage,
    isHealthy,
    riskLevel,
  }
}
