'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import { UserHeader } from '@/components/user-header'
import { WelcomeModal } from '@/components/welcome-modal'
import { TermsAcceptanceModal } from '@/components/terms-acceptance-modal'
import { Footer } from '@/components/footer'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PlanningAlerts } from '@/features/planning'
import {
  BottomNavigation,
  FloatingActionButton,
  MobileLayout,
  MobileContainer,
  DesktopNavigation,
  type NavigationTab,
} from '@/components/mobile'
import { CurrentBalanceCard, ProjectedBalanceCard } from '@/components/balance'
import { QuickTransactionModal } from '@/components/quick-transaction-modal'
import { FinancialReportsView } from '@/components/financial-reports-view'
import { useFinancialSummary } from '@/hooks/use-financial-summary'
import { InvoicesList } from '@/features/invoices'
import { useCards } from '@/features/cards/hooks/useCards'
import {
  DashboardHeader,
  MainNavigation,
  ExpensesTabContent,
  CardsTabContent,
  IncomesTabContent,
  useDashboardData,
  useWelcomeFlow,
} from '@/features/dashboard'
import {
  TrendingDown,
  TrendingUp,
  Receipt,
  Plus,
  CreditCard,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoaded } = useUser()

  // Navigation state
  const [activeNav, setActiveNav] = useState<NavigationTab>('home')
  const [showQuickAdd, setShowQuickAdd] = useState(false)

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

      <UserHeader />

      <MobileContainer>
        {/* Desktop Navigation */}
        <DesktopNavigation activeTab={activeNav} onTabChange={setActiveNav} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 🏠 HOME                                           */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'home' && (
          <>
            <DashboardHeader />

            {/* Balance Cards */}
            <div className="grid gap-3 mb-5 sm:grid-cols-2">
              <CurrentBalanceCard summary={financialSummary} />
              <ProjectedBalanceCard summary={financialSummary} />
            </div>

            {/* Planning Alerts */}
            <div className="mb-5">
              <PlanningAlerts />
            </div>

            {/* ─── Adicionar ─── */}
            <section className="mb-5">
              <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Adicionar
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                    Despesa
                  </span>
                </button>

                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    Receita
                  </span>
                </button>

                <Link
                  href="/invoices/new"
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    Fatura
                  </span>
                </Link>
              </div>
            </section>

            {/* ─── Resumo do Mês ─── */}
            <section className="mb-5">
              <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Este Mês
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveNav('transactions')}
                  className="bg-card border rounded-xl p-4 text-left hover:border-primary/50 transition-colors active:scale-95"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-muted-foreground">Gastos</span>
                  </div>
                  <p className="text-xl font-bold">{fmt(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMonthData.expenses.length} lançamentos
                  </p>
                </button>

                <button
                  onClick={() => {
                    setActiveNav('transactions')
                    setTabs((prev) => ({ ...prev, main: 'incomes' }))
                  }}
                  className="bg-card border rounded-xl p-4 text-left hover:border-primary/50 transition-colors active:scale-95"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Receitas</span>
                  </div>
                  <p className="text-xl font-bold">{fmt(totalIncomes)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentMonthData.incomes.length} lançamentos
                  </p>
                </button>
              </div>

              {/* Faturas pendentes */}
              {pendingInvoices.length > 0 && (
                <button
                  onClick={() => setActiveNav('invoices')}
                  className="w-full mt-3 flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-orange-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                        {pendingInvoices.length}{' '}
                        {pendingInvoices.length === 1
                          ? 'fatura pendente'
                          : 'faturas pendentes'}
                      </p>
                      <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
                        Toque para ver e pagar
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </button>
              )}
            </section>

            {/* Empty state */}
            {currentMonthData.expenses.length === 0 &&
              currentMonthData.incomes.length === 0 && (
                <div className="p-6 bg-muted/30 border-2 border-dashed rounded-xl text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-base font-semibold mb-1">Nenhuma transação ainda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use os botões acima para registrar suas finanças
                  </p>
                  <Button onClick={() => setShowQuickAdd(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar agora
                  </Button>
                </div>
              )}

            {/* Export — desktop only */}
            <div className="hidden lg:grid gap-4 lg:grid-cols-2 mt-4">
              <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
              <EnhancedExportManager
                expenses={expenses}
                cardBills={cardBills}
                incomes={incomes}
              />
            </div>
          </>
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
        {/* 💳 FATURAS                                        */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'invoices' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Faturas</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Faturas dos seus cartões de crédito
                </p>
              </div>
              <Link href="/invoices/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Fatura
                </Button>
              </Link>
            </div>

            {cards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Cadastre seus cartões de crédito para começar a gerenciar suas faturas
                </p>
                <Link href="/cards/new">
                  <Button>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cadastrar Cartão
                  </Button>
                </Link>
              </div>
            )}

            {cards.length > 0 && invoices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma fatura ainda</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  Crie sua primeira fatura para controlar os gastos do cartão
                </p>
                <Link href="/invoices/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Fatura
                  </Button>
                </Link>
              </div>
            )}

            {invoices.length > 0 && (
              <>
                <InvoicesList
                  invoices={invoices}
                  cards={cards}
                  onUpdateInvoice={async () => {
                    // Reload happens via navigation to /invoices
                  }}
                />
                <div className="mt-4 flex justify-center">
                  <Link href="/invoices">
                    <Button variant="outline" size="sm">
                      Gerenciar todas as faturas
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 👤 PERFIL                                         */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeNav === 'profile' && (
          <div className="py-2 space-y-6">
            {/* User info */}
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-xl font-bold">{firstName}</h2>
              <p className="text-sm text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>

            {/* Relatórios */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Relatórios
              </h3>
              <FinancialReportsView
                expenses={expenses}
                incomes={incomes}
                cardBills={cardBills}
                invoices={invoices}
              />
            </section>

            {/* Exportar */}
            <section className="lg:hidden">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Exportar Dados
              </h3>
              <div className="space-y-3">
                <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
                <EnhancedExportManager
                  expenses={expenses}
                  cardBills={cardBills}
                  incomes={incomes}
                />
              </div>
            </section>

            {/* Links */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Navegação Rápida
              </h3>
              <div className="space-y-2">
                <Link href="/cards">
                  <button className="w-full p-4 bg-card border rounded-xl text-left hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Meus Cartões</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                </Link>
                <Link href="/planning">
                  <button className="w-full p-4 bg-card border rounded-xl text-left hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎯</span>
                        <span className="font-medium">Planejamento Financeiro</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                </Link>
              </div>
            </section>

            <div className="text-center text-xs text-muted-foreground pt-2 pb-8">
              <p>Controle de Gastos v2.0</p>
            </div>
          </div>
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
