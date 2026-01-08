"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseSummary } from "@/components/expense-summary"
import { CardBillFormV2 } from "@/components/card-bill-form-v2"
import { CardBillsListV2 } from "@/components/card-bills-list-v2"
import { CardSummary } from "@/components/card-summary"
import { ExportManager } from "@/components/export-manager"
import { IncomeForm } from "@/components/income-form"
import { IncomeList } from "@/components/income-list"
import { IncomeSummary } from "@/components/income-summary"
import { MonthlyBalance } from "@/components/monthly-balance"
import { SubscriptionForm } from "@/components/subscription-form"
import { SubscriptionList } from "@/components/subscription-list"
import { CategoryFilter } from "@/components/category-filter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Expense, CardBill, Income } from "@/types/expense"
import { CATEGORIES, INCOME_CATEGORIES } from "@/types/expense"
import { Receipt, CreditCard, DollarSign, RefreshCw } from "lucide-react"
import { UserHeader } from "@/components/user-header"
import { WelcomeModal } from "@/components/welcome-modal"
import { loadUserData, saveUserData } from "@/lib/user-data"

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all")
  const [cardBillCategoryFilter, setCardBillCategoryFilter] = useState("all")
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState("all")
  const [expenseSubTab, setExpenseSubTab] = useState<"general" | "subscriptions">("general")

  // 🎉 Detecta primeiro acesso do usuário
  useEffect(() => {
    if (!user?.id) return
    
    const welcomeKey = `welcome_shown_${user.id}`
    const hasSeenWelcome = localStorage.getItem(welcomeKey)
    
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem(welcomeKey, 'true')
    }
  }, [user?.id])

  // 🔒 Load data from localStorage on component mount (filtrado por userId)
  useEffect(() => {
    if (!user?.id) return

    const loadedExpenses = loadUserData<Expense>("expenses", user.id)
    const loadedCardBills = loadUserData<CardBill>("cardBills", user.id)
    const loadedIncomes = loadUserData<Income>("incomes", user.id)

    setExpenses(loadedExpenses)
    setCardBills(loadedCardBills)
    setIncomes(loadedIncomes)
  }, [user?.id])

  // 💾 Save data to localStorage whenever it changes
  useEffect(() => {
    if (!user?.id || expenses.length === 0) return
    saveUserData("expenses", user.id, expenses)
  }, [expenses, user?.id])

  useEffect(() => {
    if (!user?.id || cardBills.length === 0) return
    saveUserData("cardBills", user.id, cardBills)
  }, [cardBills, user?.id])

  useEffect(() => {
    if (!user?.id || incomes.length === 0) return
    saveUserData("incomes", user.id, incomes)
  }, [incomes, user?.id])

  const addExpense = (expense: Omit<Expense, "id" | "date" | "userId">) => {
    if (!user?.id) return
    
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString().split("T")[0],
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const addCardBill = (cardBill: Omit<CardBill, "id" | "date" | "userId">) => {
    if (!user?.id) return
    
    const newCardBill: CardBill = {
      ...cardBill,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString().split("T")[0],
    }
    setCardBills((prev) => [newCardBill, ...prev])
  }

  const addIncome = (income: Omit<Income, "id" | "date" | "userId">) => {
    if (!user?.id) return
    
    const newIncome: Income = {
      ...income,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString().split("T")[0],
    }
    setIncomes((prev) => [newIncome, ...prev])
  }

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses((prev) => prev.map((expense) => (expense.id === id ? { ...expense, ...updatedExpense } : expense)))
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  const deleteCardBill = (id: string) => {
    setCardBills((prev) => prev.filter((bill) => bill.id !== id))
  }

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((income) => income.id !== id))
  }

  const markIncomeAsReceived = (id: string) => {
    setIncomes((prev) =>
      prev.map((income) =>
        income.id === id
          ? {
              ...income,
              status: "received" as const,
              receivedDate: new Date().toISOString(),
            }
          : income
      )
    )
  }

  // Filter data for current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth))
  const currentMonthCardBills = cardBills.filter((bill) => bill.date.startsWith(currentMonth))
  const currentMonthIncomes = incomes.filter((income) => income.date.startsWith(currentMonth))

  // Filter by category
  const filteredGeneralExpenses = expenseCategoryFilter === "all" 
    ? currentMonthExpenses.filter(e => e.category !== "Assinaturas")
    : currentMonthExpenses.filter(e => e.category === expenseCategoryFilter && e.category !== "Assinaturas")

  const filteredSubscriptions = expenseCategoryFilter === "all"
    ? currentMonthExpenses.filter(e => e.category === "Assinaturas")
    : currentMonthExpenses.filter(e => e.category === "Assinaturas" && e.category === expenseCategoryFilter)

  const filteredCardBills = cardBillCategoryFilter === "all"
    ? currentMonthCardBills
    : currentMonthCardBills.filter(bill => 
        bill.items?.some(item => item.category === cardBillCategoryFilter)
      )

  const filteredIncomes = incomeCategoryFilter === "all"
    ? currentMonthIncomes
    : currentMonthIncomes.filter(income => income.category === incomeCategoryFilter)

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {showWelcome && (
        <WelcomeModal 
          userName={user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'Usuário'}
          onClose={() => setShowWelcome(false)}
        />
      )}
}
