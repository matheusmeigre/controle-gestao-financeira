'use client'

import Link from 'next/link'
import { CreditCard, BarChart3, ArrowRight } from 'lucide-react'
import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import { FinancialReportsView } from '@/components/financial-reports-view'

interface ProfileSectionProps {
  firstName: string
  email: string
  expenses: Expense[]
  incomes: Income[]
  cardBills: CardBill[]
  invoices: Invoice[]
}

export function ProfileSection({ firstName, email, expenses, incomes, cardBills, invoices }: ProfileSectionProps) {
  return (
    <div className="py-2 space-y-6">
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">👤</span>
        </div>
        <h2 className="text-xl font-bold">{firstName}</h2>
        <p className="text-sm text-muted-foreground">
          {email}
        </p>
      </div>

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
  )
}
