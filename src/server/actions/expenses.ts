'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '@/features/expenses/types'
import { isValidDateString } from '@/lib/date-utils'

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
    const category = input.category?.trim()
    if (!input.description?.trim() || !category) {
      return { success: false as const, error: 'Descrição e categoria são obrigatórias' }
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { success: false as const, error: 'Valor deve ser maior que zero' }
    }
    if (!isValidDateString(input.date)) {
      return { success: false as const, error: 'Data inválida' }
    }
    if (category === 'Assinaturas' && !isValidDateString(input.dueDate)) {
      return { success: false as const, error: 'Vencimento da assinatura é obrigatório' }
    }
    const recurringFrequency = input.recurringFrequency === 'yearly' ? 'yearly' : 'monthly'
    const expense: Expense = {
      ...input,
      description: input.description.trim(),
      category,
      ...(category === 'Assinaturas' && {
        isRecurring: true,
        isActive: input.isActive ?? true,
        recurringFrequency,
      }),
      id: crypto.randomUUID(),
      userId,
      date: input.date,
    }
    const data = await repo.create(userId, expense)
    revalidatePath('/')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar despesa' }
  }
}

export async function updateExpense(input: UpdateExpenseInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const current = await repo.findById(userId, input.id)
    if (!current) return { success: false as const, error: 'Despesa não encontrada' }
    const description = input.description?.trim() ?? current.description
    const category = input.category?.trim() ?? current.category
    const amount = input.amount ?? current.amount
    const date = input.date ?? current.date
    const dueDate = input.dueDate ?? current.dueDate
    if (!description || !category) {
      return { success: false as const, error: 'Descrição e categoria são obrigatórias' }
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false as const, error: 'Valor deve ser maior que zero' }
    }
    if (!isValidDateString(date)) {
      return { success: false as const, error: 'Data inválida' }
    }
    if (category === 'Assinaturas' && !isValidDateString(dueDate)) {
      return { success: false as const, error: 'Vencimento da assinatura é obrigatório' }
    }
    const updates: Partial<Expense> = {
      ...input,
      description,
      category,
      amount,
      date,
      ...(category === 'Assinaturas' && {
        isRecurring: true,
        isActive: input.isActive ?? current.isActive ?? true,
        recurringFrequency:
          input.recurringFrequency === 'monthly' || input.recurringFrequency === 'yearly'
            ? input.recurringFrequency
            : current.recurringFrequency ?? 'monthly',
        dueDate,
      }),
    }
    const data = await repo.update(userId, input.id, updates)
    revalidatePath('/')
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
    revalidatePath('/')
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir despesa' }
  }
}
