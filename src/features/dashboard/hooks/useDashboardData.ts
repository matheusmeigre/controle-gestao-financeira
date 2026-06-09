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
import { getInvoices } from '@/server/actions/invoices'
import * as DashboardService from '../services/dashboard.service'

// Card bills ainda usa o sistema legado (localStorage) enquanto migração não é concluída
import { loadUserData, saveUserData } from '@/lib/user-data'

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
      const [expRes, incRes, invRes] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getInvoices(),
      ])
      if (expRes.success) setExpenses(expRes.data as Expense[])
      if (incRes.success) setIncomes(incRes.data as Income[])
      if (invRes.success) setInvoices(invRes.data as Invoice[])

      // Card bills — ainda via localStorage
      const cardBillsData = loadUserData<CardBill>('cardBills', user.id)
      setCardBills(cardBillsData)
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

  // ─── Actions para card bills (localStorage legado) ──────────────────
  const addCardBill = (cardBill: Omit<CardBill, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    const newCardBill = DashboardService.createCardBill(cardBill, user.id)
    setCardBills((prev) => {
      const updated = [newCardBill, ...prev]
      saveUserData('cardBills', user.id, updated)
      return updated
    })
  }

  const handleUpdateCardBill = (id: string, updates: Partial<CardBill>) => {
    setCardBills((prev) => {
      const updated = DashboardService.updateCardBill(prev, id, updates)
      if (user?.id) saveUserData('cardBills', user.id, updated)
      return updated
    })
  }

  const handleDeleteCardBill = (id: string) => {
    setCardBills((prev) => {
      const updated = DashboardService.deleteCardBill(prev, id)
      if (user?.id) saveUserData('cardBills', user.id, updated)
      return updated
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
  }
}
