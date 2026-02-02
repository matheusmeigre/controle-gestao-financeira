'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserHeader } from '@/components/user-header'
import { Button } from '@/components/ui/button'
import { PlanningList, PlanningSummary } from '@/features/planning'
import { Plus, Home, Info, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PlanningPage() {
  const router = useRouter()
  const [infoOpen, setInfoOpen] = useState(false)

  const handlePlanningClick = (planningId: string) => {
    router.push(`/planning/${planningId}`)
  }

  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-8 space-y-8 px-4">
        {/* Navegação */}
        <div className="flex items-center gap-2">
          <Link href="/" prefetch={true}>
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Planejamentos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe seus objetivos financeiros
            </p>
          </div>
          <Link href="/planning/new" prefetch={true}>
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Novo Planejamento
            </Button>
          </Link>
        </div>

        {/* Resumo/KPIs */}
        <PlanningSummary />

        {/* Alerta informativo colapsável */}
        <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/30 transition-all duration-150">
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
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
            <div className="px-4 py-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Planejamentos ajudam você a organizar objetivos financeiros futuros. 
                Você pode vincular gastos reais aos planejamentos para acompanhar o progresso automaticamente.
              </p>
            </div>
          )}
        </div>

        {/* Lista de planejamentos */}
        <PlanningList onPlanningClick={handlePlanningClick} />
      </div>
    </>
  )
}
