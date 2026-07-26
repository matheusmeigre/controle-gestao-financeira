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
import type { PlanningAlertsData } from '@/features/dashboard/services/dashboard.service'
import type { TransactionType } from '@/components/quick-transaction-modal'

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
  planningAlerts: PlanningAlertsData
  onNavigate: (tab: 'transactions' | 'invoices') => void
  onSetTabs: (tabs: DashboardTabs) => void
  onOpenQuickAdd: (type?: TransactionType) => void
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
  planningAlerts,
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
        <PlanningAlerts alerts={planningAlerts} />
      </div>

      <section className="mb-5">
        <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Adicionar
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 transition-[border-color,background-color,transform] hover:border-destructive/30 hover:bg-destructive/5 active:scale-[0.98]"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-destructive">
              Despesa
            </span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('income')}
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 transition-[border-color,background-color,transform] hover:border-success/30 hover:bg-success/5 active:scale-[0.98]"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-success">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-success">
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
            className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 transition-[border-color,background-color,transform] hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-primary">
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
            className="rounded-xl border bg-card p-4 text-left shadow-sm transition-[border-color,transform] hover:border-primary/40 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Gastos</span>
            </div>
            <p className="font-mono text-xl font-bold tabular-nums">{fmt(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthData.expenses.length} lançamentos
            </p>
          </button>

          <button
            onClick={() => {
              onNavigate('transactions')
              onSetTabs({ main: 'incomes', expenseSubTab: 'general' })
            }}
            className="rounded-xl border bg-card p-4 text-left shadow-sm transition-[border-color,transform] hover:border-primary/40 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <p className="font-mono text-xl font-bold tabular-nums">{fmt(totalIncomes)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthData.incomes.length} lançamentos
            </p>
          </button>
        </div>

        {pendingInvoices.length > 0 && (
          <button
            onClick={() => onNavigate('invoices')}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-warning/25 bg-warning/8 p-4 transition-colors hover:bg-warning/12 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-warning" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {pendingInvoices.length}{' '}
                  {pendingInvoices.length === 1 ? 'fatura pendente' : 'faturas pendentes'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toque para ver e pagar
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-warning" />
          </button>
        )}
      </section>

      {currentMonthData.expenses.length === 0 &&
        currentMonthData.incomes.length === 0 && (
          <div className="p-6 bg-muted/30 border-2 border-dashed rounded-xl text-center">
            <Receipt className="mx-auto mb-3 size-9 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-base font-semibold mb-1">Nenhuma transação ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use os botões acima para registrar suas finanças
            </p>
            <Button onClick={() => onOpenQuickAdd('expense')} size="sm">
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
