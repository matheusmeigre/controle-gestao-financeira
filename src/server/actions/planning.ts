'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import type { 
  Planning, 
  CreatePlanningInput, 
  UpdatePlanningInput,
} from '@/features/planning/types'

const repo = new SupabasePlanningRepository()

export async function createPlanning(input: CreatePlanningInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    if (!input.name?.trim()) return { success: false, error: 'Nome é obrigatório' }
    if (input.targetAmount <= 0) return { success: false, error: 'Valor alvo deve ser maior que zero' }
    if ((input.currentAmount || 0) < 0) return { success: false, error: 'Valor atual não pode ser negativo' }

    const startDate = new Date(input.startDate)
    if (isNaN(startDate.getTime())) return { success: false, error: 'Data de início inválida' }
    if (input.targetDate) {
      const targetDate = new Date(input.targetDate)
      if (isNaN(targetDate.getTime())) return { success: false, error: 'Data alvo inválida' }
      if (targetDate <= startDate) return { success: false, error: 'Data alvo deve ser posterior à data de início' }
    }

    const newPlanning: Planning = {
      id: crypto.randomUUID(),
      userId,
      name: input.name.trim(),
      category: input.category,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount || 0,
      startDate: input.startDate,
      targetDate: input.targetDate,
      status: input.status || 'planned',
      notes: input.notes?.trim(),
      linkedExpenseIds: input.linkedExpenseIds || [],
      categoryData: input.categoryData,
      creationContext: input.creationContext,
      simulation: input.simulation,
      alerts: input.alerts || [],
      riskLevel: input.riskLevel || 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const data = await repo.create(userId, newPlanning)
    revalidatePath('/planning')
    return { success: true, data }
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

    if (input.targetAmount !== undefined && input.targetAmount <= 0)
      return { success: false, error: 'Valor alvo deve ser maior que zero' }
    if (input.currentAmount !== undefined && input.currentAmount < 0)
      return { success: false, error: 'Valor atual não pode ser negativo' }
    if (input.name !== undefined && !input.name.trim())
      return { success: false, error: 'Nome não pode ser vazio' }

    const data = await repo.update(userId, input.id, { ...input, updatedAt: new Date() } as Partial<Planning>)
    revalidatePath('/planning')
    return { success: true, data }
  } catch (error) {
    console.error('[updatePlanning] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar planejamento' }
  }
}

export async function deletePlanning(planningId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }
    if (!planningId) return { success: false, error: 'ID é obrigatório' }

    await repo.delete(userId, planningId)
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

    const data = await repo.findAll(userId)
    return { success: true, data }
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

    const data = await repo.findById(userId, planningId)
    if (!data) return { success: false, error: 'Planejamento não encontrado' }
    return { success: true, data }
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
    revalidatePath('/')
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
    revalidatePath('/')
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

    await repo.update(userId, planningId, { status: 'completed', updatedAt: new Date() } as Partial<Planning>)
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

    await repo.update(userId, planningId, { status: 'cancelled', updatedAt: new Date() } as Partial<Planning>)
    revalidatePath('/planning')
    return { success: true }
  } catch (error) {
    console.error('[markPlanningAsCancelled] Error:', error)
    return { success: false, error: 'Erro ao marcar planejamento' }
  }
}


