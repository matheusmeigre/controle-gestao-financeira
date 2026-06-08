'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import type { CreditCard, CreateCreditCardInput, UpdateCreditCardInput } from '@/features/cards/types'

const repo = new SupabaseCardRepository()

export async function getCards() {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.findActive(userId)
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar cartões' }
  }
}

export async function getCard(cardId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.findById(userId, cardId)
    if (!data) return { success: false as const, error: 'Cartão não encontrado' }
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar cartão' }
  }
}

export async function createCard(input: CreateCreditCardInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }

  if (!/^\d{4}$/.test(input.last4Digits)) {
    return { success: false as const, error: 'Últimos 4 dígitos inválidos' }
  }

  try {
    const newCard: CreditCard = {
      id: crypto.randomUUID(),
      userId,
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const data = await repo.create(userId, newCard)
    revalidatePath('/cards')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar cartão' }
  }
}

export async function updateCard(input: UpdateCreditCardInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await repo.update(userId, input.id!, input as Partial<CreditCard>)
    revalidatePath('/cards')
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar cartão' }
  }
}

export async function deleteCard(cardId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await repo.softDelete(userId, cardId)
    revalidatePath('/cards')
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir cartão' }
  }
}
