'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { 
  Planning, 
  CreatePlanningInput, 
  UpdatePlanningInput,
  PlanningSummary,
  PlanningFilters 
} from '@/features/planning/types'

/**
 * Server Actions para gerenciamento de planejamentos financeiros
 * 
 * Arquitetura:
 * - Validação de autenticação
 * - Lógica no client (localStorage)
 * - Revalidação de cache quando necessário
 */

export async function createPlanning(input: CreatePlanningInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validações básicas
    if (!input.name?.trim()) {
      return { success: false, error: 'Nome do planejamento é obrigatório' }
    }

    if (input.targetAmount <= 0) {
      return { success: false, error: 'Valor alvo deve ser maior que zero' }
    }

    if ((input.currentAmount || 0) < 0) {
      return { success: false, error: 'Valor atual não pode ser negativo' }
    }

    // Validação de datas
    const startDate = new Date(input.startDate)
    if (isNaN(startDate.getTime())) {
      return { success: false, error: 'Data de início inválida' }
    }

    if (input.targetDate) {
      const targetDate = new Date(input.targetDate)
      if (isNaN(targetDate.getTime())) {
        return { success: false, error: 'Data alvo inválida' }
      }
      if (targetDate <= startDate) {
        return { success: false, error: 'Data alvo deve ser posterior à data de início' }
      }
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

    revalidatePath('/planning')
    return { success: true, data: newPlanning }
  } catch (error) {
    console.error('[createPlanning] Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar planejamento' 
    }
  }
}

export async function updatePlanning(input: UpdatePlanningInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!input.id) {
      return { success: false, error: 'ID do planejamento é obrigatório' }
    }

    // Validações
    if (input.targetAmount !== undefined && input.targetAmount <= 0) {
      return { success: false, error: 'Valor alvo deve ser maior que zero' }
    }

    if (input.currentAmount !== undefined && input.currentAmount < 0) {
      return { success: false, error: 'Valor atual não pode ser negativo' }
    }

    if (input.name !== undefined && !input.name.trim()) {
      return { success: false, error: 'Nome não pode ser vazio' }
    }

    const updatedData = {
      ...input,
      updatedAt: new Date(),
    }

    revalidatePath('/planning')
    return { success: true, data: updatedData }
  } catch (error) {
    console.error('[updatePlanning] Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar planejamento' 
    }
  }
}

export async function deletePlanning(planningId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId) {
      return { success: false, error: 'ID do planejamento é obrigatório' }
    }

    revalidatePath('/planning')
    return { success: true, planningId }
  } catch (error) {
    console.error('[deletePlanning] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao deletar planejamento' 
    }
  }
}

export async function getPlannings() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    // O cliente irá buscar os planejamentos do localStorage
    return { success: true, userId }
  } catch (error) {
    console.error('[getPlannings] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar planejamentos' 
    }
  }
}

export async function getPlanning(planningId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId) {
      return { success: false, error: 'ID do planejamento é obrigatório' }
    }

    // O cliente irá buscar o planejamento do localStorage
    return { success: true, userId }
  } catch (error) {
    console.error('[getPlanning] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar planejamento' 
    }
  }
}

export async function linkExpenseToPlan(planningId: string, expenseId: string, expenseAmount: number) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId || !expenseId) {
      return { success: false, error: 'IDs são obrigatórios' }
    }

    if (expenseAmount < 0) {
      return { success: false, error: 'Valor do gasto inválido' }
    }

    revalidatePath('/planning')
    revalidatePath('/')
    return { success: true, planningId, expenseId, expenseAmount }
  } catch (error) {
    console.error('[linkExpenseToPlan] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao vincular gasto ao planejamento' 
    }
  }
}

export async function unlinkExpenseFromPlan(planningId: string, expenseId: string, expenseAmount: number) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId || !expenseId) {
      return { success: false, error: 'IDs são obrigatórios' }
    }

    revalidatePath('/planning')
    revalidatePath('/')
    return { success: true, planningId, expenseId, expenseAmount }
  } catch (error) {
    console.error('[unlinkExpenseFromPlan] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao desvincular gasto do planejamento' 
    }
  }
}

export async function markPlanningAsCompleted(planningId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId) {
      return { success: false, error: 'ID do planejamento é obrigatório' }
    }

    revalidatePath('/planning')
    return { success: true, planningId, status: 'completed' }
  } catch (error) {
    console.error('[markPlanningAsCompleted] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao marcar planejamento como completo' 
    }
  }
}

export async function markPlanningAsCancelled(planningId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!planningId) {
      return { success: false, error: 'ID do planejamento é obrigatório' }
    }

    revalidatePath('/planning')
    return { success: true, planningId, status: 'cancelled' }
  } catch (error) {
    console.error('[markPlanningAsCancelled] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao marcar planejamento como cancelado' 
    }
  }
}
