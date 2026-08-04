'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { CreditCard, CreateCreditCardInput, UpdateCreditCardInput } from '@/features/cards/types'
import {
  createCard as createApiCard,
  deleteCard as deleteApiCard,
  getCard as getApiCard,
  listCards as listApiCards,
  updateCard as updateApiCard,
} from '@/application/api-v1/cards'

function toCreditCard(
  userId: string,
  card: Awaited<ReturnType<typeof getApiCard>> extends infer T ? Exclude<T, null> : never
): CreditCard {
  return {
    ...card,
    userId,
    createdAt: card.createdAt ? new Date(card.createdAt) : undefined,
    updatedAt: card.updatedAt ? new Date(card.updatedAt) : undefined,
  }
}

export async function getCards() {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = (await listApiCards(userId)).map((card) => toCreditCard(userId, card))
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar cartões' }
  }
}

export async function getAllCards() {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = (await listApiCards(userId, true)).map((card) => toCreditCard(userId, card))
    return { success: true as const, data }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar cartões' }
  }
}

export async function getCard(cardId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await getApiCard(userId, cardId)
    if (!data) return { success: false as const, error: 'Cartão não encontrado' }
    return { success: true as const, data: toCreditCard(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao buscar cartão' }
  }
}

export async function createCard(input: CreateCreditCardInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }

  try {
    const data = await createApiCard(userId, input)
    revalidatePath('/cards')
    return { success: true as const, data: toCreditCard(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao criar cartão' }
  }
}

export async function updateCard(input: UpdateCreditCardInput) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    const data = await updateApiCard(userId, input.id!, input)
    if (!data) return { success: false as const, error: 'Cartão não encontrado' }
    revalidatePath('/cards')
    return { success: true as const, data: toCreditCard(userId, data) }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao atualizar cartão' }
  }
}

export async function deleteCard(cardId: string) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, error: 'Não autenticado' }
  try {
    await deleteApiCard(userId, cardId)
    revalidatePath('/cards')
    return { success: true as const }
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : 'Erro ao excluir cartão' }
  }
}
