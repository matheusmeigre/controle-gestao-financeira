import { getMyPortion, hasPersonSplit, type SplitInvoiceLike } from './invoice-split'

export interface FinancialSummary {
  currentBalance: number
  paidExpenses: number
  receivedIncomes: number
  projectedBalance: number
  totalExpectedExpenses: number
  totalExpectedIncomes: number
  details: {
    generalExpenses: { paid: number; expected: number }
    subscriptions: { paid: number; expected: number }
    cardBills: { paid: number; expected: number }
    invoices: {
      paid: number
      expected: number
      totalBeforeSplit: number
      hasSplit: boolean
    }
    incomes: { received: number; expected: number }
    pendingExpenses: number
    pendingIncomes: number
  }
}

export interface SharedIncomeLike {
  amount: number
  status: 'pending' | 'received'
}

export interface SharedExpenseLike {
  amount: number
  category: string
  status?: 'paid' | 'pending'
  isActive?: boolean
}

export interface SharedCardBillLike {
  totalAmount: number
}

export interface SharedInvoiceLike extends SplitInvoiceLike {
  paidAmount: number
  isPaid: boolean
}

function sumBy<T>(items: ReadonlyArray<T>, getValue: (item: T) => number): number {
  return items.reduce((sum, item) => sum + getValue(item), 0)
}

function getInvoicePaidPortion(invoice: SharedInvoiceLike): number {
  return Math.min(invoice.paidAmount, getMyPortion(invoice))
}

export function calculateFinancialSummary(
  incomes: ReadonlyArray<SharedIncomeLike>,
  expenses: ReadonlyArray<SharedExpenseLike>,
  cardBills: ReadonlyArray<SharedCardBillLike>,
  invoices: ReadonlyArray<SharedInvoiceLike> = []
): FinancialSummary {
  const receivedIncomes = sumBy(
    incomes.filter((income) => income.status === 'received'),
    (income) => income.amount
  )
  const totalExpectedIncomes = sumBy(incomes, (income) => income.amount)
  const pendingIncomes = totalExpectedIncomes - receivedIncomes

  const generalExpenses = expenses.filter((expense) => expense.category !== 'Assinaturas')
  const paidGeneralExpenses = sumBy(
    generalExpenses.filter((expense) => expense.status === 'paid'),
    (expense) => expense.amount
  )
  const expectedGeneralExpenses = sumBy(generalExpenses, (expense) => expense.amount)

  const activeSubscriptions = expenses.filter(
    (expense) => expense.category === 'Assinaturas' && expense.isActive !== false
  )
  const paidSubscriptions = sumBy(
    activeSubscriptions.filter((expense) => expense.status === 'paid'),
    (expense) => expense.amount
  )
  const expectedSubscriptions = sumBy(activeSubscriptions, (expense) => expense.amount)

  const paidCardBills = 0
  const expectedCardBills = sumBy(cardBills, (bill) => bill.totalAmount)

  const totalInvoicesBeforeSplit = sumBy(invoices, (invoice) => invoice.totalAmount)
  const invoicesHaveSplit = invoices.some((invoice) => hasPersonSplit(invoice))
  const expectedInvoices = sumBy(invoices, (invoice) => getMyPortion(invoice))
  const paidInvoices = sumBy(invoices, (invoice) => getInvoicePaidPortion(invoice))
  const pendingInvoices = Math.max(expectedInvoices - paidInvoices, 0)

  const paidExpenses = paidGeneralExpenses + paidSubscriptions + paidCardBills + paidInvoices
  const totalExpectedExpenses =
    expectedGeneralExpenses + expectedSubscriptions + expectedCardBills + expectedInvoices
  const pendingExpenses =
    expectedGeneralExpenses - paidGeneralExpenses +
    (expectedSubscriptions - paidSubscriptions) +
    expectedCardBills +
    pendingInvoices

  const currentBalance = receivedIncomes - paidExpenses
  const projectedBalance = totalExpectedIncomes - totalExpectedExpenses

  return {
    currentBalance,
    paidExpenses,
    receivedIncomes,
    projectedBalance,
    totalExpectedExpenses,
    totalExpectedIncomes,
    details: {
      generalExpenses: {
        paid: paidGeneralExpenses,
        expected: expectedGeneralExpenses,
      },
      subscriptions: {
        paid: paidSubscriptions,
        expected: expectedSubscriptions,
      },
      cardBills: {
        paid: paidCardBills,
        expected: expectedCardBills,
      },
      invoices: {
        paid: paidInvoices,
        expected: expectedInvoices,
        totalBeforeSplit: totalInvoicesBeforeSplit,
        hasSplit: invoicesHaveSplit,
      },
      incomes: {
        received: receivedIncomes,
        expected: totalExpectedIncomes,
      },
      pendingExpenses,
      pendingIncomes,
    },
  }
}
