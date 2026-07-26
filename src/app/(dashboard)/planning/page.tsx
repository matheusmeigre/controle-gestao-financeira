'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { PlanningList, PlanningSummary } from '@/features/planning'
import { Plus, Info, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PlanningPage() {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="space-y-7">
        <PageHeader
          eyebrow="Objetivos"
          title="Planejamentos"
          description="Transforme metas futuras em um plano mensal que cabe no seu momento financeiro."
          actions={
            <Button asChild>
              <Link href="/planning/new" prefetch={true}>
              <Plus className="mr-2 h-4 w-4" />
                Novo planejamento
              </Link>
            </Button>
          }
        />

        {/* Resumo/KPIs */}
        <PlanningSummary />

        {/* Alerta informativo colapsável */}
        <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/30 transition-all duration-150">
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            aria-expanded={infoOpen}
            aria-controls="planning-help"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sobre Planejamentos</span>
            </div>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                infoOpen && "rotate-180"
              )} 
            />
          </button>
          {infoOpen && (
            <div id="planning-help" className="px-4 py-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Planejamentos ajudam você a organizar objetivos financeiros futuros. 
                Você pode vincular gastos reais aos planejamentos para acompanhar o progresso automaticamente.
              </p>
            </div>
          )}
        </div>

        {/* Lista de planejamentos */}
        <PlanningList />
    </div>
  )
}
