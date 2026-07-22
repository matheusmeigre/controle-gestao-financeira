'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { Footer } from '@/components/footer'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  BottomNavigation,
  FloatingActionButton,
  MobileLayout,
  MobileContainer,
  DesktopNavigation,
  type NavigationTab,
} from '@/components/mobile'
import { QuickTransactionModal } from '@/components/quick-transaction-modal'
import { InvoiceSelectModal } from '@/components/invoice-select-modal'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import { useCards } from '@/features/cards/hooks/useCards'
import { InvoicesSection } from '@/components/sections/InvoicesSection'
import { ProfileSection } from '@/components/sections/ProfileSection'
import { HomeSummarySection } from '@/components/sections/HomeSummarySection'
import {
  MainNavigation,
  ExpensesTabContent,
  CardsTabContent,
  IncomesTabContent,
  useDashboardData,
  useWelcomeFlow,
} from '@/features/dashboard'

export default function HomePage() {
  const { user, isLoaded } = useUser()

  // Navigation state
  const [activeNav, setActiveNav] = useState<NavigationTab>('home')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showInvoiceSelect, setShowInvoiceSelect] = useState(false)

  // Dashboard data
  const {
    expenses,
    cardBills,
    incomes,
    invoices,
    currentMonthData,
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
  } = useDashboardData()

  // Welcome flow
  const { showWelcome, showTermsModal, setShowWelcome, handleAcceptTerms } =
    useWelcomeFlow()

  // Financial summary
  const financialSummary = useFinancialSummary({
    incomes: currentMonthData.incomes,
    expenses: currentMonthData.expenses,
    cardBills: currentMonthData.cardBills,
    invoices,
  })

  // Cards for invoices view
  const { cards } = useCards()

  // Loading state
  if (!isLoaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const firstName =
    user.firstName ||
    user.emailAddresses[0]?.emailAddress.split('@')[0] ||
    'Usuário'
  const totalExpenses = currentMonthData.expenses.reduce((s, e) => s + e.amount, 0)
  const totalIncomes = currentMonthData.incomes.reduce((s, e) => s + e.amount, 0)
  const pendingInvoices = invoices.filter((inv) => !inv.isPaid)

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <MobileLayout hasBottomNav hasFAB>
      {/* Modals */}
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
        {/* Desktop Navigation */}
        <DesktopNavigation activeTab={activeNav} onTabChange={setActiveNav} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'home' && (
          <HomeSummarySection
            financialSummary={financialSummary}
            totalExpenses={totalExpenses}
            totalIncomes={totalIncomes}
            currentMonthData={currentMonthData}
            pendingInvoices={pendingInvoices}
            expenses={expenses}
            cardBills={cardBills}
            incomes={incomes}
            invoices={invoices}
            fmt={fmt}
            onNavigate={(tab) => {
              if (tab === 'transactions') setActiveNav('transactions')
              else setActiveNav('invoices')
            }}
            onSetTabs={(t) => setTabs(t)}
            onOpenQuickAdd={() => setShowQuickAdd(true)}
            onOpenInvoiceSelect={() => setShowInvoiceSelect(true)}
          />
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 📄 TRANSAÇÕES                                     */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'transactions' && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Transações</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Despesas, receitas e cartões deste mês
              </p>
            </div>

            <MainNavigation
              activeTab={tabs.main}
              onTabChange={(tab) => setTabs((prev) => ({ ...prev, main: tab }))}
            />

            <Tabs
              value={tabs.main}
              onValueChange={(v) =>
                setTabs((prev) => ({
                  ...prev,
                  main: v as 'expenses' | 'cards' | 'incomes',
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

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'invoices' && (
          <InvoicesSection invoices={invoices} cards={cards} />
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'profile' && (
          <ProfileSection
            firstName={firstName}
            email={user?.emailAddresses[0]?.emailAddress ?? ''}
            expenses={expenses}
            incomes={incomes}
            cardBills={cardBills}
            invoices={invoices}
          />
        )}
      </MobileContainer>

      {/* Footer — desktop only */}
      <div className="hidden md:block mt-auto">
        <Footer />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeNav} onTabChange={setActiveNav} />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowQuickAdd(true)} />
    </MobileLayout>
  )
}
