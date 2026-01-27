'use client'

import { Badge } from '@/components/ui/badge'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { PlanningSimulation } from '../types'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface PlanningSimulationDisplayProps {
  simulation: PlanningSimulation
  targetAmount: number
  currentAmount: number
}

export function PlanningSimulationDisplay({ 
  simulation, 
  targetAmount,
  currentAmount 
}: PlanningSimulationDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const remaining = targetAmount - currentAmount

  // Determinar status de viabilidade
  const viabilityConfig = simulation.isViable
    ? { icon: CheckCircle, label: 'Viável', className: 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400' }
    : { icon: XCircle, label: 'Atenção', className: 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400' }

  const ViabilityIcon = viabilityConfig.icon

  return (
    <div className="bg-muted/50 rounded-lg p-6 space-y-6 transition-all duration-300">
      {/* Indicador Principal de Viabilidade */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full border-2 ${viabilityConfig.className}`}>
          <ViabilityIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{viabilityConfig.label}</p>
          <p className="text-sm text-muted-foreground">
            {simulation.isViable 
              ? `Você consegue economizar em ${simulation.monthsToComplete === 999 ? 'prazo estendido' : `${simulation.monthsToComplete} ${simulation.monthsToComplete === 1 ? 'mês' : 'meses'}`}`
              : 'Ajuste o valor ou prazo para continuar'
            }
          </p>
        </div>
      </div>

      {/* Métrica Focal: Valor Mensal */}
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor Mensal Necessário</span>
        <p className="text-5xl font-medium font-mono">
          <AnimatedNumber 
            value={simulation.monthlyRequired} 
            formatFn={formatCurrency}
          />
        </p>
        <p className="text-sm text-muted-foreground">
          Para economizar {formatCurrency(remaining)}
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tempo estimado</span>
          <p className="text-xl font-medium">
            {simulation.monthsToComplete === 999 ? (
              '∞'
            ) : (
              <>
                <AnimatedNumber value={simulation.monthsToComplete} /> {simulation.monthsToComplete === 1 ? 'mês' : 'meses'}
              </>
            )}
          </p>
          {simulation.monthsToComplete > 12 && simulation.monthsToComplete < 999 && (
            <p className="text-xs text-muted-foreground">
              ~{Math.round(simulation.monthsToComplete / 12)} {Math.round(simulation.monthsToComplete / 12) === 1 ? 'ano' : 'anos'}
            </p>
          )}
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Impacto na renda</span>
          <p className="text-xl font-medium font-mono">
            <AnimatedNumber value={simulation.incomePercentage} formatFn={(v) => `${v.toFixed(0)}%`} />
          </p>
          <p className="text-xs text-muted-foreground">
            <AnimatedNumber value={simulation.freeIncomePercentage} formatFn={(v) => `${v.toFixed(0)}%`} /> da renda livre
          </p>
        </div>
      </div>

      {/* Barra de Comprometimento Simplificada */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Comprometimento da renda livre</span>
          <span className="font-medium font-mono">{simulation.freeIncomePercentage.toFixed(0)}%</span>
        </div>

        <div className="w-full h-3 bg-muted rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-800 ease-out ${
              simulation.freeIncomePercentage > 80
                ? 'bg-red-500'
                : simulation.freeIncomePercentage > 60
                ? 'bg-orange-500'
                : simulation.freeIncomePercentage > 40
                ? 'bg-yellow-500'
                : 'bg-foreground/60'
            }`}
            style={{ width: `${Math.min(simulation.freeIncomePercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0-40% Saudável</span>
          <span>40-60% Moderado</span>
          <span>60-80% Alto</span>
          <span className="text-right">+80% Crítico</span>
        </div>
      </div>

      {/* Alerta de Inviabilidade */}
      {!simulation.isViable && simulation.viabilityReason && (
        <div className="flex items-start gap-3 p-4 bg-background border-l-4 border-red-500 rounded">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">{simulation.viabilityReason}</p>
        </div>
      )}
    </div>
  )
}
