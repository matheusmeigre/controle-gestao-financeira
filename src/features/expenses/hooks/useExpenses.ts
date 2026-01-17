'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { ExpenseService } from '../services/expense.service'
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types'

const expenseService = new ExpenseService()

export function useExpenses() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carrega despesas
  const loadExpenses = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await expenseService.getAllExpenses(user.id)
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas')
      console.error('Erro ao carregar despesas:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  // Adiciona despesa
  const addExpense = useCallback(async (data: CreateExpenseInput) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const newExpense = await expenseService.addExpense(user.id, data)
      setExpenses(prev => [...prev, newExpense])
      return newExpense
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao adicionar despesa'
      setError(message)
      throw new Error(message)
    }
  }, [user?.id])

  // Atualiza despesa
  const updateExpense = useCallback(async (input: UpdateExpenseInput) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const updated = await expenseService.updateExpense(user.id, input)
      if (updated) {
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
      }
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar despesa'
      setError(message)
      throw new Error(message)
    }
  }, [user?.id])

  // Remove despesa
  const deleteExpense = useCallback(async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const success = await expenseService.deleteExpense(user.id, id)
      if (success) {
        setExpenses(prev => prev.filter(e => e.id !== id))
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover despesa'
      setError(message)
      throw new Error(message)
    }
  }, [user?.id])

  // Calcula total mensal
  const getMonthlyTotal = useCallback((month: number, year: number) => {
    return expenses
      .filter(e => {
        const date = new Date(e.date)
        return date.getMonth() === month && date.getFullYear() === year
      })
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  // Filtra por categoria
  const getByCategory = useCallback((category: string) => {
    return expenses.filter(e => e.category === category)
  }, [expenses])

  // Filtra por status
  const getByStatus = useCallback((status: 'paid' | 'pending') => {
    return expenses.filter(e => e.status === status)
  }, [expenses])

  // Obtém despesas recorrentes
  const getRecurring = useCallback(() => {
    return expenses.filter(e => e.isRecurring === true)
  }, [expenses])

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
    getMonthlyTotal,
    getByCategory,
    getByStatus,
    getRecurring
  }
}
