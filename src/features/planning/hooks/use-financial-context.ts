'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import type { FinancialContext } from '../types'
import { evaluateRiskLevel } from '../rules'
import { getExpenses } from '@/server/actions/expenses'
import { getIncomes } from '@/server/actions/incomes'
import { getPlannings } from '@/server/actions/planning'

/**
 * Invalida o cache — mantido para compatibilidade de imports.
 * Com Supabase não há cache de módulo (VULN-12 corrigido).
 */
export function invalidateFinancialContextCache() {
  // no-op: sem cache de módulo
}

/**
 * Hook para obter contexto financeiro completo do usuário.
 * Lê dados via Server Actions (Supabase) — sem localStorage.
 */
export function useFinancialContext() {
  const { user } = useUser()
  const [context, setContext] = useState<FinancialContext | null>(null)
  const [loading, setLoading] = useState(true)

  const calculateContext = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }

    try {
      setLoading(true)

      const [expRes, incRes, planRes] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getPlannings(),
      ])

      const expenses = (expRes.success ? expRes.data : []) as { amount: number; date: string; isRecurring?: boolean; category?: string }[]
      const incomes = (incRes.success ? incRes.data : []) as { amount: number; date: string }[]
      const plannings = (planRes.success ? planRes.data : []) as {
        status: string; targetAmount: number; currentAmount: number
        startDate: string; targetDate?: string
      }[]

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const currentMonthIncomes = incomes.filter((income) => {
        const d = new Date(income.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })

      const monthlyIncome = currentMonthIncomes.reduce((s, i) => s + i.amount, 0)

      const last3MonthsIncomes = incomes.filter((income) => {
        const d = new Date(income.date)
        const diff = (currentYear - d.getFullYear()) * 12 + (currentMonth - d.getMonth())
        return diff >= 0 && diff < 3
      })
      const averageIncome = last3MonthsIncomes.length > 0
        ? last3MonthsIncomes.reduce((s, i) => s + i.amount, 0) / 3
        : monthlyIncome

      const fixedExpenses = expenses
        .filter((e) => e.isRecurring || e.category === 'Assinaturas')
        .reduce((s, e) => s + e.amount, 0)

      const variableExpenses = expenses
        .filter((e) => {
          const d = new Date(e.date)
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !e.isRecurring
        })
        .reduce((s, e) => s + e.amount, 0)

      const activePlannings = plannings.filter(
        (p) => p.status === 'planned' || p.status === 'in_progress'
      )

      const monthlyCommittedAmount = activePlannings.reduce((sum, planning) => {
        const remaining = planning.targetAmount - planning.currentAmount
        if (!planning.targetDate) return sum
        const start = new Date(planning.startDate)
        const target = new Date(planning.targetDate)
        const months = Math.max(
          (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth()),
          1
        )
        return sum + remaining / months
      }, 0)

      const freeIncome = monthlyIncome - fixedExpenses - monthlyCommittedAmount
      const freeIncomePercentage = monthlyIncome > 0 ? (freeIncome / monthlyIncome) * 100 : 0
      const isHealthy = freeIncome > monthlyIncome * 0.2

      const riskLevel = evaluateRiskLevel(
        monthlyCommittedAmount,
        { monthlyIncome, monthlyFixedExpenses: fixedExpenses, freeIncome } as FinancialContext,
        monthlyCommittedAmount * 12
      )

      setContext({
        monthlyIncome, averageIncome,
        monthlyFixedExpenses: fixedExpenses,
        monthlyVariableExpenses: variableExpenses,
        activePlanningsCount: activePlannings.length,
        monthlyCommittedAmount, freeIncome, freeIncomePercentage, isHealthy, riskLevel,
      })
    } catch (error) {
      console.error('[useFinancialContext] Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { calculateContext() }, [calculateContext])

  return context
}

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
    { monthlyIncome, monthlyFixedExpenses: fixedExpenses, freeIncome } as FinancialContext,
    committedAmount * 12
  )

  return {
    monthlyIncome, averageIncome: monthlyIncome,
    monthlyFixedExpenses: fixedExpenses, monthlyVariableExpenses: 0,
    activePlanningsCount: activePlannings,
    monthlyCommittedAmount: committedAmount,
    freeIncome, freeIncomePercentage, isHealthy, riskLevel,
  }
}
