'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FinancialContext } from '../types'
import { TrendingDown, ArrowRight } from 'lucide-react'

interface BudgetImpactDisplayProps {
  currentContext: FinancialContext
  monthlyRequired: number
  planningName: string
}

export function BudgetImpactDisplay({ 
  currentContext, 
  monthlyRequired,
  planningName 
}: BudgetImpactDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const calculatePercentage = (value: number, total: number): number => {
    if (!total || total === 0 || !isFinite(value / total)) {
      return 0
    }
    return (value / total) * 100
  }

  // Cenário Atual
  const currentFreeIncome = currentContext.freeIncome
  const currentCommitment = currentContext.monthlyIncome - currentFreeIncome
  const currentCommitmentPercentage = calculatePercentage(currentCommitment, currentContext.monthlyIncome)

  // Cenário Futuro (com novo planejamento)
  const futureCommitment = currentCommitment + monthlyRequired
  const futureFreeIncome = currentContext.monthlyIncome - futureCommitment
  const futureCommitmentPercentage = calculatePercentage(futureCommitment, currentContext.monthlyIncome)

  // Diferenças
  const impactAmount = monthlyRequired
  const impactPercentage = futureCommitmentPercentage - currentCommitmentPercentage
  const freeIncomeReduction = calculatePercentage(currentFreeIncome - futureFreeIncome, currentFreeIncome)

  // Status de Saúde Financeira
  const getCurrentHealthStatus = () => {
    if (currentCommitmentPercentage < 50) return { label: 'Excelente', color: 'green' }
    if (currentCommitmentPercentage < 70) return { label: 'Boa', color: 'blue' }
    if (currentCommitmentPercentage < 85) return { label: 'Regular', color: 'yellow' }
    return { label: 'Crítica', color: 'red' }
  }

  const getFutureHealthStatus = () => {
    if (futureCommitmentPercentage < 50) return { label: 'Excelente', color: 'green' }
    if (futureCommitmentPercentage < 70) return { label: 'Boa', color: 'blue' }
    if (futureCommitmentPercentage < 85) return { label: 'Regular', color: 'yellow' }
    return { label: 'Crítica', color: 'red' }
  }

  const currentHealth = getCurrentHealthStatus()
  const futureHealth = getFutureHealthStatus()

  return (
    <Card className="p-6 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Impacto no Orçamento
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Como "{planningName}" afetará suas finanças
          </p>
        </div>

        {/* Comparação Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Cenário Atual */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Hoje</span>
              <Badge className={`bg-${currentHealth.color}-100 text-${currentHealth.color}-800 dark:bg-${currentHealth.color}-900 dark:text-${currentHealth.color}-200`}>
                {currentHealth.label}
              </Badge>
            </div>

            {/* Barra Atual */}
            <div className="space-y-1">
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                {currentCommitmentPercentage > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${Math.max(currentCommitmentPercentage, 8)}%` }}
                  >
                    {currentCommitmentPercentage >= 15 && `${currentCommitmentPercentage.toFixed(0)}%`}
                  </div>
                )}
                {currentCommitmentPercentage < 15 && currentCommitmentPercentage > 0 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {currentCommitmentPercentage.toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Comprometido: {formatCurrency(currentCommitment)}</p>
                <p>Livre: {formatCurrency(currentFreeIncome)}</p>
              </div>
            </div>
          </div>

          {/* Seta de Transição */}
          <div className="flex justify-center">
            <ArrowRight className="w-8 h-8 text-blue-500" />
          </div>

          {/* Cenário Futuro */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Com Planejamento</span>
              <Badge className={`bg-${futureHealth.color}-100 text-${futureHealth.color}-800 dark:bg-${futureHealth.color}-900 dark:text-${futureHealth.color}-200`}>
                {futureHealth.label}
              </Badge>
            </div>

            {/* Barra Futura */}
            <div className="space-y-1">
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                {futureCommitmentPercentage > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${Math.max(futureCommitmentPercentage, 8)}%` }}
                  >
                    {futureCommitmentPercentage >= 15 && `${futureCommitmentPercentage.toFixed(0)}%`}
                  </div>
                )}
                {futureCommitmentPercentage < 15 && futureCommitmentPercentage > 0 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {futureCommitmentPercentage.toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Comprometido: {formatCurrency(futureCommitment)}</p>
                <p>Livre: {formatCurrency(futureFreeIncome)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Impacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Valor Mensal</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(impactAmount)}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              +{impactPercentage.toFixed(1)}% da renda
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Redução Renda Livre</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              -{freeIncomeReduction.toFixed(0)}%
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {formatCurrency(futureFreeIncome)} restantes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Planejamentos Ativos</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {currentContext.activePlanningsCount} → {currentContext.activePlanningsCount + 1}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Mais 1 compromisso
            </p>
          </div>
        </div>

        {/* Alerta de Mudança de Status */}
        {currentHealth.label !== futureHealth.label && (
          <div className={`rounded-lg p-3 ${
            futureHealth.color === 'red' || futureHealth.color === 'yellow'
              ? 'bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800'
              : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
          }`}>
            <p className="text-sm font-medium">
              Mudança de Status: {currentHealth.label} → {futureHealth.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {futureHealth.color === 'red'
                ? 'Sua saúde financeira ficará crítica. Considere ajustar o valor ou prazo.'
                : futureHealth.color === 'yellow'
                ? 'Sua margem de manobra ficará reduzida. Tenha cautela com novas despesas.'
                : 'Ainda manterá boa saúde financeira, mas com menos flexibilidade.'}
            </p>
          </div>
        )}

        {/* Dica Contextual */}
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Dica:</strong> {
              futureFreeIncome < currentContext.monthlyIncome * 0.2
                ? 'Com menos de 20% de renda livre, você terá pouca margem para imprevistos. Considere reduzir o valor ou estender o prazo.'
                : futureFreeIncome < currentContext.monthlyIncome * 0.3
                ? 'Mantenha pelo menos 20% da renda livre para emergências. Você está no limite seguro.'
                : 'Você ainda terá boa margem de segurança mesmo com este planejamento.'
            }
          </p>
        </div>
      </div>
    </Card>
  )
}
