'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import type { 
  Planning, 
  CreatePlanningInput, 
  UpdatePlanningInput,
} from '@/features/planning/types'
import {
  contributeToPlanning as contributeToApiPlanning,
  createPlanning as createApiPlanning,
  deletePlanning as deleteApiPlanning,
  getPlanning as getApiPlanning,
  listPlannings as listApiPlannings,
  updatePlanning as updateApiPlanning,
} from '@/application/api-v1/plannings'

const repo = new SupabasePlanningRepository()

function toLegacyPlanning(
  userId: string,
  planning: Awaited<ReturnType<typeof getApiPlanning>> extends infer T ? Exclude<T, null> : never
): Planning {
  return {
    ...planning,
    userId,
    category: planning.category as Planning['category'],
    categoryData: planning.categoryData as Planning['categoryData'],
    creationContext: planning.creationContext as Planning['creationContext'],
    simulation: planning.simulation as Planning['simulation'],
    alerts: planning.alerts as Planning['alerts'],
    createdAt: new Date(planning.createdAt),
    updatedAt: new Date(planning.updatedAt),
  }
}

export async function createPlanning(input: CreatePlanningInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await createApiPlanning(userId, input)
    revalidatePath('/planning')
    return { success: true, data: toLegacyPlanning(userId, data) }
  } catch (error) {
    console.error('[createPlanning] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar planejamento' }
  }
}

export async function updatePlanning(input: UpdatePlanningInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }
    if (!input.id) return { success: false, error: 'ID é obrigatório' }

    const data = await updateApiPlanning(userId, input.id, input)
    if (!data) return { success: false, error: 'Planejamento não encontrado' }
    revalidatePath('/planning')
    return { success: true, data: toLegacyPlanning(userId, data) }
  } catch (error) {
    console.error('[updatePlanning] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar planejamento' }
  }
}

export async function addAmountToPlanning(planningId: string, amount: number) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }
    if (!planningId) return { success: false, error: 'ID é obrigatório' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Valor deve ser maior que zero' }
    }

    const data = await contributeToApiPlanning(userId, planningId, { amount })
    if (!data) return { success: false, error: 'Planejamento não encontrado' }
    revalidatePath('/planning')
    return { success: true, data: toLegacyPlanning(userId, data) }
  } catch (error) {
    console.error('[addAmountToPlanning] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao adicionar valor' }
  }
}

export async function deletePlanning(planningId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }
    if (!planningId) return { success: false, error: 'ID é obrigatório' }

    await deleteApiPlanning(userId, planningId)
    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[deletePlanning] Error:', error)
    return { success: false, error: 'Erro ao deletar planejamento' }
  }
}

export async function getPlannings() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await listApiPlannings(userId)
    return { success: true, data: data.map((planning) => toLegacyPlanning(userId, planning)) }
  } catch (error) {
    console.error('[getPlannings] Error:', error)
    return { success: false, error: 'Erro ao buscar planejamentos' }
  }
}

export async function getPlanning(planningId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }
    if (!planningId) return { success: false, error: 'ID é obrigatório' }

    const data = await getApiPlanning(userId, planningId)
    if (!data) return { success: false, error: 'Planejamento não encontrado' }
    return { success: true, data: toLegacyPlanning(userId, data) }
  } catch (error) {
    console.error('[getPlanning] Error:', error)
    return { success: false, error: 'Erro ao buscar planejamento' }
  }
}

export async function linkExpenseToPlan(planningId: string, expenseId: string, expenseAmount: number) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const planning = await repo.findById(userId, planningId)
    if (!planning) return { success: false, error: 'Planejamento não encontrado' }

    if (planning.linkedExpenseIds.includes(expenseId))
      return { success: false, error: 'Despesa já vinculada' }

    const updatedIds = [...planning.linkedExpenseIds, expenseId]
    const updatedAmount = planning.currentAmount + expenseAmount

    await repo.update(userId, planningId, {
      linkedExpenseIds: updatedIds,
      currentAmount: updatedAmount,
      updatedAt: new Date(),
    } as Partial<Planning>)

    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[linkExpenseToPlan] Error:', error)
    return { success: false, error: 'Erro ao vincular gasto' }
  }
}

export async function unlinkExpenseFromPlan(planningId: string, expenseId: string, expenseAmount: number) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const planning = await repo.findById(userId, planningId)
    if (!planning) return { success: false, error: 'Planejamento não encontrado' }

    const updatedIds = planning.linkedExpenseIds.filter((id) => id !== expenseId)
    const updatedAmount = Math.max(0, planning.currentAmount - expenseAmount)

    await repo.update(userId, planningId, {
      linkedExpenseIds: updatedIds,
      currentAmount: updatedAmount,
      updatedAt: new Date(),
    } as Partial<Planning>)

    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[unlinkExpenseFromPlan] Error:', error)
    return { success: false, error: 'Erro ao desvincular gasto' }
  }
}

export async function markPlanningAsCompleted(planningId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    await updateApiPlanning(userId, planningId, { status: 'completed' })
    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[markPlanningAsCompleted] Error:', error)
    return { success: false, error: 'Erro ao marcar planejamento' }
  }
}

export async function markPlanningAsCancelled(planningId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    await updateApiPlanning(userId, planningId, { status: 'cancelled' })
    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[markPlanningAsCancelled] Error:', error)
    return { success: false, error: 'Erro ao marcar planejamento' }
  }
}


