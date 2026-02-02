'use client'

/**
 * HomePage - Mobile-First Refactored
 * 
 * Arquitetura Mobile-First com:
 * - Bottom Navigation fixa
 * - FAB para ações rápidas
 * - Saldo Real vs Projeção separados
 * - Conteúdo otimizado para mobile
 */

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { Footer } from '@/components/footer'
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
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import {
  DashboardHeader,
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

      {/* User Header */}
      <UserHeader />

      {/* Main Content */}
      <MobileContainer>
        {/* Home View */}
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
            
            {/* Quick Stats or Recent Transactions */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                Resumo Rápido
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="text-base font-bold text-foreground">
                    {currentMonthData.expenses.length}
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="text-base font-bold text-foreground">
                    {currentMonthData.incomes.length}
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Faturas</p>
                  <p className="text-base font-bold text-foreground">
                    {currentMonthData.cardBills.length}
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                  <p className="text-base font-bold text-orange-600">
                    {financialSummary.details.pendingExpenses > 0 || financialSummary.details.pendingIncomes > 0 ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Transactions View (Extrato) */}
        {activeNav === 'transactions' && (
          <>
            <h2 className="text-xl font-bold mb-4">Extrato</h2>
            
            {/* Tabs de Despesas, Cartões, Receitas */}
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
            
            <div className="mt-6">
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
            </div>
            
            <div className="mt-6">
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
            </div>
          </>
        )}

        {/* Reports View */}
        {activeNav === 'reports' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Relatórios</h2>
            <p className="text-muted-foreground text-sm">
              Em breve: gráficos e análises financeiras detalhadas.
            </p>
            {/* TODO: Adicionar componentes de relatórios/gráficos */}
          </div>
        )}

        {/* Profile View */}
        {activeNav === 'profile' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Perfil</h2>
            <p className="text-muted-foreground text-sm">
              Configurações e informações do usuário.
            </p>
            {/* TODO: Adicionar configurações do usuário */}
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
