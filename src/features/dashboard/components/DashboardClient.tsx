'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Footer } from '@/components/footer'
import { InvoiceSelectModal } from '@/components/invoice-select-modal'
import { QuickTransactionModal } from '@/components/quick-transaction-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import {
  BottomNavigation,
  DesktopNavigation,
  FloatingActionButton,
  MobileContainer,
  MobileLayout,
  type NavigationTab,
} from '@/components/mobile'
import { InvoicesSection } from '@/components/sections/InvoicesSection'
import { HomeSummarySection } from '@/components/sections/HomeSummarySection'
import { ProfileSection } from '@/components/sections/ProfileSection'
import { Tabs, TabsContent } from '@/components/ui/tabs'
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
  const [activeNav, setActiveNav] = useState<NavigationTab>('home')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showInvoiceSelect, setShowInvoiceSelect] = useState(false)

  const {
    expenses,
    cardBills,
    incomes,
    invoices,
    cards,
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
    addExpense,
    updateExpense,
    deleteExpense,
    addCardBill,
    updateCardBill,
    deleteCardBill,
    addIncome,
    deleteIncome,
    markIncomeAsReceived,
    updateInvoice,
    deleteInvoice,
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
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

  return (
    <MobileLayout hasBottomNav hasFAB>
      {showTermsModal && <TermsAcceptanceModal onAccept={handleAcceptTerms} />}
      {showWelcome && (
        <WelcomeModal userName={firstName} onClose={() => setShowWelcome(false)} />
      )}

      <QuickTransactionModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
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

      <UserHeader />

      <MobileContainer>
        <DesktopNavigation activeTab={activeNav} onTabChange={setActiveNav} />

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
              if (tab === 'transactions') setActiveNav('transactions')
              else setActiveNav('invoices')
            }}
            onSetTabs={(nextTabs) => setTabs(nextTabs)}
            onOpenQuickAdd={() => setShowQuickAdd(true)}
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

        {activeNav === 'invoices' && (
          <InvoicesSection
            invoices={invoices}
            cards={cards}
            onUpdateInvoice={updateInvoice}
            onDeleteInvoice={deleteInvoice}
          />
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
      </MobileContainer>

      <div className="mt-auto hidden md:block">
        <Footer />
      </div>

      <BottomNavigation activeTab={activeNav} onTabChange={setActiveNav} />
      <FloatingActionButton onClick={() => setShowQuickAdd(true)} />
    </MobileLayout>
  )
}
