/**
 * Financial Rules & Calculations
 * 
 * Sistema de cálculo financeiro seguindo regras corretas de contabilidade:
 * - SALDO ATUAL: Regime de Caixa (apenas valores efetivamente pagos/recebidos)
 * - PROJEÇÃO: Regime de Competência (todos os valores previstos)
 */

import type { Expense, Income, CardBill } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'

/**
 * Resultado do cálculo financeiro
 */
export interface FinancialSummary {
  // 💰 REGIME DE CAIXA (Saldo Real)
  currentBalance: number
  paidExpenses: number
  receivedIncomes: number
  
  // 📊 REGIME DE COMPETÊNCIA (Projeção)
  projectedBalance: number
  totalExpectedExpenses: number
  totalExpectedIncomes: number
  
  // 📈 Detalhamento
  details: {
    generalExpenses: { paid: number; expected: number }
    subscriptions: { paid: number; expected: number }
    cardBills: { paid: number; expected: number }
    invoices: { paid: number; expected: number } // Adicionado suporte para Invoices
    incomes: { received: number; expected: number }
    pendingExpenses: number
    pendingIncomes: number
  }
}

/**
 * Calcula o saldo financeiro correto seguindo as regras de negócio
 * 
 * REGRAS:
 * 1. Saldo Atual = Rendas Recebidas - Despesas Pagas
 * 2. Projeção = Todas Rendas Previstas - Todas Despesas Previstas
 * 3. Assinaturas inativas não entram nos cálculos
 * 4. Status determina se entra no Saldo Atual ou apenas na Projeção
 * 5. Faturas (Invoices) são consideradas separadamente de CardBills
 */
export function calculateFinancialSummary(
  incomes: Income[],
  expenses: Expense[],
  cardBills: CardBill[],
  invoices: Invoice[] = [] // Adicionado parâmetro opcional para Invoices
): FinancialSummary {
  
  // 🟢 RECEITAS
  const receivedIncomes = incomes
    .filter(income => income.status === 'received')
    .reduce((sum, income) => sum + income.amount, 0)
  
  const totalExpectedIncomes = incomes
    .reduce((sum, income) => sum + income.amount, 0)
  
  const pendingIncomes = totalExpectedIncomes - receivedIncomes
  
  // 🔴 DESPESAS GERAIS (exceto assinaturas)
  const generalExpenses = expenses.filter(exp => exp.category !== 'Assinaturas')
  
  const paidGeneralExpenses = generalExpenses
    .filter(exp => exp.status === 'paid')
    .reduce((sum, exp) => sum + exp.amount, 0)
  
  const expectedGeneralExpenses = generalExpenses
    .reduce((sum, exp) => sum + exp.amount, 0)
  
  // 🔔 ASSINATURAS (apenas ativas)
  const activeSubscriptions = expenses.filter(
    exp => exp.category === 'Assinaturas' && exp.isActive !== false
  )
  
  const paidSubscriptions = activeSubscriptions
    .filter(exp => exp.status === 'paid')
    .reduce((sum, exp) => sum + exp.amount, 0)
  
  const expectedSubscriptions = activeSubscriptions
    .reduce((sum, exp) => sum + exp.amount, 0)
  
  // 💳 FATURAS DE CARTÃO (CardBills - sistema antigo)
  const paidCardBills = 0 // TODO: Adicionar status às faturas se necessário
  
  const expectedCardBills = cardBills
    .reduce((sum, bill) => sum + bill.totalAmount, 0)
  
  // 📇 FATURAS DE CARTÃO (Invoices - sistema novo integrado com gerenciamento de cartões)
  const paidInvoices = invoices
    .filter(invoice => invoice.isPaid)
    .reduce((sum, invoice) => sum + invoice.paidAmount, 0)
  
  const expectedInvoices = invoices
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  
  // 📊 TOTALIZAÇÕES (inclui tanto CardBills quanto Invoices)
  const paidExpenses = paidGeneralExpenses + paidSubscriptions + paidCardBills + paidInvoices
  const totalExpectedExpenses = expectedGeneralExpenses + expectedSubscriptions + expectedCardBills + expectedInvoices
  const pendingExpenses = totalExpectedExpenses - paidExpenses
  
  // 💰 SALDO ATUAL (Regime de Caixa)
  const currentBalance = receivedIncomes - paidExpenses
  
  // 📈 PROJEÇÃO (Regime de Competência)
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

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Calcula porcentagem de gasto
 */
export function calculateExpensePercentage(spent: number, total: number): number {
  if (total === 0) return 0
  return Math.round((spent / total) * 100)
}

/**
 * Verifica se está no vermelho
 */
export function isOverBudget(summary: FinancialSummary): boolean {
  return summary.currentBalance < 0
}

/**
 * Verifica se projeção é negativa
 */
export function willBeOverBudget(summary: FinancialSummary): boolean {
  return summary.projectedBalance < 0
}
