'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDelayedPlannings, useOverBudgetPlannings } from '../hooks/use-plannings'
import { AlertTriangle, Calendar, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function PlanningAlerts() {
  const { plannings: delayedPlannings, loading: loadingDelayed } = useDelayedPlannings()
  const { plannings: overBudgetPlannings, loading: loadingOverBudget } = useOverBudgetPlannings()

  const loading = loadingDelayed || loadingOverBudget

  if (loading) {
    return null
  }

  const hasAlerts = delayedPlannings.length > 0 || overBudgetPlannings.length > 0

  if (!hasAlerts) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Card className="p-4 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Alertas de Planejamento
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Alguns planejamentos precisam de atenção
            </p>
          </div>

          {/* Planejamentos Atrasados */}
          {delayedPlannings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-200">
                <Calendar className="w-4 h-4" />
                <span>{delayedPlannings.length} planejamento(s) atrasado(s)</span>
              </div>
              <div className="space-y-1">
                {delayedPlannings.slice(0, 3).map((planning) => (
                  <div
                    key={planning.id}
                    className="text-sm text-orange-700 dark:text-orange-300 flex items-center justify-between"
                  >
                    <span>• {planning.name}</span>
                    <span className="text-xs">
                      Faltam {formatCurrency(planning.targetAmount - planning.currentAmount)}
                    </span>
                  </div>
                ))}
                {delayedPlannings.length > 3 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    + {delayedPlannings.length - 3} outros
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Planejamentos com Orçamento Estourado */}
          {overBudgetPlannings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-200">
                <DollarSign className="w-4 h-4" />
                <span>{overBudgetPlannings.length} planejamento(s) com orçamento estourado</span>
              </div>
              <div className="space-y-1">
                {overBudgetPlannings.slice(0, 3).map((planning) => (
                  <div
                    key={planning.id}
                    className="text-sm text-red-700 dark:text-red-300 flex items-center justify-between"
                  >
                    <span>• {planning.name}</span>
                    <span className="text-xs">
                      +{formatCurrency(planning.currentAmount - planning.targetAmount)}
                    </span>
                  </div>
                ))}
                {overBudgetPlannings.length > 3 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    + {overBudgetPlannings.length - 3} outros
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botão para ir aos planejamentos */}
          <Link href="/planning">
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              Ver Planejamentos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
