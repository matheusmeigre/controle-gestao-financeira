'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { Footer } from '@/components/footer'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { PlanningAlerts } from '@/features/planning'
import { 
  BottomNavigation, 
  FloatingActionButton,
  MobileLayout,
  MobileContainer,
  type NavigationTab 
} from '@/components/mobile'
import { CurrentBalanceCard, ProjectedBalanceCard } from '@/components/balance'
import { QuickTransactionModal } from '@/components/quick-transaction-modal'
import { FinancialReportsView } from '@/components/financial-reports-view'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
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
  
  // Navigation state
  const [activeNav, setActiveNav] = useState<NavigationTab>('home')
  const [showQuickAdd, setShowQuickAdd] = useState(false)

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
  
  // 💰 Cálculo financeiro correto (Regime de Caixa vs Competência)
  const financialSummary = useFinancialSummary({
    incomes: currentMonthData.incomes,
    expenses: currentMonthData.expenses,
    cardBills: currentMonthData.cardBills,
  })

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
    <MobileLayout hasBottomNav hasFAB>
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
      
      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onAddExpense={addExpense}
        onAddIncome={addIncome}
        onAddCardBill={addCardBill}
      />

      <UserHeader />

      <MobileContainer>
        {/* 🏠 HOME VIEW */}
        {activeNav === 'home' && (
          <>
            <DashboardHeader />

            {/* Balance Cards - Mobile First Layout */}
            <div className="grid gap-3 mb-4 sm:gap-4 sm:mb-6 md:grid-cols-2">
              <CurrentBalanceCard summary={financialSummary} />
              <ProjectedBalanceCard summary={financialSummary} />
            </div>

            {/* Planning Alerts */}
            <div className="mb-4 sm:mb-6">
              <PlanningAlerts />
            </div>

            {/* Quick Stats */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                📊 Resumo Rápido
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button 
                  onClick={() => {
                    setActiveNav('transactions')
                    setTabs(prev => ({ ...prev, main: 'expenses' }))
                  }}
                  className="bg-card border rounded-lg p-3 hover:border-primary/50 transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                  <p className="text-lg font-bold text-foreground">
                    {currentMonthData.expenses.length}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Este mês
                  </p>
                </button>
                <button 
                  onClick={() => {
                    setActiveNav('transactions')
                    setTabs(prev => ({ ...prev, main: 'incomes' }))
                  }}
                  className="bg-card border rounded-lg p-3 hover:border-primary/50 transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                  <p className="text-lg font-bold text-foreground">
                    {currentMonthData.incomes.length}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Este mês
                  </p>
                </button>
                <button 
                  onClick={() => {
                    setActiveNav('transactions')
                    setTabs(prev => ({ ...prev, main: 'cards' }))
                  }}
                  className="bg-card border rounded-lg p-3 hover:border-primary/50 transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-muted-foreground mb-1">Faturas</p>
                  <p className="text-lg font-bold text-foreground">
                    {currentMonthData.cardBills.length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    Cartões
                  </p>
                </button>
                <button 
                  onClick={() => {
                    setActiveNav('transactions')
                  }}
                  className="bg-card border rounded-lg p-3 hover:border-primary/50 transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-500">
                    {financialSummary.details.pendingExpenses > 0 || financialSummary.details.pendingIncomes > 0 ? '⚠' : '✓'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {financialSummary.details.pendingExpenses > 0 || financialSummary.details.pendingIncomes > 0 ? 'Atenção' : 'Ok'}
                  </p>
                </button>
              </div>
            </div>

            {/* Export Manager - Desktop Only */}
            <div className="hidden lg:grid gap-4 lg:grid-cols-2 mb-4 sm:mb-6">
              <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
              <EnhancedExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
            </div>

            {/* Call to Action - Empty State */}
            {currentMonthData.expenses.length === 0 && 
             currentMonthData.incomes.length === 0 && 
             currentMonthData.cardBills.length === 0 && (
              <div className="mt-6 p-6 bg-card border-2 border-dashed rounded-lg text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma transação ainda</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece registrando sua primeira despesa ou receita
                </p>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <span className="text-lg">+</span>
                  <span>Adicionar Transação</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* 📄 TRANSACTIONS VIEW (Extrato) */}
        {activeNav === 'transactions' && (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-foreground">📄 Extrato Completo</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as suas transações do mês
              </p>
            </div>

            {/* Main Navigation Tabs */}
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
          </>
        )}

        {/* 📊 REPORTS VIEW */}
        {activeNav === 'reports' && (
          <FinancialReportsView
            expenses={expenses}
            incomes={incomes}
            cardBills={cardBills}
          />
        )}

        {/* 👤 PROFILE VIEW */}
        {activeNav === 'profile' && (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {user?.firstName || 'Usuário'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>

            <div className="space-y-2">
              <button className="w-full p-4 bg-card border rounded-lg text-left hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <span className="font-medium">Configurações</span>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </div>
              </button>

              <button className="w-full p-4 bg-card border rounded-lg text-left hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎨</span>
                    <span className="font-medium">Aparência</span>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </div>
              </button>

              <button className="w-full p-4 bg-card border rounded-lg text-left hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">ℹ️</span>
                    <span className="font-medium">Sobre o App</span>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </div>
              </button>

              <button className="w-full p-4 bg-card border border-red-200 dark:border-red-800 rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <span className="font-medium text-red-600 dark:text-red-500">Sair da Conta</span>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              <p>Controle de Gastos v2.0</p>
              <p className="mt-1">Desenvolvido com ❤️</p>
            </div>
          </div>
        )}
      </MobileContainer>

      {/* Footer - Only visible on desktop */}
      <div className="hidden md:block mt-auto">
        <Footer />
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation activeTab={activeNav} onTabChange={setActiveNav} />
      
      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowQuickAdd(true)} />
    </MobileLayout>
  )
}
