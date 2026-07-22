'use client'

import { useRouter } from 'next/navigation'
import { TrendingDown, TrendingUp, CreditCard, Receipt, ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { PlanningAlerts } from '@/features/planning'
import { CurrentBalanceCard, ProjectedBalanceCard } from '@/components/balance'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import type { DashboardTabs } from '@/features/dashboard/hooks/useDashboardData'
import type { FinancialSummary } from '@/lib/financial-calculations'

interface HomeSummarySectionProps {
  financialSummary: FinancialSummary
  totalExpenses: number
  totalIncomes: number
  currentMonthData: { expenses: Expense[]; cardBills: CardBill[]; incomes: Income[] }
  pendingInvoices: Invoice[]
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
  fmt: (v: number) => string
  onNavigate: (tab: 'transactions' | 'invoices') => void
  onSetTabs: (tabs: DashboardTabs) => void
  onOpenQuickAdd: () => void
  onOpenInvoiceSelect: () => void
  invoices: Invoice[]
}

export function HomeSummarySection({
  financialSummary,
  totalExpenses,
  totalIncomes,
  currentMonthData,
  pendingInvoices,
  expenses,
  cardBills,
  incomes,
  fmt,
  onNavigate,
  onSetTabs,
  onOpenQuickAdd,
  onOpenInvoiceSelect,
  invoices,
}: HomeSummarySectionProps) {
  const router = useRouter()

  return (
    <>
      <DashboardHeader />

      <div className="grid gap-3 mb-5 sm:grid-cols-2">
        <CurrentBalanceCard summary={financialSummary} />
        <ProjectedBalanceCard summary={financialSummary} />
      </div>

      <div className="mb-5">
        <PlanningAlerts />
      </div>

      <section className="mb-5">
        <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Adicionar
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onOpenQuickAdd}
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
            onClick={onOpenQuickAdd}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Receita
            </span>
          </button>

          <button
            onClick={() => {
              if (invoices.length === 0) {
                router.push('/invoices/new')
              } else {
                onOpenInvoiceSelect()
              }
            }}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Fatura
            </span>
          </button>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Este Mês
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('transactions')}
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
              onNavigate('transactions')
              onSetTabs({ main: 'incomes', expenseSubTab: 'general' })
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

        {pendingInvoices.length > 0 && (
          <button
            onClick={() => onNavigate('invoices')}
            className="w-full mt-3 flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-orange-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {pendingInvoices.length}{' '}
                  {pendingInvoices.length === 1 ? 'fatura pendente' : 'faturas pendentes'}
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

      {currentMonthData.expenses.length === 0 &&
        currentMonthData.incomes.length === 0 && (
          <div className="p-6 bg-muted/30 border-2 border-dashed rounded-xl text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-semibold mb-1">Nenhuma transação ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use os botões acima para registrar suas finanças
            </p>
            <Button onClick={onOpenQuickAdd} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar agora
            </Button>
          </div>
        )}

      <div className="hidden lg:grid gap-4 lg:grid-cols-2 mt-4">
        <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
        <EnhancedExportManager
          expenses={expenses}
          cardBills={cardBills}
          incomes={incomes}
        />
      </div>
    </>
  )
}
