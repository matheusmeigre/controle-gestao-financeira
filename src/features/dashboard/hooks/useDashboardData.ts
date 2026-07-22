/**
 * useDashboardData Hook
 *
 * Centraliza o estado do dashboard.
 * Todas as operações de leitura/escrita passam por Server Actions
 * que persistem no Supabase — sem localStorage.
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import {
  getExpenses,
  createExpense as serverCreateExpense,
  updateExpense as serverUpdateExpense,
  deleteExpense as serverDeleteExpense,
} from '@/server/actions/expenses'
import {
  getIncomes,
  createIncome as serverCreateIncome,
  deleteIncome as serverDeleteIncome,
  markIncomeAsReceived as serverMarkIncomeAsReceived,
} from '@/server/actions/incomes'
import { getInvoices, updateInvoice as serverUpdateInvoice, deleteInvoice as serverDeleteInvoice } from '@/server/actions/invoices'
import {
  getCardBills,
  createCardBill as serverCreateCardBill,
  updateCardBill as serverUpdateCardBill,
  deleteCardBill as serverDeleteCardBill,
} from '@/server/actions/card-bills'
import * as DashboardService from '../services/dashboard.service'

export type DashboardFilters = {
  expenseCategory: string
  cardBillCategory: string
  incomeCategory: string
}

export type DashboardTabs = {
  main: 'expenses' | 'cards' | 'incomes'
  expenseSubTab: 'general' | 'subscriptions'
}

export function useDashboardData() {
  const { user } = useUser()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [filters, setFilters] = useState<DashboardFilters>({
    expenseCategory: 'all',
    cardBillCategory: 'all',
    incomeCategory: 'all',
  })

  const [error, setError] = useState<string | null>(null)

  const [tabs, setTabs] = useState<DashboardTabs>({
    main: 'expenses',
    expenseSubTab: 'general',
  })

  // ─── Carregamento inicial via Server Actions ────────────────────────
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      const [expRes, incRes, invRes, cbRes] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getInvoices(),
        getCardBills(),
      ])
      if (expRes.success) setExpenses(expRes.data as Expense[])
      if (incRes.success) setIncomes(incRes.data as Income[])
      if (invRes.success) setInvoices(invRes.data as Invoice[])
      if (cbRes.success) setCardBills(cbRes.data as CardBill[])
    })()
  }, [user?.id])

  // ─── Actions para despesas ───────────────────────────────────────────
  const addExpense = (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    setError(null)
    const optimisticId = crypto.randomUUID()
    const optimistic: Expense = {
      ...expense as Expense,
      id: optimisticId,
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
    }
    setExpenses((prev) => [optimistic, ...prev])
    serverCreateExpense(expense).then((result) => {
      if (result.success && result.data) {
        setExpenses((prev) =>
          prev.map((e) => (e.id === optimisticId ? (result.data as Expense) : e))
        )
      } else {
        setExpenses((prev) => prev.filter((e) => e.id !== optimisticId))
        setError(result.error ?? 'Erro ao criar despesa')
      }
    })
  }

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    if (!user?.id) return
    setError(null)
    const prev = expenses
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    serverUpdateExpense({ ...updates, id } as Expense & { id: string }).then((result) => {
      if (!result.success) {
        setExpenses(prev)
        setError(result.error ?? 'Erro ao atualizar despesa')
      }
    })
  }

  const handleDeleteExpense = (id: string) => {
    if (!user?.id) return
    setError(null)
    const prev = expenses
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    serverDeleteExpense(id).then((result) => {
      if (!result.success) {
        setExpenses(prev)
        setError(result.error ?? 'Erro ao excluir despesa')
      }
    })
  }

  // ─── Actions para card bills (Supabase) ─────────────────────────────
  const addCardBill = (cardBill: Omit<CardBill, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    setError(null)
    const optimisticId = crypto.randomUUID()
    const optimistic: CardBill = {
      ...cardBill as CardBill,
      id: optimisticId,
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
    }
    setCardBills((prev) => [optimistic, ...prev])
    serverCreateCardBill(cardBill).then((result) => {
      if (result.success && result.data) {
        setCardBills((prev) =>
          prev.map((cb) => (cb.id === optimisticId ? (result.data as CardBill) : cb))
        )
      } else {
        setCardBills((prev) => prev.filter((cb) => cb.id !== optimisticId))
        setError(result.error ?? 'Erro ao criar fatura')
      }
    })
  }

  const handleUpdateCardBill = (id: string, updates: Partial<CardBill>) => {
    if (!user?.id) return
    setError(null)
    const prev = cardBills
    setCardBills((prev) =>
      prev.map((cb) => (cb.id === id ? { ...cb, ...updates } : cb))
    )
    serverUpdateCardBill(id, updates).then((result) => {
      if (!result.success) {
        setCardBills(prev)
        setError(result.error ?? 'Erro ao atualizar fatura')
      }
    })
  }

  const handleDeleteCardBill = (id: string) => {
    if (!user?.id) return
    setError(null)
    const prev = cardBills
    setCardBills((prev) => prev.filter((cb) => cb.id !== id))
    serverDeleteCardBill(id).then((result) => {
      if (!result.success) {
        setCardBills(prev)
        setError(result.error ?? 'Erro ao excluir fatura')
      }
    })
  }

  // ─── Actions para rendas ─────────────────────────────────────────────
  const addIncome = (income: Omit<Income, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    setError(null)
    const optimisticId = crypto.randomUUID()
    const optimistic: Income = {
      ...income as Income,
      id: optimisticId,
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
    }
    setIncomes((prev) => [optimistic, ...prev])
    serverCreateIncome({ ...income, date: new Date().toISOString().split('T')[0] }).then((result) => {
      if (result.success && result.data) {
        setIncomes((prev) =>
          prev.map((i) => (i.id === optimisticId ? (result.data as Income) : i))
        )
      } else {
        setIncomes((prev) => prev.filter((i) => i.id !== optimisticId))
        setError(result.error ?? 'Erro ao criar receita')
      }
    })
  }

  const handleDeleteIncome = (id: string) => {
    if (!user?.id) return
    setError(null)
    const prev = incomes
    setIncomes((prev) => prev.filter((i) => i.id !== id))
    serverDeleteIncome(id).then((result) => {
      if (!result.success) {
        setIncomes(prev)
        setError(result.error ?? 'Erro ao excluir receita')
      }
    })
  }

  const handleMarkIncomeAsReceived = (id: string) => {
    if (!user?.id) return
    setError(null)
    const prev = incomes
    setIncomes((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'received' as const, receivedDate: new Date().toISOString() } : i
      )
    )
    serverMarkIncomeAsReceived(id).then((result) => {
      if (!result.success) {
        setIncomes(prev)
        setError(result.error ?? 'Erro ao marcar receita como recebida')
      }
    })
  }

  // ─── Actions para faturas de cartão (Supabase) ──────────────────────
  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    if (!user?.id) return
    setError(null)
    const prev = invoices
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    )
    const result = await serverUpdateInvoice(id, updates)
    if (!result.success) {
      setInvoices(prev)
      setError(result.error ?? 'Erro ao atualizar fatura')
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!user?.id) return
    setError(null)
    const prev = invoices
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    const result = await serverDeleteInvoice(id)
    if (!result.success) {
      setInvoices(prev)
      setError(result.error ?? 'Erro ao excluir fatura')
    }
  }

  // ─── Dados derivados ─────────────────────────────────────────────────
  const currentMonthData = DashboardService.getCurrentMonthData({ expenses, cardBills, incomes })

  const filteredGeneralExpenses = DashboardService.filterGeneralExpenses(
    currentMonthData.expenses, filters.expenseCategory
  )
  const filteredSubscriptions = DashboardService.filterSubscriptions(
    currentMonthData.expenses, filters.expenseCategory
  )
  const filteredCardBills = DashboardService.filterCardBillsByCategory(
    currentMonthData.cardBills, filters.cardBillCategory
  )
  const filteredIncomes = DashboardService.filterIncomesByCategory(
    currentMonthData.incomes, filters.incomeCategory
  )

  return {
    expenses, cardBills, incomes, invoices, currentMonthData,
    filteredGeneralExpenses, filteredSubscriptions, filteredCardBills, filteredIncomes,
    filters, setFilters, tabs, setTabs, error,
    addExpense, updateExpense: handleUpdateExpense, deleteExpense: handleDeleteExpense,
    addCardBill, updateCardBill: handleUpdateCardBill, deleteCardBill: handleDeleteCardBill,
    addIncome, deleteIncome: handleDeleteIncome, markIncomeAsReceived: handleMarkIncomeAsReceived,
    updateInvoice: handleUpdateInvoice, deleteInvoice: handleDeleteInvoice,
  }
}
