'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { Income, CreateIncomeInput, UpdateIncomeInput } from '@/features/incomes/types'
import {
  createIncome as createApiIncome,
  deleteIncome as deleteApiIncome,
  listIncomes as listApiIncomes,
  receiveIncome as receiveApiIncome,
  updateIncome as updateApiIncome,
} from '@/application/api-v1/incomes'

function toLegacyIncome(userId: string, income: Omit<Income, 'userId'>): Income {
  return {
    ...income,
    userId,
  }
}

export async function getIncomes(yearMonth?: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await listApiIncomes(userId, yearMonth)
    return { success: true as const, data: data.map((income) => toLegacyIncome(userId, income)) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar receitas' }
  }
}

export async function createIncome(input: CreateIncomeInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await createApiIncome(userId, input)
    revalidatePath('/')
    return { success: true as const, data: toLegacyIncome(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar receita' }
  }
}

export async function updateIncome(input: UpdateIncomeInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await updateApiIncome(userId, input.id, input)
    if (!data) return { success: false as const, error: 'Receita não encontrada' }
    revalidatePath('/')
    return { success: true as const, data: toLegacyIncome(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar receita' }
  }
}

export async function deleteIncome(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await deleteApiIncome(userId, id)
    revalidatePath('/')
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir receita' }
  }
}

export async function markIncomeAsReceived(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await receiveApiIncome(userId, id, {})
    if (!data) return { success: false as const, error: 'Receita não encontrada' }
    revalidatePath('/')
    return { success: true as const, data: toLegacyIncome(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao marcar receita' }
  }
}
