'use client'

import Link from 'next/link'
import { CreditCard, BarChart3, ArrowRight, Target, FileDown, CircleUserRound } from 'lucide-react'
import type { Expense, CardBill, Income } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import { ExportManager } from '@/components/export-manager'
import { EnhancedExportManager } from '@/components/enhanced-export-manager'
import { FinancialReportsView } from '@/components/financial-reports-view'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

interface ProfileSectionProps {
  firstName: string
  email: string
  expenses: Expense[]
  incomes: Income[]
  cardBills: CardBill[]
  invoices: Invoice[]
}

export function ProfileSection({ firstName, email, expenses, incomes, cardBills, invoices }: ProfileSectionProps) {
  const initial = firstName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Conta e dados"
        title="Relatórios e preferências"
        description="Consulte sua evolução financeira, exporte seus dados e acesse as configurações da conta."
      />

      <Card>
        <CardContent className="flex items-center gap-4 py-1">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{firstName}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
          <CircleUserRound className="hidden size-5 text-muted-foreground sm:block" aria-hidden="true" />
        </CardContent>
      </Card>

      <section aria-labelledby="shortcuts-title">
        <h2 id="shortcuts-title" className="mb-3 text-sm font-semibold">Atalhos de gestão</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/cards" className="group flex min-h-20 items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/35 hover:bg-accent/50">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Meus cartões</span>
              <span className="block text-xs text-muted-foreground">Limites e vencimentos</span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/planning" className="group flex min-h-20 items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/35 hover:bg-accent/50">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Planejamentos</span>
              <span className="block text-xs text-muted-foreground">Metas e progresso</span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="reports-title">
        <h2 id="reports-title" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="w-4 h-4" />
          Visão financeira
        </h2>
        <FinancialReportsView
          expenses={expenses}
          incomes={incomes}
          cardBills={cardBills}
          invoices={invoices}
        />
      </section>

      <section aria-labelledby="exports-title">
        <h2 id="exports-title" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileDown className="size-4" aria-hidden="true" />
          Exportar dados
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <ExportManager expenses={expenses} cardBills={cardBills} incomes={incomes} />
          <EnhancedExportManager
            expenses={expenses}
            cardBills={cardBills}
            incomes={incomes}
          />
        </div>
      </section>

      <div className="pb-4 text-center text-xs text-muted-foreground">
        <p>Minha Gestão Financeira v2.0</p>
      </div>
    </div>
  )
}
