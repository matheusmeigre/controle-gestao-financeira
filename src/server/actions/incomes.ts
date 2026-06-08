'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import type { Income, CreateIncomeInput, UpdateIncomeInput } from '@/features/incomes/types'

const repo = new SupabaseIncomeRepository()

export async function getIncomes(yearMonth?: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = yearMonth
      ? await repo.findByMonth(userId, yearMonth)
      : await repo.findAll(userId)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar receitas' }
  }
}

export async function createIncome(input: CreateIncomeInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const income: Income = {
      ...input,
      id: crypto.randomUUID(),
      userId,
      date: input.date ?? new Date().toISOString().split('T')[0],
      registrationDate: new Date().toISOString(),
      receivedDate: null,
    }
    const data = await repo.create(userId, income)
    revalidatePath('/')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar receita' }
  }
}

export async function updateIncome(input: UpdateIncomeInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.update(userId, input.id, input as Partial<Income>)
    revalidatePath('/')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar receita' }
  }
}

export async function deleteIncome(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await repo.delete(userId, id)
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
    const data = await repo.markAsReceived(userId, id)
    revalidatePath('/')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao marcar receita' }
  }
}
