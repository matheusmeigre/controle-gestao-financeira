'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/features/expenses/types'
import {
  createExpense as createApiExpense,
  deleteExpense as deleteApiExpense,
  listExpenses as listApiExpenses,
  updateExpense as updateApiExpense,
} from '@/application/api-v1/expenses'

function toLegacyExpense(userId: string, expense: Omit<Expense, 'userId'>): Expense {
  return {
    ...expense,
    userId,
  }
}

export async function getExpenses(yearMonth?: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await listApiExpenses(userId, yearMonth)
    return { success: true as const, data: data.map((expense) => toLegacyExpense(userId, expense)) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar despesas' }
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await createApiExpense(userId, input)
    revalidatePath('/')
    return { success: true as const, data: toLegacyExpense(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar despesa' }
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await updateApiExpense(userId, input.id, input)
    if (!data) return { success: false as const, error: 'Despesa não encontrada' }
    revalidatePath('/')
    return { success: true as const, data: toLegacyExpense(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar despesa' }
  }
}

export async function deleteExpense(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await deleteApiExpense(userId, id)
    revalidatePath('/')
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir despesa' }
  }
}
