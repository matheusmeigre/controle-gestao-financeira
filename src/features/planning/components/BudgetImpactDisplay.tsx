'use client'

import type { FinancialContext } from '../types'
import { ArrowRight } from 'lucide-react'

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

  // Diferença
  const impactAmount = monthlyRequired
  const freeIncomeReduction = currentFreeIncome - futureFreeIncome

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div>
        <h3 className="text-lg font-semibold">Como isso afeta seu orçamento</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Comparação da sua situação atual e futura
        </p>
      </div>

      {/* Comparação em Linha */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 items-center">
        {/* Cenário Atual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hoje</span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/60 transition-all duration-800 ease-out"
                style={{ width: `${Math.min(currentCommitmentPercentage, 100)}%` }}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comprometido</span>
                <span className="font-medium font-mono">{formatCurrency(currentCommitment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livre</span>
                <span className="font-medium font-mono text-green-600 dark:text-green-400">
                  {formatCurrency(currentFreeIncome)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {currentCommitmentPercentage.toFixed(0)}% da renda comprometida
              </p>
            </div>
          </div>
        </div>

        {/* Seta de Transição */}
        <div className="hidden md:flex justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        {/* Cenário Futuro */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Com planejamento</span>
            {futureCommitmentPercentage > 80 && (
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Crítico
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-800 ease-out ${
                  futureCommitmentPercentage > 80 ? 'bg-red-500' : 'bg-foreground/60'
                }`}
                style={{ width: `${Math.min(futureCommitmentPercentage, 100)}%` }}
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comprometido</span>
                <span className="font-medium font-mono">{formatCurrency(futureCommitment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livre</span>
                <span className={`font-medium font-mono ${
                  futureFreeIncome < currentContext.monthlyIncome * 0.2 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {formatCurrency(futureFreeIncome)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {futureCommitmentPercentage.toFixed(0)}% da renda comprometida
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do Impacto */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border-l-2 border-border">
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Valor mensal</span>
          <p className="text-lg font-medium font-mono">+{formatCurrency(impactAmount)}</p>
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Redução renda livre</span>
          <p className="text-lg font-medium font-mono text-red-600 dark:text-red-400">
            -{formatCurrency(freeIncomeReduction)}
          </p>
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">Novo comprometimento</span>
          <p className="text-lg font-medium font-mono">{futureCommitmentPercentage.toFixed(0)}%</p>
        </div>
      </div>

      {/* Alerta se crítico */}
      {futureFreeIncome < currentContext.monthlyIncome * 0.2 && (
        <div className="p-4 bg-background border-l-4 border-red-500 rounded">
          <p className="text-sm text-foreground/80">
            ⚠️ Sua margem de segurança reduzirá para {((futureFreeIncome / currentContext.monthlyIncome) * 100).toFixed(0)}%. 
            Com menos de 20% livre, você terá pouca proteção contra imprevistos.
          </p>
        </div>
      )}
    </div>
  )
}
