import { describe, expect, it } from 'vitest'
import { calculateFinancialSummary as calculateSharedFinancialSummary } from '@domain/financial-calculations'
import { calculateFinancialSummary as calculateWebFinancialSummary } from '@/lib/financial-calculations'
import { getMyPortion, hasPersonSplit } from '@/features/invoices/utils/invoice-split.utils'
import type { CardBill, Expense, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'

function createIncome(overrides: Partial<Income> = {}): Income {
  return {
    id: 'income-1',
    userId: 'user-1',
    description: 'Receita',
    amount: 0,
    type: 'salary',
    date: '2026-08-01',
    status: 'pending',
    registrationDate: '2026-08-01',
    receivedDate: null,
    ...overrides,
  }
}

function createExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'expense-1',
    userId: 'user-1',
    description: 'Despesa',
    amount: 0,
    category: 'Outros',
    date: '2026-08-01',
    status: 'pending',
    ...overrides,
  }
}

function createCardBill(overrides: Partial<CardBill> = {}): CardBill {
  return {
    id: 'card-bill-1',
    userId: 'user-1',
    cardName: 'Nubank',
    totalAmount: 0,
    date: '2026-08-01',
    description: 'Fatura cartão',
    divisions: [],
    ...overrides,
  }
}

function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'invoice-1',
    userId: 'user-1',
    cardId: 'card-1',
    month: 8,
    year: 2026,
    closingDate: new Date('2026-08-10T00:00:00.000Z'),
    dueDate: new Date('2026-08-20T00:00:00.000Z'),
    totalAmount: 0,
    paidAmount: 0,
    isPaid: false,
    items: [],
    ...overrides,
  }
}

