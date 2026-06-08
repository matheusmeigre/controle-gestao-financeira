'use client'

/**
 * ProjectedBalanceCard Component
 * 
 * 📊 PROJEÇÃO FINANCEIRA - REGIME DE COMPETÊNCIA
 * Exibe a previsão do saldo final do mês (todas receitas - todas despesas)
 * 
 * Inclui valores futuros, pendentes e agendados.
 * Serve como PREVISÃO, não como saldo real.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Info, Calendar } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, calculateExpensePercentage } from '@/lib/financial-calculations'
import { useBalanceState } from '@/hooks/use-financial-summary'
import type { FinancialSummary } from '@/lib/financial-calculations'

interface ProjectedBalanceCardProps {
  summary: FinancialSummary
  className?: string
}

export function ProjectedBalanceCard({ summary, className }: ProjectedBalanceCardProps) {
  const { 
    projectedBalance, 
    totalExpectedIncomes, 
    totalExpectedExpenses,
    details 
  } = summary
  
  const balanceState = useBalanceState(projectedBalance)
  const expensePercentage = calculateExpensePercentage(totalExpectedExpenses, totalExpectedIncomes)
  
  const BalanceIcon = balanceState.isPositive 
    ? TrendingUp 
    : balanceState.isNeutral 
    ? Minus 
    : TrendingDown
  
  const hasPending = details.pendingIncomes > 0 || details.pendingExpenses > 0
  
  return (
    <Card className={`border-2 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-foreground md:text-base">
            📊 Projeção do Mês
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <p className="text-xs">
                  <strong>Regime de Competência:</strong> Previsão considerando TODAS as receitas 
                  e despesas do mês (pagas e pendentes). Não representa dinheiro disponível agora.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Calendar className={`h-4 w-4 text-muted-foreground flex-shrink-0`} />
      </CardHeader>
      
      <CardContent>
        {/* Saldo Projetado */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Sobra/Falta prevista:</span>
            {hasPending && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Pendente
              </Badge>
            )}
          </div>
          
          <div className={`text-xl font-bold ${balanceState.color} flex items-center gap-2 md:text-2xl`}>
            <BalanceIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span>{formatCurrency(Math.abs(projectedBalance))}</span>
          </div>
        </div>
        
        {/* Progress Bar de Gastos */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Gasto previsto</span>
            <span className={`font-semibold ${expensePercentage > 100 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {expensePercentage}%
            </span>
          </div>
          <Progress 
            value={expensePercentage} 
            className="h-2"
            indicatorClassName={expensePercentage > 100 ? 'bg-red-600' : 'bg-primary'}
          />
        </div>
        
        {/* Breakdown */}
        <div className="space-y-1.5 text-xs border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Receitas previstas:</span>
            <span className="font-medium text-green-600 dark:text-green-500">
              {formatCurrency(totalExpectedIncomes)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Despesas previstas:</span>
            <span className="font-medium text-red-600 dark:text-red-500">
              -{formatCurrency(totalExpectedExpenses)}
            </span>
          </div>

          {/* Nota discreta de divisão de fatura por pessoa */}
          {details.invoices.hasSplit && (
            <div className="border-t pt-1.5 mt-1 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Faturas (minha parte):</span>
                <span className="font-medium text-red-600/80 dark:text-red-500/80">
                  -{formatCurrency(details.invoices.expected)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Total bruto faturas:</span>
                <span className="text-muted-foreground/70">
                  {formatCurrency(details.invoices.totalBeforeSplit)}
                </span>
              </div>
            </div>
          )}
          
          {/* Valores Pendentes */}
          {hasPending && (
            <div className="border-t pt-1.5 mt-1.5 space-y-1">
              {details.pendingIncomes > 0 && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">A receber:</span>
                  <span className="text-green-600/80 dark:text-green-500/80">
                    +{formatCurrency(details.pendingIncomes)}
                  </span>
                </div>
              )}
              
              {details.pendingExpenses > 0 && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">A pagar:</span>
                  <span className="text-red-600/80 dark:text-red-500/80">
                    -{formatCurrency(details.pendingExpenses)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Alert Messages */}
        {balanceState.isNegative && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800/30">
            <p className="text-[11px] text-red-700 dark:text-red-400 font-medium">
              ⚠️ Atenção: Despesas superam receitas previstas
            </p>
          </div>
        )}
        
        {balanceState.isPositive && expensePercentage < 80 && (
          <p className="text-[11px] text-green-600 dark:text-green-500 mt-2 font-medium">
            ✓ Gastos controlados! Continue assim.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
