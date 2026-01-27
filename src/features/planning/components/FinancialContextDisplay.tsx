'use client'

import type { FinancialContext } from '../types'

interface FinancialContextDisplayProps {
  context: FinancialContext
}

export function FinancialContextDisplay({ context }: FinancialContextDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const calculatePercentage = (value: number, total: number): string => {
    if (!total || total === 0 || !isFinite(value / total)) {
      return '0'
    }
    return ((value / total) * 100).toFixed(0) + '%'
  }

  return (
    <div className="border-l-2 border-border bg-muted/30 rounded-lg p-6 space-y-6 transition-all duration-300">
      {/* Métrica Principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Renda Livre</span>
          {context.riskLevel !== 'low' && (
            <span className={`text-xs font-medium ${
              context.riskLevel === 'critical' ? 'text-red-600 dark:text-red-400' :
              context.riskLevel === 'high' ? 'text-orange-600 dark:text-orange-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`}>
              Margem {context.riskLevel === 'critical' ? 'crítica' : context.riskLevel === 'high' ? 'reduzida' : 'moderada'}
            </span>
          )}
        </div>
        <p className="text-3xl font-medium font-mono">{formatCurrency(context.freeIncome)}</p>
        <p className="text-sm text-muted-foreground">
          {calculatePercentage(context.freeIncome, context.monthlyIncome)} da renda total
        </p>
      </div>

      {/* Barra de Distribuição Minimalista */}
      <div className="space-y-3">
        <span className="text-xs text-muted-foreground">Distribuição</span>

        <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-foreground/70 transition-all duration-800 ease-out"
            style={{ width: `${calculatePercentage(context.monthlyFixedExpenses, context.monthlyIncome)}` }}
            title={`Fixos: ${formatCurrency(context.monthlyFixedExpenses)}`}
          />
          <div
            className="bg-foreground/50 transition-all duration-800 ease-out"
            style={{ width: `${calculatePercentage(context.monthlyCommittedAmount, context.monthlyIncome)}` }}
            title={`Planejamentos: ${formatCurrency(context.monthlyCommittedAmount)}`}
          />
          <div
            className="bg-foreground/20 transition-all duration-800 ease-out"
            style={{ width: `${calculatePercentage(context.freeIncome, context.monthlyIncome)}` }}
            title={`Livre: ${formatCurrency(context.freeIncome)}`}
          />
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Fixos</span>
          <p className="text-base font-medium font-mono">{formatCurrency(context.monthlyFixedExpenses)}</p>
          <p className="text-xs text-muted-foreground">
            {calculatePercentage(context.monthlyFixedExpenses, context.monthlyIncome)} da renda
          </p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Planejamentos</span>
          <p className="text-base font-medium font-mono">{formatCurrency(context.monthlyCommittedAmount)}</p>
          <p className="text-xs text-muted-foreground">
            {context.activePlanningsCount} {context.activePlanningsCount === 1 ? 'ativo' : 'ativos'}
          </p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Renda total</span>
          <p className="text-base font-medium font-mono">{formatCurrency(context.monthlyIncome)}</p>
          <p className="text-xs text-muted-foreground">
            Base mensal
          </p>
        </div>
      </div>

      {/* Dica contextual */}
      {!context.isHealthy && (
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-foreground/60">
            <strong className="text-foreground/80">Dica:</strong> Com menos de 20% de renda livre, você terá pouca margem para imprevistos. Considere reduzir o valor ou estender o prazo.
          </p>
        </div>
      )}
    </div>
  )
}
