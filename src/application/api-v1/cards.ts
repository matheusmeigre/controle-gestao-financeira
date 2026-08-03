import type { CreateMobileCard, MobileCard, UpdateMobileCard } from '@contracts'
import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import type { CreditCard } from '@/features/cards/types'
import { ensurePositiveAmount, toIsoDateTimeString } from './shared'

const repository = new SupabaseCardRepository()

function toCardDto(card: CreditCard): MobileCard {
  return {
    id: card.id ?? '',
    nickname: card.nickname,
    bankName: card.bankName,
    brand: card.brand,
    last4Digits: card.last4Digits,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    creditLimit: card.creditLimit,
    isActive: card.isActive,
    createdAt: toIsoDateTimeString(card.createdAt) ?? undefined,
    updatedAt: toIsoDateTimeString(card.updatedAt) ?? undefined,
  }
}

function validateCardPayload(input: Partial<CreateMobileCard>) {
  if (input.last4Digits !== undefined && !/^\d{4}$/.test(input.last4Digits)) {
    throw new Error('Últimos 4 dígitos inválidos')
  }

  if (input.creditLimit !== undefined) {
    ensurePositiveAmount(input.creditLimit, 'Limite de crédito deve ser maior que zero')
  }
}

export async function listCards(userId: string, includeInactive = false): Promise<MobileCard[]> {
  const cards = includeInactive ? await repository.findAll(userId) : await repository.findActive(userId)
  return cards.map(toCardDto)
}

export async function getCard(userId: string, id: string): Promise<MobileCard | null> {
  const card = await repository.findById(userId, id)
  return card ? toCardDto(card) : null
}

export async function createCard(userId: string, input: CreateMobileCard): Promise<MobileCard> {
  validateCardPayload(input)

  const existing = await repository.findActive(userId)
  if (existing.some((card) => card.last4Digits === input.last4Digits && card.isActive)) {
    throw new Error('Cartão já cadastrado com estes últimos 4 dígitos')
  }

  const created = await repository.create(userId, {
    id: crypto.randomUUID(),
    userId,
    ...input,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return toCardDto(created)
}

export async function updateCard(userId: string, id: string, input: UpdateMobileCard): Promise<MobileCard | null> {
  validateCardPayload(input)

  if (input.last4Digits) {
    const existing = await repository.findActive(userId)
    const duplicate = existing.find((card) => card.id !== id && card.last4Digits === input.last4Digits)
    if (duplicate) {
      throw new Error('Cartão já cadastrado com estes últimos 4 dígitos')
    }
  }

  const updated = await repository.update(userId, id, input as Partial<CreditCard>)
  return updated ? toCardDto(updated) : null
}

export async function deleteCard(userId: string, id: string): Promise<boolean> {
  return repository.softDelete(userId, id)
}
