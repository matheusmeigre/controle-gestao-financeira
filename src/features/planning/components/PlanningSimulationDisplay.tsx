'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlanningSimulation } from '../types'
import { 
  Calculator, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react'

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

  return (
    <Card className="p-6 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulação Financeira
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Cálculos em tempo real
            </p>
          </div>
          
          {simulation.isViable ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Viável
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <XCircle className="w-3 h-3 mr-1" />
              Inviável
            </Badge>
          )}
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Valor Mensal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calculator className="w-4 h-4" />
              <span>Valor Mensal Necessário</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(simulation.monthlyRequired)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Para economizar {formatCurrency(remaining)}
            </p>
          </div>

          {/* Tempo Estimado */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span>Tempo Estimado</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {simulation.monthsToComplete === 999 
                ? '\u221E' 
                : `${simulation.monthsToComplete} ${simulation.monthsToComplete === 1 ? 'mês' : 'meses'}`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {simulation.monthsToComplete > 12 
                ? `Aproximadamente ${Math.round(simulation.monthsToComplete / 12)} ${Math.round(simulation.monthsToComplete / 12) === 1 ? 'ano' : 'anos'}`
                : 'Prazo curto'
              }
            </p>
          </div>

          {/* Impacto na Renda */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Impacto na Renda</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {simulation.incomePercentage.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {simulation.freeIncomePercentage.toFixed(0)}% da renda livre
            </p>
          </div>
        </div>

        {/* Barra de Comprometimento */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-purple-900 dark:text-purple-100">
            <span>Comprometimento da Renda Livre</span>
            <span>{simulation.freeIncomePercentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`h-full transition-all flex items-center justify-center text-xs text-white font-medium ${
                simulation.freeIncomePercentage > 80
                  ? 'bg-red-500'
                  : simulation.freeIncomePercentage > 60
                  ? 'bg-orange-500'
                  : simulation.freeIncomePercentage > 40
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(simulation.freeIncomePercentage, 100)}%` }}
            >
              {simulation.freeIncomePercentage > 10 && (
                <span>{simulation.freeIncomePercentage.toFixed(0)}%</span>
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-purple-700 dark:text-purple-300">
            <span>0-40%: Saudável</span>
            <span>40-60%: Moderado</span>
            <span>60-80%: Alto</span>
            <span>+80%: Crítico</span>
          </div>
        </div>

        {/* Alerta de Inviabilidade */}
        {!simulation.isViable && simulation.viabilityReason && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Planejamento Inviável
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {simulation.viabilityReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comparações */}
        {simulation.comparisons && (
          <div className="space-y-3 pt-3 border-t border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              Comparações
            </h4>

            {/* À Vista vs Parcelado */}
            {simulation.comparisons.cashVsInstallments && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">À Vista vs Parcelado</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">À Vista</p>
                    <p className="font-semibold">{formatCurrency(simulation.comparisons.cashVsInstallments.cashTotal)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parcelado</p>
                    <p className="font-semibold">{formatCurrency(simulation.comparisons.cashVsInstallments.installmentsTotal)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 bg-purple-50 dark:bg-purple-900/30 rounded p-2">
                  {simulation.comparisons.cashVsInstallments.recommendation}
                </p>
              </div>
            )}

            {/* Esperar vs Agora */}
            {simulation.comparisons.waitVsNow && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Esperar vs Comprar Agora</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Impacto Agora</p>
                    <p className="font-semibold">{simulation.comparisons.waitVsNow.impactNow.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impacto Depois</p>
                    <p className="font-semibold">{simulation.comparisons.waitVsNow.impactLater.toFixed(0)}%</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 bg-purple-50 dark:bg-purple-900/30 rounded p-2">
                  {simulation.comparisons.waitVsNow.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
