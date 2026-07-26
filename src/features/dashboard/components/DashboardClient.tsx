'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { InvoiceSelectModal } from '@/components/invoice-select-modal'
import { QuickTransactionModal, type TransactionType } from '@/components/quick-transaction-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { WelcomeModal } from '@/components/welcome-modal'
import { FloatingActionButton } from '@/components/mobile'
import { HomeSummarySection } from '@/components/sections/HomeSummarySection'
import { ProfileSection } from '@/components/sections/ProfileSection'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CircleAlert } from 'lucide-react'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import {
  CardsTabContent,
  ExpensesTabContent,
  IncomesTabContent,
  MainNavigation,
  useDashboardData,
  useWelcomeFlow,
  type DashboardInitialData,
} from '@/features/dashboard'

export function DashboardClient({ initialData }: { initialData: DashboardInitialData }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddType, setQuickAddType] = useState<TransactionType>('expense')
  const [showInvoiceSelect, setShowInvoiceSelect] = useState(false)
  const view = searchParams.get('view')
  const activeNav = view === 'transactions' || view === 'profile' ? view : 'home'
  const quickAddOpen = showQuickAdd || searchParams.get('action') === 'new'

  const {
    expenses,
    cardBills,
    incomes,
    invoices,
    cards,
    allCards,
    planningAlerts,
    currentMonthData,
    summaryInvoices,
    filteredGeneralExpenses,
    filteredSubscriptions,
    filteredCardBills,
    filteredIncomes,
    filters,
    setFilters,
    tabs,
    setTabs,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addCardBill,
    updateCardBill,
    deleteCardBill,
    addIncome,
    deleteIncome,
    markIncomeAsReceived,
  } = useDashboardData(initialData)

  const { showWelcome, showTermsModal, setShowWelcome, handleAcceptTerms } =
    useWelcomeFlow()

  const financialSummary = useFinancialSummary({
    incomes: currentMonthData.incomes,
    expenses: currentMonthData.expenses,
    cardBills: currentMonthData.cardBills,
    invoices: summaryInvoices,
  })

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-label="Carregando dashboard">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  const firstName =
    user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'Usuário'
  const totalExpenses = currentMonthData.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncomes = currentMonthData.incomes.reduce((sum, income) => sum + income.amount, 0)

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const navigateTo = (viewName: 'home' | 'transactions' | 'profile') => {
    router.push(viewName === 'home' ? '/' : `/?view=${viewName}`)
  }

  const handleQuickAddOpenChange = (open: boolean) => {
    setShowQuickAdd(open)
    if (!open && searchParams.get('action') === 'new') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')
      router.replace(params.size > 0 ? `/?${params.toString()}` : '/')
    }
  }

  const openQuickAdd = (type: TransactionType = 'expense') => {
    setQuickAddType(type)
    setShowQuickAdd(true)
  }

  return (
    <>
      {showTermsModal && <TermsAcceptanceModal onAccept={handleAcceptTerms} />}
      {showWelcome && (
        <WelcomeModal userName={firstName} onClose={() => setShowWelcome(false)} />
      )}

      <QuickTransactionModal
        open={quickAddOpen}
        onOpenChange={handleQuickAddOpenChange}
        initialType={quickAddType}
        onAddExpense={addExpense}
        onAddIncome={addIncome}
        onAddCardBill={addCardBill}
      />

      <InvoiceSelectModal
        open={showInvoiceSelect}
        onOpenChange={setShowInvoiceSelect}
        invoices={invoices}
        cards={cards}
      />

      {error && (
        <Alert variant="destructive" className="mb-5" role="alert">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Não foi possível concluir a operação</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

        {activeNav === 'home' && (
          <HomeSummarySection
            financialSummary={financialSummary}
            totalExpenses={totalExpenses}
            totalIncomes={totalIncomes}
            currentMonthData={currentMonthData}
            pendingInvoices={summaryInvoices.filter((invoice) => !invoice.isPaid)}
            expenses={expenses}
            cardBills={cardBills}
            incomes={incomes}
            invoices={invoices}
            planningAlerts={planningAlerts}
            fmt={fmt}
            onNavigate={(tab) => {
              if (tab === 'transactions') navigateTo('transactions')
              else router.push('/invoices')
            }}
            onSetTabs={(nextTabs) => setTabs(nextTabs)}
            onOpenQuickAdd={openQuickAdd}
            onOpenInvoiceSelect={() => setShowInvoiceSelect(true)}
          />
        )}

        {activeNav === 'transactions' && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Transações</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Despesas, receitas e cartões deste mês
              </p>
            </div>

            <MainNavigation
              activeTab={tabs.main}
              onTabChange={(tab) => setTabs((prev) => ({ ...prev, main: tab }))}
            />

            <Tabs
              value={tabs.main}
              onValueChange={(value) =>
                setTabs((prev) => ({
                  ...prev,
                  main: value as 'expenses' | 'cards' | 'incomes',
                }))
              }
              className="w-full"
            >
              <TabsContent value="expenses">
                <ExpensesTabContent
                  subTab={tabs.expenseSubTab}
                  onSubTabChange={(tab) =>
                    setTabs((prev) => ({ ...prev, expenseSubTab: tab }))
                  }
                  categoryFilter={filters.expenseCategory}
                  onCategoryFilterChange={(category) =>
                    setFilters((prev) => ({ ...prev, expenseCategory: category }))
                  }
                  currentMonthExpenses={currentMonthData.expenses}
                  filteredGeneralExpenses={filteredGeneralExpenses}
                  filteredSubscriptions={filteredSubscriptions}
                  onAddExpense={addExpense}
                  onUpdateExpense={updateExpense}
                  onDeleteExpense={deleteExpense}
                />
              </TabsContent>

              <TabsContent value="cards">
                <CardsTabContent
                  categoryFilter={filters.cardBillCategory}
                  onCategoryFilterChange={(category) =>
                    setFilters((prev) => ({ ...prev, cardBillCategory: category }))
                  }
                  currentMonthCardBills={currentMonthData.cardBills}
                  filteredCardBills={filteredCardBills}
                  invoices={invoices}
                  cards={allCards}
                  onAddCardBill={addCardBill}
                  onUpdateCardBill={updateCardBill}
                  onDeleteCardBill={deleteCardBill}
                />
              </TabsContent>

              <TabsContent value="incomes">
                <IncomesTabContent
                  categoryFilter={filters.incomeCategory}
                  onCategoryFilterChange={(category) =>
                    setFilters((prev) => ({ ...prev, incomeCategory: category }))
                  }
                  currentMonthIncomes={currentMonthData.incomes}
                  filteredIncomes={filteredIncomes}
                  onAddIncome={addIncome}
                  onDeleteIncome={deleteIncome}
                  onMarkIncomeAsReceived={markIncomeAsReceived}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {activeNav === 'profile' && (
          <ProfileSection
            firstName={firstName}
            email={user.emailAddresses[0]?.emailAddress ?? ''}
            expenses={expenses}
            incomes={incomes}
            cardBills={cardBills}
            invoices={invoices}
          />
        )}
      <FloatingActionButton onClick={() => openQuickAdd('expense')} />
    </>
  )
}
