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
import { SubscriptionSummary } from "@/components/subscription-summary"
import { CategoryFilter } from "@/components/category-filter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Expense, CardBill, Income } from "@/types/expense"
import { CATEGORIES, INCOME_CATEGORIES } from "@/types/expense"
import { Receipt, CreditCard, DollarSign, RefreshCw } from "lucide-react"
import { UserHeader } from "@/components/user-header"
import { WelcomeModal } from "@/components/welcome-modal"
import { TermsAcceptanceModal } from "@/components/terms-acceptance-modal"
import { Footer } from "@/components/footer"
import { loadUserData, saveUserData } from "@/lib/user-data"

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cardBills, setCardBills] = useState<CardBill[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all")
  const [cardBillCategoryFilter, setCardBillCategoryFilter] = useState("all")
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState("all")
  const [expenseSubTab, setExpenseSubTab] = useState<"general" | "subscriptions">("general")

  // 🎉 Detecta primeiro acesso do usuário
  useEffect(() => {
    if (!user?.id) return
    
    const termsKey = `terms_accepted_${user.id}`
    const hasAcceptedTerms = localStorage.getItem(termsKey)
    
    if (!hasAcceptedTerms) {
      setShowTermsModal(true)
    } else {
      // Só mostra welcome se já aceitou os termos
      const welcomeKey = `welcome_shown_${user.id}`
      const hasSeenWelcome = localStorage.getItem(welcomeKey)
      
      if (!hasSeenWelcome) {
        setShowWelcome(true)
        localStorage.setItem(welcomeKey, 'true')
      }
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

  const updateCardBill = (id: string, updates: Partial<CardBill>) => {
    setCardBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, ...updates } : bill))
    )
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

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    if (!user?.id) return
    
    const termsKey = `terms_accepted_${user.id}`
    localStorage.setItem(termsKey, 'true')
    setShowTermsModal(false)
    
    // After accepting terms, check if should show welcome
    const welcomeKey = `welcome_shown_${user.id}`
    const hasSeenWelcome = localStorage.getItem(welcomeKey)
    
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem(welcomeKey, 'true')
    }
  }

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
    <div className="min-h-screen bg-background flex flex-col">
      {showTermsModal && (
        <TermsAcceptanceModal onAccept={handleAcceptTerms} />
      )}
      
      {showWelcome && (
        <WelcomeModal 
          userName={user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'Usuário'}
          onClose={() => setShowWelcome(false)}
        />
      )}
      
      <UserHeader />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">Controle de Gastos</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-balance px-2 sm:px-4">
            Registre seus gastos mensais e faturas de cartão de forma rápida e simples
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <MonthlyBalance
            incomes={currentMonthIncomes}
            expenses={currentMonthExpenses}
            cardBills={currentMonthCardBills}
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
        </div>

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto p-1">
            <TabsTrigger
              value="expenses"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
            >
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">Gastos Gerais</span>
              <span className="xs:hidden">Gastos</span>
            </TabsTrigger>
            <TabsTrigger
              value="cards"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
            >
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden xs:inline">Faturas de Cartão</span>
              <span className="xs:hidden">Faturas</span>
            </TabsTrigger>
            <TabsTrigger
              value="incomes"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
            >
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span>Rendas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
            <ExpenseSummary expenses={currentMonthExpenses.filter(e => e.category !== "Assinaturas")} />

            {/* Sub-abas para Gastos Gerais e Assinaturas */}
            <div className="flex items-center justify-between">
              <Tabs value={expenseSubTab} onValueChange={(v) => setExpenseSubTab(v as "general" | "subscriptions")} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1">
                  <TabsTrigger value="general" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Gastos Gerais</span>
                    <span className="xs:hidden">Gerais</span>
                  </TabsTrigger>
                  <TabsTrigger value="subscriptions" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Assinaturas</span>
                    <span className="xs:hidden">Assinat.</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filtro de categoria */}
            <div className="flex justify-end">
              <CategoryFilter
                categories={CATEGORIES}
                selectedCategory={expenseCategoryFilter}
                onCategoryChange={setExpenseCategoryFilter}
              />
            </div>

            {expenseSubTab === "general" ? (
              <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="order-1">
                  <ExpenseForm onAddExpense={addExpense} />
                </div>

                <div className="order-2">
                  <ExpenseList
                    expenses={filteredGeneralExpenses}
                    onUpdateExpense={updateExpense}
                    onDeleteExpense={deleteExpense}
                  />
                </div>
              </div>
            ) : (
              <>
                <SubscriptionSummary subscriptions={filteredSubscriptions} />
                
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="order-1">
                    <SubscriptionForm onAddSubscription={addExpense} />
                  </div>

                  <div className="order-2">
                    <SubscriptionList
                      subscriptions={filteredSubscriptions}
                      onUpdateSubscription={updateExpense}
                      onDeleteSubscription={deleteExpense}
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="cards" className="space-y-6 sm:space-y-8">
            <CardSummary cardBills={currentMonthCardBills} />

            {/* Filtro de categoria */}
            <div className="flex justify-end">
              <CategoryFilter
                categories={CATEGORIES}
                selectedCategory={cardBillCategoryFilter}
                onCategoryChange={setCardBillCategoryFilter}
              />
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-1">
                <CardBillFormV2 onAddCardBill={addCardBill} />
              </div>

              <div className="order-2">
                <CardBillsListV2 
                  cardBills={filteredCardBills} 
                  onDeleteCardBill={deleteCardBill}
                  onUpdateCardBill={updateCardBill}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="incomes" className="space-y-6 sm:space-y-8">
            <IncomeSummary incomes={currentMonthIncomes} />

            {/* Filtro de categoria */}
            <div className="flex justify-end">
              <CategoryFilter
                categories={INCOME_CATEGORIES}
                selectedCategory={incomeCategoryFilter}
                onCategoryChange={setIncomeCategoryFilter}
              />
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="order-1">
                <IncomeForm onAddIncome={addIncome} />
              </div>

              <div className="order-2">
                <IncomeList
                  incomes={filteredIncomes}
                  onDeleteIncome={deleteIncome}
                  onMarkAsReceived={markIncomeAsReceived}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}
