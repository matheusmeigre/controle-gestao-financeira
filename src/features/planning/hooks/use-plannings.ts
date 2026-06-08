'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { PlanningService } from '../services/planning.service'
import {
  getPlannings,
  getPlanning as serverGetPlanning,
  createPlanning as serverCreatePlanning,
  updatePlanning as serverUpdatePlanning,
  deletePlanning as serverDeletePlanning,
  linkExpenseToPlan,
  unlinkExpenseFromPlan,
  markPlanningAsCompleted,
  markPlanningAsCancelled,
} from '@/server/actions/planning'
import type {
  Planning,
  CreatePlanningInput,
  UpdatePlanningInput,
  PlanningFilters,
  PlanningSummary,
  PlanningIndicators,
} from '../types'

// Mantém apenas o service para métodos de computação pura (calculateIndicators, getSummary, etc.)
const planningService = new PlanningService()

export function usePlannings(filters?: PlanningFilters) {
  const { user } = useUser()
  const [plannings, setPlannings] = useState<Planning[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlannings = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }

    try {
      setLoading(true)
      setError(null)
      const res = await getPlannings()
      if (!res.success) throw new Error(res.error)

      let data = (res.data as Planning[]) ?? []

      // Aplica filtros localmente se fornecidos
      if (filters) {
        if (filters.status) data = data.filter((p) => p.status === filters.status)
        if (filters.category) data = data.filter((p) => p.category === filters.category)
        if (filters.riskLevel) data = data.filter((p) => p.riskLevel === filters.riskLevel)
      }

      setPlannings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planejamentos')
      console.error('[usePlannings] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, filters])

  useEffect(() => { loadPlannings() }, [loadPlannings])

  const createPlanning = useCallback(async (input: CreatePlanningInput) => {
    const res = await serverCreatePlanning(input)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
    return res.data as Planning
  }, [loadPlannings])

  const updatePlanning = useCallback(async (input: UpdatePlanningInput) => {
    const res = await serverUpdatePlanning(input)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
    return res.data as Planning
  }, [loadPlannings])

  const deletePlanningFn = useCallback(async (id: string) => {
    const res = await serverDeletePlanning(id)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
    return true
  }, [loadPlannings])

  const addAmount = useCallback(async (planningId: string, amount: number) => {
    const current = plannings.find((p) => p.id === planningId)
    if (!current) throw new Error('Planejamento não encontrado')
    const res = await serverUpdatePlanning({
      id: planningId,
      currentAmount: current.currentAmount + amount,
    })
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
    return res.data as Planning
  }, [plannings, loadPlannings])

  const linkExpense = useCallback(async (planningId: string, expenseId: string, expenseAmount: number) => {
    const res = await linkExpenseToPlan(planningId, expenseId, expenseAmount)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
  }, [loadPlannings])

  const unlinkExpense = useCallback(async (planningId: string, expenseId: string, expenseAmount: number) => {
    const res = await unlinkExpenseFromPlan(planningId, expenseId, expenseAmount)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
  }, [loadPlannings])

  const markAsCompleted = useCallback(async (planningId: string) => {
    const res = await markPlanningAsCompleted(planningId)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
  }, [loadPlannings])

  const markAsCancelled = useCallback(async (planningId: string) => {
    const res = await markPlanningAsCancelled(planningId)
    if (!res.success) throw new Error(res.error)
    await loadPlannings()
  }, [loadPlannings])

  return {
    plannings, loading, error, refresh: loadPlannings,
    createPlanning, updatePlanning, deletePlanning: deletePlanningFn,
    addAmount, linkExpense, unlinkExpense, markAsCompleted, markAsCancelled,
  }
}

export function usePlanning(planningId: string | null) {
  const { user } = useUser()
  const [planning, setPlanning] = useState<Planning | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.id || !planningId) { setLoading(false); return }
      try {
        setLoading(true)
        setError(null)
        const res = await serverGetPlanning(planningId)
        setPlanning(res.success ? (res.data as Planning) : null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar planejamento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, planningId])

  return { planning, loading, error }
}

export function usePlanningIndicators(planning: Planning | null): PlanningIndicators | null {
  if (!planning) return null
  return planningService.calculateIndicators(planning)
}

export function usePlanningSummary() {
  const { plannings, loading, error, refresh } = usePlannings()
  const [summary, setSummary] = useState<PlanningSummary | null>(null)

  useEffect(() => {
    if (!loading && plannings.length >= 0) {
      // Calcula summary localmente dos dados carregados
      setSummary(planningService.calculateSummaryFromData(plannings))
    }
  }, [plannings, loading])

  return { summary, loading, error, refresh }
}

export function useDelayedPlannings() {
  return usePlannings({ status: 'delayed' } as PlanningFilters)
}

export function useOverBudgetPlannings() {
  const { plannings, loading } = usePlannings()
  const overBudget = plannings.filter(
    (p) => p.currentAmount > p.targetAmount && p.status !== 'completed' && p.status !== 'cancelled'
  )
  return { plannings: overBudget, loading }
}
