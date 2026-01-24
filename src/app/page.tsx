'use client'

import { useUser } from '@clerk/nextjs'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import { MonthlyBalance } from '@/components/monthly-balance'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { Footer } from '@/components/footer'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PlanningAlerts } from '@/features/planning'
import {
  DashboardHeader,
  MainNavigation,
  ExpensesTabContent,
  CardsTabContent,
  IncomesTabContent,
  useDashboardData,
  useWelcomeFlow,
} from '@/features/dashboard'

export default function HomePage() {
  const { user, isLoaded } = useUser()

  // 🎯 Hook customizado para gerenciar dados do dashboard
  const {
    expenses,
    cardBills,
    incomes,
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

  // 🎉 Hook customizado para fluxo de boas-vindas
  const { showWelcome, showTermsModal, setShowWelcome, handleAcceptTerms } =
    useWelcomeFlow()

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
      {/* Modals */}
      {showTermsModal && <TermsAcceptanceModal onAccept={handleAcceptTerms} />}
      {showWelcome && (
        <WelcomeModal
          userName={
            user.firstName ||
            user.emailAddresses[0]?.emailAddress.split('@')[0] ||
            'Usuário'
          }
          onClose={() => setShowWelcome(false)}
        />
      )}

      <UserHeader />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <DashboardHeader />

        {/* Balance Summary */}
        <div className="mb-4 sm:mb-6">
          <MonthlyBalance
            incomes={currentMonthData.incomes}
            expenses={currentMonthData.expenses}
            cardBills={currentMonthData.cardBills}
          />
        </div>

        {/* Planning Alerts */}
        <div className="mb-4 sm:mb-6">
          <PlanningAlerts />
        </div>

        {/* Export Manager */}
        <div className="mb-4 sm:mb-6 grid gap-4 lg:grid-cols-2">
          <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
          <EnhancedExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
        </div>

        {/* Main Navigation */}
        <MainNavigation
          activeTab={tabs.main}
          onTabChange={(tab) => setTabs((prev) => ({ ...prev, main: tab }))}
        />

        {/* Tab Contents */}
        <Tabs
          value={tabs.main}
          onValueChange={(v) =>
            setTabs((prev) => ({ ...prev, main: v as 'expenses' | 'cards' | 'incomes' }))
          }
          className="w-full"
        >
          <TabsContent value="expenses">
            <ExpensesTabContent
              subTab={tabs.expenseSubTab}
              onSubTabChange={(tab) => setTabs((prev) => ({ ...prev, expenseSubTab: tab }))}
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
      </div>

      <Footer />
    </div>
  )
}
