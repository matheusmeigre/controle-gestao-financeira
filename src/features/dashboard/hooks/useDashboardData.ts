/**
 * useDashboardData Hook
 *
 * Centraliza o estado do dashboard.
 * Todas as operações de leitura/escrita passam por Server Actions
 * que persistem no Supabase — sem localStorage.
 */

'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
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
  const [, startTransition] = useTransition()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [filters, setFilters] = useState<DashboardFilters>({
    expenseCategory: 'all',
    cardBillCategory: 'all',
    incomeCategory: 'all',
  })

  const [tabs, setTabs] = useState<DashboardTabs>({
    main: 'expenses',
    expenseSubTab: 'general',
  })

  // ─── Carregamento inicial via Server Actions ────────────────────────
  const loadData = useCallback(async () => {
    if (!user?.id) return

    // Expenses
    const expRes = await getExpenses()
    if (expRes.success) setExpenses(expRes.data as Expense[])

    // Incomes
    const incRes = await getIncomes()
    if (incRes.success) setIncomes(incRes.data as Income[])

    // Invoices
    const invRes = await getInvoices()
    if (invRes.success) setInvoices(invRes.data as Invoice[])

    // Card bills — ainda via localStorage enquanto não há migration completa
    const cardBillsData = loadUserData<CardBill>('cardBills', user.id)
    setCardBills(cardBillsData)
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Actions para despesas ───────────────────────────────────────────
  const addExpense = (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    startTransition(async () => {
      const result = await serverCreateExpense(expense)
      if (result.success && result.data) setExpenses((prev) => [result.data as Expense, ...prev])
    })
  }

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    startTransition(async () => {
      const result = await serverUpdateExpense({ ...updates, id } as Expense & { id: string })
      if (result.success) setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    })
  }

  const handleDeleteExpense = (id: string) => {
    startTransition(async () => {
      await serverDeleteExpense(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
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
    startTransition(async () => {
      const result = await serverCreateIncome({ ...income, date: new Date().toISOString().split('T')[0] })
      if (result.success && result.data) setIncomes((prev) => [result.data as Income, ...prev])
    })
  }

  const handleDeleteIncome = (id: string) => {
    startTransition(async () => {
      await serverDeleteIncome(id)
      setIncomes((prev) => prev.filter((i) => i.id !== id))
    })
  }

  const handleMarkIncomeAsReceived = (id: string) => {
    startTransition(async () => {
      await serverMarkIncomeAsReceived(id)
      setIncomes((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'received' as const, receivedDate: new Date().toISOString() } : i
        )
      )
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
    filters, setFilters, tabs, setTabs,
    addExpense, updateExpense: handleUpdateExpense, deleteExpense: handleDeleteExpense,
    addCardBill, updateCardBill: handleUpdateCardBill, deleteCardBill: handleDeleteCardBill,
    addIncome, deleteIncome: handleDeleteIncome, markIncomeAsReceived: handleMarkIncomeAsReceived,
  }
}
