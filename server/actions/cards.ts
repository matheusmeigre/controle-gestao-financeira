'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { CreditCard, CreateCreditCardInput, UpdateCreditCardInput } from '@/types/card'

/**
 * Server Actions para gerenciamento de cartões de crédito
 * 
 * PRIVACY BY DESIGN: Nunca armazene número completo ou CVV
 * Apenas: nickname, bank_name, brand, last_4_digits
 */

// Mock database - Substituir por Prisma/Supabase/etc
let cards: CreditCard[] = []

export async function createCard(input: CreateCreditCardInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    // Validação adicional
    if (!/^\d{4}$/.test(input.last4Digits)) {
      return { success: false, error: 'Últimos 4 dígitos inválidos' }
    }
    
    // Verifica duplicatas (mesmo banco + últimos 4 dígitos)
    const duplicate = cards.find(
      card => card.userId === userId &&
      card.bankName === input.bankName &&
      card.last4Digits === input.last4Digits &&
      card.isActive
    )
    
    if (duplicate) {
      return { 
        success: false, 
        error: 'Cartão já cadastrado com estes últimos 4 dígitos' 
      }
    }
    
    const newCard: CreditCard = {
      id: crypto.randomUUID(),
      userId,
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    cards.push(newCard)
    
    revalidatePath('/cards')
    
    return { success: true, data: newCard }
  } catch (error) {
    console.error('[createCard] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao criar cartão. Tente novamente.' 
    }
  }
}

export async function getCards() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const userCards = cards.filter(
      card => card.userId === userId && card.isActive
    )
    
    return { success: true, data: userCards }
  } catch (error) {
    console.error('[getCards] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar cartões' 
    }
  }
}

export async function getCard(cardId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const card = cards.find(
      c => c.id === cardId && c.userId === userId && c.isActive
    )
    
    if (!card) {
      return { success: false, error: 'Cartão não encontrado' }
    }
    
    return { success: true, data: card }
  } catch (error) {
    console.error('[getCard] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar cartão' 
    }
  }
}

export async function updateCard(input: UpdateCreditCardInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const cardIndex = cards.findIndex(
      c => c.id === input.id && c.userId === userId
    )
    
    if (cardIndex === -1) {
      return { success: false, error: 'Cartão não encontrado' }
    }
    
    // Atualiza apenas campos fornecidos
    const updatedCard = {
      ...cards[cardIndex],
      ...input,
      updatedAt: new Date(),
    }
    
    cards[cardIndex] = updatedCard
    
    revalidatePath('/cards')
    revalidatePath(`/cards/${input.id}`)
    
    return { success: true, data: updatedCard }
  } catch (error) {
    console.error('[updateCard] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao atualizar cartão' 
    }
  }
}

export async function deleteCard(cardId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const cardIndex = cards.findIndex(
      c => c.id === cardId && c.userId === userId
    )
    
    if (cardIndex === -1) {
      return { success: false, error: 'Cartão não encontrado' }
    }
    
    // Soft delete
    cards[cardIndex].isActive = false
    cards[cardIndex].updatedAt = new Date()
    
    revalidatePath('/cards')
    
    return { success: true }
  } catch (error) {
    console.error('[deleteCard] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao deletar cartão' 
    }
  }
}
