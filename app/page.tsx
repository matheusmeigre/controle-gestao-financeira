"use client"

import { useState, useEffect } from "react"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseSummary } from "@/components/expense-summary"
import { CardBillForm } from "@/components/card-bill-form"
import { CardBillsList } from "@/components/card-bills-list"
import { CardSummary } from "@/components/card-summary"
import { ExportManager } from "@/components/export-manager"
import { IncomeForm } from "@/components/income-form"
import { IncomeList } from "@/components/income-list"
import { IncomeSummary } from "@/components/income-summary"
import { MonthlyBalance } from "@/components/monthly-balance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Expense, CardBill, Income } from "@/types/expense"
import { Receipt, CreditCard, DollarSign } from "lucide-react"

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }

    const savedCardBills = localStorage.getItem("cardBills")
    if (savedCardBills) {
      setCardBills(JSON.parse(savedCardBills))
    }

    const savedIncomes = localStorage.getItem("incomes")
    if (savedIncomes) {
      setIncomes(JSON.parse(savedIncomes))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem("cardBills", JSON.stringify(cardBills))
  }, [cardBills])

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes))
  }, [incomes])

  const addExpense = (expense: Omit<Expense, "id" | "date">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const addCardBill = (cardBill: Omit<CardBill, "id" | "date">) => {
    const newCardBill: CardBill = {
      ...cardBill,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
    setCardBills((prev) => [newCardBill, ...prev])
  }

  const addIncome = (income: Omit<Income, "id" | "date">) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString(),
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
          : income,
      ),
    )
  }

  // Filter data for current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth))
  const currentMonthCardBills = cardBills.filter((bill) => bill.date.startsWith(currentMonth))
  const currentMonthIncomes = incomes.filter((income) => income.date.startsWith(currentMonth))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-balance">Controle de Gastos</h1>
          <p className="text-sm sm:text-base text-muted-foreground text-balance px-4">
            Registre seus gastos mensais e faturas de cartão de forma rápida e simples
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <MonthlyBalance
            incomes={currentMonthIncomes}
            expenses={currentMonthExpenses}
            cardBills={currentMonthCardBills}
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto">
            <TabsTrigger
              value="expenses"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
            >
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">Gastos Gerais</span>
              <span className="xs:hidden">Gastos</span>
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
            >
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline">Faturas de Cartão</span>
              <span className="xs:hidden">Faturas</span>
            </TabsTrigger>
            <TabsTrigger
              value="incomes"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
            >
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Rendas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6 sm:space-y-8">
            <ExpenseSummary expenses={currentMonthExpenses} />

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-1">
                <ExpenseForm onAddExpense={addExpense} />
              </div>

              <div className="order-2">
                <ExpenseList
                  expenses={currentMonthExpenses}
                  onUpdateExpense={updateExpense}
                  onDeleteExpense={deleteExpense}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6 sm:space-y-8">
            <CardSummary cardBills={currentMonthCardBills} />

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-1">
                <CardBillForm onAddCardBill={addCardBill} />
              </div>

              <div className="order-2">
                <CardBillsList cardBills={currentMonthCardBills} onDeleteCardBill={deleteCardBill} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="incomes" className="space-y-6 sm:space-y-8">
            <IncomeSummary incomes={currentMonthIncomes} />

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-1">
                <IncomeForm onAddIncome={addIncome} />
              </div>

              <div className="order-2">
                <IncomeList
                  incomes={currentMonthIncomes}
                  onDeleteIncome={deleteIncome}
                  onMarkAsReceived={markIncomeAsReceived}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
