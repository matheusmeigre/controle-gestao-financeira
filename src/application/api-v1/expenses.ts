import type { CreateMobileExpense, MobileExpense, UpdateMobileExpense } from '@contracts'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import type { Expense } from '@/features/expenses/types'
import { assertLocalDate, ensurePositiveAmount } from './shared'

const repository = new SupabaseExpenseRepository()

function toExpenseDto(expense: Expense): MobileExpense {
  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    status: expense.status,
    isRecurring: expense.isRecurring,
    recurringFrequency: expense.recurringFrequency,
    dueDate: expense.dueDate,
    isActive: expense.isActive,
    notes: expense.notes,
    cardName: expense.cardName,
    personName: expense.personName,
  }
}

function buildExpensePayload(input: CreateMobileExpense | UpdateMobileExpense, current?: Expense): Partial<Expense> {
  const description = input.description?.trim() ?? current?.description
  const category = input.category?.trim() ?? current?.category
  const amount = input.amount ?? current?.amount
  const date = input.date ?? current?.date
  const dueDate = input.dueDate ?? current?.dueDate

  if (!description || !category) {
    throw new Error('Descrição e categoria são obrigatórias')
  }

  if (amount === undefined || date === undefined) {
    throw new Error('Valor e data são obrigatórios')
  }

  ensurePositiveAmount(amount, 'Valor deve ser maior que zero')
  assertLocalDate(date, 'Data')

  if (category === 'Assinaturas') {
    if (!dueDate) {
      throw new Error('Vencimento da assinatura é obrigatório')
    }

    assertLocalDate(dueDate, 'Vencimento')
  }

  return {
    ...input,
    description,
    category,
    amount,
    date,
    ...(category === 'Assinaturas' && {
      isRecurring: true,
      isActive: input.isActive ?? current?.isActive ?? true,
      recurringFrequency:
        input.recurringFrequency === 'yearly' || input.recurringFrequency === 'monthly'
          ? input.recurringFrequency
          : current?.recurringFrequency ?? 'monthly',
      dueDate,
    }),
  }
}

export async function listExpenses(userId: string, yearMonth?: string): Promise<MobileExpense[]> {
  const expenses = yearMonth
    ? await repository.findByMonth(userId, yearMonth)
    : await repository.findAll(userId)

  return expenses.map(toExpenseDto)
}

export async function getExpense(userId: string, id: string): Promise<MobileExpense | null> {
  const expense = await repository.findById(userId, id)
  return expense ? toExpenseDto(expense) : null
}

export async function createExpense(userId: string, input: CreateMobileExpense): Promise<MobileExpense> {
  const expense = await repository.create(userId, {
    ...(buildExpensePayload(input) as Expense),
    id: crypto.randomUUID(),
    userId,
  })

  return toExpenseDto(expense)
}

export async function updateExpense(userId: string, id: string, input: UpdateMobileExpense): Promise<MobileExpense | null> {
  const current = await repository.findById(userId, id)
  if (!current) return null

  const updated = await repository.update(userId, id, buildExpensePayload(input, current) as Partial<Expense>)
  return updated ? toExpenseDto(updated) : null
}

export async function deleteExpense(userId: string, id: string): Promise<boolean> {
  return repository.delete(userId, id)
}
