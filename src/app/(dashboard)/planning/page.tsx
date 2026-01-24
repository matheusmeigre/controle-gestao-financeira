'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserHeader } from '@/components/user-header'
import { Button } from '@/components/ui/button'
import { PlanningList, PlanningSummary } from '@/features/planning'
import { Plus, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PlanningPage() {
  const router = useRouter()

  const handlePlanningClick = (planningId: string) => {
    router.push(`/planning/${planningId}`)
  }

  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-8 space-y-6">
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
            <h1 className="text-3xl font-bold">Planejamento Financeiro</h1>
            <p className="text-muted-foreground">
              Defina objetivos e acompanhe seu progresso
            </p>
          </div>
          <Link href="/planning/new" prefetch={true}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Planejamento
            </Button>
          </Link>
        </div>

        {/* Resumo */}
        <PlanningSummary />

        {/* Alerta informativo */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Sobre Planejamentos
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Planejamentos ajudam você a organizar objetivos financeiros futuros. 
                Você pode vincular gastos reais aos planejamentos para acompanhar o progresso automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de planejamentos */}
        <PlanningList onPlanningClick={handlePlanningClick} />
      </div>
    </>
  )
}
