'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { PlanningService } from '../services/planning.service'
import { invalidateFinancialContextCache } from './use-financial-context'
import type { 
  Planning, 
  CreatePlanningInput, 
  UpdatePlanningInput,
  PlanningFilters,
  PlanningSummary,
  PlanningIndicators
} from '../types'

const planningService = new PlanningService()

// Cache global
let cachedPlannings: Planning[] = []
let cacheUserId: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 15000 // 15 segundos

/**
 * Hook principal para gerenciar planejamentos
 */
export function usePlannings(filters?: PlanningFilters) {
  const { user } = useUser()
  const [plannings, setPlannings] = useState<Planning[]>(cachedPlannings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlannings = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    // Verifica cache apenas se não houver filtros
    const now = Date.now()
    if (!filters && cachedPlannings.length > 0 && cacheUserId === user.id && (now - cacheTimestamp) < CACHE_DURATION) {
      setPlannings(cachedPlannings)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = filters 
        ? await planningService.getPlanningsWithFilters(user.id, filters)
        : await planningService.getAllPlannings(user.id)
      
      setPlannings(data)
      
      // Atualiza cache apenas se não houver filtros
      if (!filters) {
        cachedPlannings = data
        cacheUserId = user.id
        cacheTimestamp = now
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planejamentos')
      console.error('[usePlannings] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, filters])

  useEffect(() => {
    loadPlannings()
  }, [loadPlannings])

  const createPlanning = useCallback(async (input: CreatePlanningInput) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const newPlanning = await planningService.createPlanning(user.id, input)
    // Invalida cache
    cacheTimestamp = 0
    invalidateFinancialContextCache()
    await loadPlannings()
    return newPlanning
  }, [user?.id, loadPlannings])

  const updatePlanning = useCallback(async (input: UpdatePlanningInput) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.updatePlanning(user.id, input)
    // Invalida cache
    cacheTimestamp = 0
    invalidateFinancialContextCache()
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  const deletePlanning = useCallback(async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const success = await planningService.deletePlanning(user.id, id)
    // Invalida cache
    cacheTimestamp = 0
    invalidateFinancialContextCache()
    await loadPlannings()
    return success
  }, [user?.id, loadPlannings])

  const addAmount = useCallback(async (planningId: string, amount: number) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.addAmount(user.id, planningId, amount)
    // Invalida cache
    cacheTimestamp = 0
    invalidateFinancialContextCache()
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  const linkExpense = useCallback(async (
    planningId: string, 
    expenseId: string,
    expenseAmount: number
  ) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.linkExpense(user.id, planningId, expenseId, expenseAmount)
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  const unlinkExpense = useCallback(async (
    planningId: string,
    expenseId: string,
    expenseAmount: number
  ) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.unlinkExpense(user.id, planningId, expenseId, expenseAmount)
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  const markAsCompleted = useCallback(async (planningId: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.markAsCompleted(user.id, planningId)
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  const markAsCancelled = useCallback(async (planningId: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    const updated = await planningService.markAsCancelled(user.id, planningId)
    await loadPlannings()
    return updated
  }, [user?.id, loadPlannings])

  return {
    plannings,
    loading,
    error,
    refresh: loadPlannings,
    createPlanning,
    updatePlanning,
    deletePlanning,
    addAmount,
    linkExpense,
    unlinkExpense,
    markAsCompleted,
    markAsCancelled,
  }
}

/**
 * Hook para buscar um planejamento específico
 */
export function usePlanning(planningId: string | null) {
  const { user } = useUser()
  const [planning, setPlanning] = useState<Planning | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlanning = async () => {
      if (!user?.id || !planningId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await planningService.getPlanningById(user.id, planningId)
        setPlanning(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar planejamento')
        console.error('[usePlanning] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlanning()
  }, [user?.id, planningId])

  return { planning, loading, error }
}

/**
 * Hook para calcular indicadores de um planejamento
 */
export function usePlanningIndicators(planning: Planning | null): PlanningIndicators | null {
  if (!planning) return null
  return planningService.calculateIndicators(planning)
}

/**
 * Hook para obter resumo de todos os planejamentos
 */
export function usePlanningSummary() {
  const { user } = useUser()
  const [summary, setSummary] = useState<PlanningSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await planningService.getSummary(user.id)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar resumo')
      console.error('[usePlanningSummary] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return { summary, loading, error, refresh: loadSummary }
}

/**
 * Hook para planejamentos atrasados
 */
export function useDelayedPlannings() {
  const { user } = useUser()
  const [plannings, setPlannings] = useState<Planning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const data = await planningService.getDelayedPlannings(user.id)
        setPlannings(data)
      } catch (err) {
        console.error('[useDelayedPlannings] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id])

  return { plannings, loading }
}

/**
 * Hook para planejamentos com orçamento estourado
 */
export function useOverBudgetPlannings() {
  const { user } = useUser()
  const [plannings, setPlannings] = useState<Planning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const data = await planningService.getOverBudgetPlannings(user.id)
        setPlannings(data)
      } catch (err) {
        console.error('[useOverBudgetPlannings] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id])

  return { plannings, loading }
}
