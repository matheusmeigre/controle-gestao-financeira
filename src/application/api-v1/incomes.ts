import type {
  CreateMobileIncome,
  MobileIncome,
  ReceiveMobileIncome,
  UpdateMobileIncome,
} from '@contracts'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import type { Income } from '@/features/incomes/types'
import { assertLocalDate, ensurePositiveAmount, toIsoDateTimeString } from './shared'

const repository = new SupabaseIncomeRepository()

function toIncomeDto(income: Income): MobileIncome {
  return {
    id: income.id,
    description: income.description,
    amount: income.amount,
    type: income.type,
    category: income.category,
    date: income.date,
    status: income.status,
    registrationDate: income.registrationDate,
    receivedDate: income.receivedDate,
  }
}

function validateIncomePayload(input: Partial<CreateMobileIncome>) {
  if (input.description !== undefined && !input.description.trim()) {
    throw new Error('Descrição é obrigatória')
  }

  if (input.amount !== undefined) {
    ensurePositiveAmount(input.amount, 'Valor deve ser maior que zero')
  }

  if (input.date !== undefined) {
    assertLocalDate(input.date, 'Data')
  }
}

export async function listIncomes(userId: string, yearMonth?: string): Promise<MobileIncome[]> {
  const incomes = yearMonth
    ? await repository.findByMonth(userId, yearMonth)
    : await repository.findAll(userId)

  return incomes.map(toIncomeDto)
}

export async function createIncome(userId: string, input: CreateMobileIncome): Promise<MobileIncome> {
  validateIncomePayload(input)

  const income = await repository.create(userId, {
    id: crypto.randomUUID(),
    userId,
    description: input.description.trim(),
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    status: input.status,
    registrationDate: new Date().toISOString(),
    receivedDate: null,
  })

  return toIncomeDto(income)
}

export async function updateIncome(userId: string, id: string, input: UpdateMobileIncome): Promise<MobileIncome | null> {
  validateIncomePayload(input)

  const updated = await repository.update(userId, id, {
    ...input,
    description: input.description?.trim(),
  } as Partial<Income>)

  return updated ? toIncomeDto(updated) : null
}

export async function receiveIncome(userId: string, id: string, input: ReceiveMobileIncome): Promise<MobileIncome | null> {
  if (input.receivedDate && Number.isNaN(Date.parse(input.receivedDate))) {
    throw new Error('Data de recebimento inválida')
  }

  const updated = await repository.update(userId, id, {
    status: 'received',
    receivedDate: toIsoDateTimeString(input.receivedDate ?? new Date().toISOString()) ?? null,
  } as Partial<Income>)

  return updated ? toIncomeDto(updated) : null
}

export async function deleteIncome(userId: string, id: string): Promise<boolean> {
  return repository.delete(userId, id)
}
