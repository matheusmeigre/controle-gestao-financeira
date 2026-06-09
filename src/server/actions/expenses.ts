'use server'

import { auth } from '@clerk/nextjs/server'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/features/expenses/types'

const repo = new SupabaseExpenseRepository()

export async function getExpenses(yearMonth?: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = yearMonth
      ? await repo.findByMonth(userId, yearMonth)
      : await repo.findAll(userId)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar despesas' }
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const expense: Expense = {
      ...input,
      id: crypto.randomUUID(),
      userId,
      date: new Date().toISOString().split('T')[0],
    }
    const data = await repo.create(userId, expense)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar despesa' }
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.update(userId, input.id, input as Partial<Expense>)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar despesa' }
  }
}

export async function deleteExpense(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await repo.delete(userId, id)
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir despesa' }
  }
}
