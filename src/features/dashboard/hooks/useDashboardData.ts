/**
 * useDashboardData Hook
 * 
 * Hook customizado para gerenciar o estado do dashboard
 * Centraliza toda a lógica de state management e persistência
 */

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import { InvoiceRepository } from '@/features/invoices'
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

  // State principal
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([]) // Adicionado suporte para invoices

  // State de filtros
  const [filters, setFilters] = useState<DashboardFilters>({
    expenseCategory: 'all',
    cardBillCategory: 'all',
    incomeCategory: 'all',
  })

  // State de navegação
  const [tabs, setTabs] = useState<DashboardTabs>({
    main: 'expenses',
    expenseSubTab: 'general',
  })

  // 🔒 Carregar dados do localStorage quando o componente montar
  useEffect(() => {
    if (!user?.id) return

    const data = DashboardService.loadDashboardData(user.id)
    setExpenses(data.expenses)
    setCardBills(data.cardBills)
    setIncomes(data.incomes)
    
    // Carrega invoices do repositório
    const loadInvoices = async () => {
      try {
        const invoiceRepo = new InvoiceRepository()
        const userInvoices = await invoiceRepo.findAll(user.id)
        
        // Carrega todas as faturas (não filtra por mês para permitir visualização no extrato)
        setInvoices(userInvoices)
      } catch (error) {
        console.error('Erro ao carregar invoices:', error)
      }
    }
    
    loadInvoices()
  }, [user?.id])

  // 💾 Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (!user?.id) return
    DashboardService.saveExpenses(user.id, expenses)
  }, [expenses, user?.id])

  useEffect(() => {
    if (!user?.id) return
    DashboardService.saveCardBills(user.id, cardBills)
  }, [cardBills, user?.id])

  useEffect(() => {
    if (!user?.id) return
    DashboardService.saveIncomes(user.id, incomes)
  }, [incomes, user?.id])

  // Actions para despesas
  const addExpense = (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    const newExpense = DashboardService.createExpense(expense, user.id)
    setExpenses((prev) => [newExpense, ...prev])
  }

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => DashboardService.updateExpense(prev, id, updates))
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => DashboardService.deleteExpense(prev, id))
  }

  // Actions para faturas de cartão
  const addCardBill = (cardBill: Omit<CardBill, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    const newCardBill = DashboardService.createCardBill(cardBill, user.id)
    setCardBills((prev) => [newCardBill, ...prev])
  }

  const handleUpdateCardBill = (id: string, updates: Partial<CardBill>) => {
    setCardBills((prev) => DashboardService.updateCardBill(prev, id, updates))
  }

  const handleDeleteCardBill = (id: string) => {
    setCardBills((prev) => DashboardService.deleteCardBill(prev, id))
  }

  // Actions para rendas
  const addIncome = (income: Omit<Income, 'id' | 'date' | 'userId'>) => {
    if (!user?.id) return
    const newIncome = DashboardService.createIncome(income, user.id)
    setIncomes((prev) => [newIncome, ...prev])
  }

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => DashboardService.deleteIncome(prev, id))
  }

  const handleMarkIncomeAsReceived = (id: string) => {
    setIncomes((prev) => DashboardService.markIncomeAsReceived(prev, id))
  }

  // Dados filtrados do mês atual
  const currentMonthData = DashboardService.getCurrentMonthData({
    expenses,
    cardBills,
    incomes,
  })

  // Dados filtrados por categoria
  const filteredGeneralExpenses = DashboardService.filterGeneralExpenses(
    currentMonthData.expenses,
    filters.expenseCategory
  )

  const filteredSubscriptions = DashboardService.filterSubscriptions(
    currentMonthData.expenses,
    filters.expenseCategory
  )

  const filteredCardBills = DashboardService.filterCardBillsByCategory(
    currentMonthData.cardBills,
    filters.cardBillCategory
  )

  const filteredIncomes = DashboardService.filterIncomesByCategory(
    currentMonthData.incomes,
    filters.incomeCategory
  )

  return {
    // Data
    expenses,
    cardBills,
    incomes,
    invoices, // Adicionado invoices ao retorno
    currentMonthData,

    // Filtered data
    filteredGeneralExpenses,
    filteredSubscriptions,
    filteredCardBills,
    filteredIncomes,

    // Filters
    filters,
    setFilters,

    // Tabs
    tabs,
    setTabs,

    // Actions
    addExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    addCardBill,
    updateCardBill: handleUpdateCardBill,
    deleteCardBill: handleDeleteCardBill,
    addIncome,
    deleteIncome: handleDeleteIncome,
    markIncomeAsReceived: handleMarkIncomeAsReceived,
  }
}