describe('financial calculations shared domain', () => {
  it('calculates a golden summary with incomes, expenses, subscriptions, card bills and invoices', () => {
    const incomes = [
      createIncome({ id: 'income-received', amount: 3000, status: 'received' }),
      createIncome({ id: 'income-pending', amount: 500, status: 'pending', type: 'extra' }),
    ]

    const expenses = [
      createExpense({ id: 'general-paid', category: 'Alimentação', amount: 200, status: 'paid' }),
      createExpense({ id: 'general-pending', category: 'Transporte', amount: 150, status: 'pending' }),
      createExpense({ id: 'sub-paid', category: 'Assinaturas', amount: 100, status: 'paid', isActive: true }),
      createExpense({ id: 'sub-pending', category: 'Assinaturas', amount: 50, status: 'pending', isActive: true }),
      createExpense({ id: 'sub-inactive', category: 'Assinaturas', amount: 999, status: 'paid', isActive: false }),
    ]

    const cardBills = [
      createCardBill({ id: 'bill-1', totalAmount: 400 }),
      createCardBill({ id: 'bill-2', totalAmount: 250 }),
    ]

    const invoices = [
      createInvoice({ id: 'invoice-paid', totalAmount: 300, paidAmount: 300, isPaid: true }),
      createInvoice({ id: 'invoice-partial', totalAmount: 200, paidAmount: 80, isPaid: false }),
      createInvoice({
        id: 'invoice-split-unpaid',
        totalAmount: 300,
        items: [
          { id: 'item-1', date: new Date('2026-08-02'), description: 'Eu', amount: 100, category: 'Outros', notes: 'Pessoa: Eu' },
          { id: 'item-2', date: new Date('2026-08-03'), description: 'Mae', amount: 200, category: 'Outros', notes: 'Pessoa: Mãe' },
        ],
      }),
      createInvoice({
        id: 'invoice-split-paid',
        totalAmount: 180,
        paidAmount: 180,
        isPaid: true,
        items: [
          { id: 'item-3', date: new Date('2026-08-04'), description: 'Eu', amount: 60, category: 'Outros', notes: 'Pessoa: Eu' },
          { id: 'item-4', date: new Date('2026-08-05'), description: 'Mae', amount: 120, category: 'Outros', notes: 'Pessoa: Mãe' },
        ],
      }),
    ]

    const summary = calculateSharedFinancialSummary(incomes, expenses, cardBills, invoices)

    expect(summary).toEqual({
      currentBalance: 2260,
      paidExpenses: 740,
      receivedIncomes: 3000,
      projectedBalance: 1690,
      totalExpectedExpenses: 1810,
      totalExpectedIncomes: 3500,
      details: {
        generalExpenses: { paid: 200, expected: 350 },
        subscriptions: { paid: 100, expected: 150 },
        cardBills: { paid: 0, expected: 650 },
        invoices: {
          paid: 440,
          expected: 660,
          totalBeforeSplit: 980,
          hasSplit: true,
        },
        incomes: { received: 3000, expected: 3500 },
        pendingExpenses: 1070,
        pendingIncomes: 500,
      },
    })
  })

  it.each([
    {
      name: 'counts only received incomes and paid expenses in cash balance',
      incomes: [createIncome({ amount: 1000, status: 'received' }), createIncome({ amount: 250, status: 'pending' })],
      expenses: [createExpense({ amount: 400, status: 'paid' }), createExpense({ amount: 150, status: 'pending' })],
      cardBills: [] as CardBill[],
      invoices: [] as Invoice[],
      expected: {
        currentBalance: 600,
        projectedBalance: 700,
        paidExpenses: 400,
        totalExpectedExpenses: 550,
      },
    },
    {
      name: 'ignores inactive subscriptions completely',
      incomes: [createIncome({ amount: 1000, status: 'received' })],
      expenses: [
        createExpense({ category: 'Assinaturas', amount: 90, status: 'paid', isActive: false }),
        createExpense({ category: 'Assinaturas', amount: 30, status: 'pending', isActive: true }),
      ],
      cardBills: [] as CardBill[],
      invoices: [] as Invoice[],
      expected: {
        currentBalance: 1000,
        projectedBalance: 970,
        paidExpenses: 0,
        totalExpectedExpenses: 30,
      },
    },
    {
      name: 'keeps card bills only in projected expenses',
      incomes: [createIncome({ amount: 500, status: 'received' })],
      expenses: [] as Expense[],
      cardBills: [createCardBill({ totalAmount: 220 })],
      invoices: [] as Invoice[],
      expected: {
        currentBalance: 500,
        projectedBalance: 280,
        paidExpenses: 0,
        totalExpectedExpenses: 220,
      },
    },
    {
      name: 'counts partial invoice payment in cash and full invoice in projection',
      incomes: [createIncome({ amount: 1000, status: 'received' })],
      expenses: [] as Expense[],
      cardBills: [] as CardBill[],
      invoices: [createInvoice({ totalAmount: 300, paidAmount: 120, isPaid: false })],
      expected: {
        currentBalance: 880,
        projectedBalance: 700,
        paidExpenses: 120,
        totalExpectedExpenses: 300,
      },
    },
  ])('$name', ({ incomes, expenses, cardBills, invoices, expected }) => {
    const summary = calculateSharedFinancialSummary(incomes, expenses, cardBills, invoices)

    expect(summary.currentBalance).toBe(expected.currentBalance)
    expect(summary.projectedBalance).toBe(expected.projectedBalance)
    expect(summary.paidExpenses).toBe(expected.paidExpenses)
    expect(summary.totalExpectedExpenses).toBe(expected.totalExpectedExpenses)
  })

  it('keeps the existing web facade compatible with the shared implementation', () => {
    const incomes = [createIncome({ amount: 900, status: 'received' })]
    const expenses = [createExpense({ amount: 100, status: 'paid' })]
    const cardBills = [createCardBill({ totalAmount: 50 })]
    const invoices = [createInvoice({ totalAmount: 70, paidAmount: 20, isPaid: false })]

    expect(calculateWebFinancialSummary(incomes, expenses, cardBills, invoices)).toEqual(
      calculateSharedFinancialSummary(incomes, expenses, cardBills, invoices)
    )
  })
})

describe('invoice split utilities', () => {
  it('calculates my portion only from my tagged items when the invoice is split', () => {
    const invoice = createInvoice({
      totalAmount: 250,
      items: [
        { id: 'item-a', date: new Date('2026-08-01'), description: 'Mercado', amount: 90, category: 'Outros', notes: 'Pessoa: Eu' },
        { id: 'item-b', date: new Date('2026-08-01'), description: 'Farmacia', amount: 160, category: 'Outros', notes: 'Pessoa: Mãe' },
      ],
    })

    expect(hasPersonSplit(invoice)).toBe(true)
    expect(getMyPortion(invoice)).toBe(90)
  })

  it('falls back to the full invoice total when there is no real person split', () => {
    const invoice = createInvoice({
      totalAmount: 180,
      items: [
        { id: 'item-c', date: new Date('2026-08-01'), description: 'Streaming', amount: 80, category: 'Outros' },
        { id: 'item-d', date: new Date('2026-08-01'), description: 'Mercado', amount: 100, category: 'Outros', notes: 'Pessoa: Eu' },
      ],
    })

    expect(hasPersonSplit(invoice)).toBe(false)
    expect(getMyPortion(invoice)).toBe(180)
  })
})
