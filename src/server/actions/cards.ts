'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { CreditCard, CreateCreditCardInput, UpdateCreditCardInput } from '@/types/card'

/**
 * Server Actions para gerenciamento de cartões de crédito
 * 
 * PRIVACY BY DESIGN: Nunca armazene número completo ou CVV
 * Apenas: nickname, bank_name, brand, last_4_digits
 * 
 * NOTA: Esta implementação usa localStorage no lado do cliente.
 * Para produção, recomenda-se implementar um banco de dados real (Prisma/Supabase)
 */

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
    
    const newCard: CreditCard = {
      id: crypto.randomUUID(),
      userId,
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Retorna o cartão para ser salvo no localStorage pelo cliente
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
    
    // O cliente irá buscar os cartões do localStorage
    // Esta função existe apenas para validar autenticação
    return { success: true, data: [], userId }
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
    
    // O cliente irá buscar o cartão do localStorage
    return { success: true, userId }
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
    
    // O cliente irá atualizar no localStorage
    return { success: true, data: input, userId }
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
    
    // O cliente irá deletar do localStorage
    return { success: true, userId }
  } catch (error) {
    console.error('[deleteCard] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao deletar cartão' 
    }
  }
}
