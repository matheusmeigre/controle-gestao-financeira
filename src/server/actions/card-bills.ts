'use server'

import { auth } from '@clerk/nextjs/server'
import { SupabaseCardBillRepository } from '@/features/dashboard/services/card-bill.supabase.repository'
import type { CardBill } from '@/types/expense'

const repo = new SupabaseCardBillRepository()

export async function getCardBills(yearMonth?: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = yearMonth
      ? await repo.findByMonth(userId, yearMonth)
      : await repo.findAll(userId)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar faturas' }
  }
}

export async function createCardBill(input: Omit<CardBill, 'id' | 'date' | 'userId'>) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const cardBill: CardBill = {
      ...input,
      id: crypto.randomUUID(),
      userId,
      date: new Date().toISOString().split('T')[0],
    }
    const data = await repo.create(userId, cardBill)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar fatura' }
  }
}

export async function updateCardBill(id: string, updates: Partial<CardBill>) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.update(userId, id, updates)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar fatura' }
  }
}

export async function deleteCardBill(id: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await repo.delete(userId, id)
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir fatura' }
  }
}
