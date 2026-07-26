import { randomBytes, randomUUID } from 'node:crypto'
import { defineFactory } from '@autonoma-ai/sdk'
import type { FactoryContext } from '@autonoma-ai/sdk'
import { clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import { SupabaseCardRepository } from '@/features/cards/services/card.supabase.repository'
import type { CreditCard } from '@/features/cards/types'
import { SupabaseCardBillRepository } from '@/features/dashboard/services/card-bill.supabase.repository'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import type { Expense } from '@/features/expenses/types'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import type { Income } from '@/features/incomes/types'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import type { Invoice } from '@/features/invoices/types'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import type { Planning } from '@/features/planning/types'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CardBill } from '@/types/expense'

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
const scopedRefSchema = z.object({ id: z.string(), userId: z.string() })
const invoiceItemRefSchema = z.object({ id: z.string(), invoiceId: z.string() })

const expenseRepository = new SupabaseExpenseRepository()
const incomeRepository = new SupabaseIncomeRepository()
const cardRepository = new SupabaseCardRepository()
const cardBillRepository = new SupabaseCardBillRepository()
const invoiceRepository = new SupabaseInvoiceRepository()
const planningRepository = new SupabasePlanningRepository()

function dateFromToday(days = 0) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getSupabaseClient() {
  const client = createSupabaseServerClient()
  if (!client) throw new Error('Supabase is not configured for Autonoma')
  return client
}

function assertScenarioUser(userId: string, context: FactoryContext) {
  const createdUserId = context.refs.User?.[0]?.id
  if (typeof createdUserId !== 'string' || userId !== createdUserId) {
    throw new Error('userId must reference the User created in this scenario')
  }
}

function assertScenarioReference(
  model: string,
  id: string,
  context: FactoryContext,
) {
  const exists = context.refs[model]?.some((record) => record.id === id)
  if (!exists) throw new Error(`${model} reference must be created in this scenario`)
}

export async function deleteAutonomaUserData(userIds: string[]) {
  const client = getSupabaseClient()
  const tables = [
    'invoices',
    'credit_cards',
    'card_bills',
    'plannings',
    'expenses',
    'incomes',
  ] as const
  const errors: string[] = []

  for (const userId of userIds) {
    for (const tableName of tables) {
      const table = client.from(tableName) as any
      const { error } = await table.delete().eq('user_id', userId)
      if (error) errors.push(`[${tableName}] ${error.message}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Autonoma cleanup failed: ${errors.join('; ')}`)
  }
}

const User = defineFactory({
  inputSchema: z.object({
    email: z.string().email().refine(
      (email) => email.includes('+clerk_test_') && email.endsWith('@example.com'),
      'Use an isolated Clerk test email at example.com',
    ),
    firstName: z.string().min(1).default('Autonoma'),
    lastName: z.string().min(1).default('Test'),
  }),
  refSchema: z.object({
    id: z.string(),
    userId: z.string(),
    email: z.string().email(),
    password: z.string(),
  }),
  create: async (data, context) => {
    const password = `At1!${randomBytes(24).toString('base64url')}`
    const client = await clerkClient()
    const user = await client.users.createUser({
      emailAddress: [data.email],
      password,
      firstName: data.firstName,
      lastName: data.lastName,
      skipLegalChecks: true,
      privateMetadata: {
        createdBy: 'autonoma',
        testRunId: context.testRunId,
      },
    })

    return {
      id: user.id,
      userId: user.id,
      email: data.email,
      password,
    }
  },
  teardown: async (record) => {
    const client = await clerkClient()
    await client.users.deleteUser(record.id)
  },
})

const Expense = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    description: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().min(1).default('Outros'),
    date: isoDateSchema.optional(),
    status: z.enum(['paid', 'pending']).default('pending'),
    isRecurring: z.boolean().default(false),
    recurringFrequency: z.enum(['monthly', 'yearly']).optional(),
    dueDate: isoDateSchema.optional(),
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
    cardName: z.string().optional(),
    personName: z.string().optional(),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    const expense: Expense = {
      id: randomUUID(),
      ...data,
      date: data.date ?? dateFromToday(),
    }
    return expenseRepository.create(data.userId, expense)
  },
  teardown: async (record) => {
    await expenseRepository.delete(record.userId, record.id)
  },
})

const Income = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    description: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(['salary', 'extra']).default('extra'),
    category: z.string().optional(),
    date: isoDateSchema.optional(),
    status: z.enum(['pending', 'received']).default('pending'),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    const income: Income = {
      id: randomUUID(),
      ...data,
      date: data.date ?? dateFromToday(),
      registrationDate: new Date().toISOString(),
      receivedDate: data.status === 'received' ? new Date().toISOString() : null,
    }
    return incomeRepository.create(data.userId, income)
  },
  teardown: async (record) => {
    await incomeRepository.delete(record.userId, record.id)
  },
})

const CreditCard = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    nickname: z.string().min(1).max(50),
    bankName: z.string().min(1),
    brand: z.enum(['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros']),
    last4Digits: z.string().regex(/^\d{4}$/),
    closingDay: z.number().int().min(1).max(31),
    dueDay: z.number().int().min(1).max(31),
    creditLimit: z.number().positive().optional(),
    isActive: z.boolean().default(true),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    const now = new Date()
    const id = randomUUID()
    const card: CreditCard = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    const created = await cardRepository.create(data.userId, card)
    return { id: created.id ?? id, userId: created.userId }
  },
  teardown: async (record) => {
    await cardRepository.delete(record.userId, record.id)
  },
})

const cardBillItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  amount: z.number(),
  category: z.string().min(1),
  personName: z.string().min(1),
  date: isoDateSchema.optional(),
})

const CardBill = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    cardName: z.string().min(1),
    totalAmount: z.number().nonnegative(),
    date: isoDateSchema.optional(),
    description: z.string().default(''),
    divisions: z.array(z.object({
      personName: z.string().min(1),
      amount: z.number().nonnegative(),
      description: z.string().optional(),
    })).default([]),
    items: z.array(cardBillItemSchema).default([]),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    const bill: CardBill = {
      id: randomUUID(),
      ...data,
      date: data.date ?? dateFromToday(),
      items: data.items.map((item) => ({
        ...item,
        id: item.id ?? randomUUID(),
      })),
    }
    return cardBillRepository.create(data.userId, bill)
  },
  teardown: async (record) => {
    await cardBillRepository.delete(record.userId, record.id)
  },
})

const Invoice = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    cardId: z.string().uuid(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
    closingDate: isoDateSchema.optional(),
    dueDate: isoDateSchema.optional(),
    totalAmount: z.number().nonnegative().default(0),
    paidAmount: z.number().nonnegative().default(0),
    isPaid: z.boolean().default(false),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    assertScenarioReference('CreditCard', data.cardId, context)
    const currentDate = dateFromToday()
    const [currentYear, currentMonth] = currentDate.split('-').map(Number)
    const now = new Date()
    const id = randomUUID()
    const invoice: Invoice = {
      id,
      userId: data.userId,
      cardId: data.cardId,
      month: data.month ?? currentMonth,
      year: data.year ?? currentYear,
      closingDate: new Date(`${data.closingDate ?? dateFromToday()}T12:00:00Z`),
      dueDate: new Date(`${data.dueDate ?? dateFromToday(7)}T12:00:00Z`),
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      isPaid: data.isPaid,
      items: [],
      createdAt: now,
      updatedAt: now,
    }
    const created = await invoiceRepository.create(data.userId, invoice)
    return { id: created.id ?? id, userId: created.userId }
  },
  teardown: async (record) => {
    await invoiceRepository.delete(record.userId, record.id)
  },
})

const InvoiceItem = defineFactory({
  inputSchema: z.object({
    invoiceId: z.string(),
    date: isoDateSchema.optional(),
    description: z.string().min(1),
    amount: z.number(),
    category: z.string().min(1).default('Outros'),
    installment: z.string().optional(),
    notes: z.string().optional(),
  }),
  refSchema: invoiceItemRefSchema,
  create: async (data, context) => {
    assertScenarioReference('Invoice', data.invoiceId, context)
    const id = randomUUID()
    const table = getSupabaseClient().from('invoice_items') as any
    const { error } = await table.insert({
      id,
      invoice_id: data.invoiceId,
      date: data.date ?? dateFromToday(),
      description: data.description,
      amount: data.amount,
      category: data.category,
      installment: data.installment ?? null,
      notes: data.notes ?? null,
    })
    if (error) throw new Error(`[invoice_items] create: ${error.message}`)
    return { id, invoiceId: data.invoiceId }
  },
  teardown: async (record) => {
    const { error } = await getSupabaseClient()
      .from('invoice_items')
      .delete()
      .eq('id', record.id)
      .eq('invoice_id', record.invoiceId)
    if (error) throw new Error(`[invoice_items] delete: ${error.message}`)
  },
})

const Planning = defineFactory({
  inputSchema: z.object({
    userId: z.string(),
    name: z.string().min(1),
    category: z.enum([
      'travel',
      'purchase',
      'emergency',
      'emergency_reserve',
      'high_value',
      'exorbitant_expense',
      'education',
      'health',
      'housing',
      'unplanned',
      'custom',
    ]),
    targetAmount: z.number().positive(),
    currentAmount: z.number().nonnegative().default(0),
    startDate: isoDateSchema.optional(),
    targetDate: isoDateSchema.optional(),
    status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'delayed', 'at_risk']).default('planned'),
    notes: z.string().optional(),
    linkedExpenseIds: z.array(z.string()).default([]),
    categoryData: z.record(z.unknown()).optional(),
    creationContext: z.record(z.unknown()).optional(),
    simulation: z.record(z.unknown()).optional(),
    alerts: z.array(z.record(z.unknown())).default([]),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  }),
  refSchema: scopedRefSchema,
  create: async (data, context) => {
    assertScenarioUser(data.userId, context)
    for (const expenseId of data.linkedExpenseIds) {
      assertScenarioReference('Expense', expenseId, context)
    }
    const now = new Date()
    const planning: Planning = {
      id: randomUUID(),
      userId: data.userId,
      name: data.name,
      category: data.category,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      startDate: data.startDate ?? dateFromToday(),
      targetDate: data.targetDate ?? dateFromToday(180),
      status: data.status,
      notes: data.notes,
      linkedExpenseIds: data.linkedExpenseIds,
      categoryData: data.categoryData as Planning['categoryData'],
      creationContext: data.creationContext as Planning['creationContext'],
      simulation: data.simulation as Planning['simulation'],
      alerts: data.alerts as unknown as Planning['alerts'],
      riskLevel: data.riskLevel,
      createdAt: now,
      updatedAt: now,
    }
    return planningRepository.create(data.userId, planning)
  },
  teardown: async (record) => {
    await planningRepository.delete(record.userId, record.id)
  },
})

export const autonomaFactories = {
  User,
  Expense,
  Income,
  CreditCard,
  CardBill,
  Invoice,
  InvoiceItem,
  Planning,
}
