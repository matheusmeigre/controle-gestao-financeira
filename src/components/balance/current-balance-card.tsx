'use client'

/**
 * CurrentBalanceCard Component
 * 
 * 💰 SALDO ATUAL - REGIME DE CAIXA
 * Exibe apenas dinheiro real disponível (receitas recebidas - despesas pagas)
 * 
 * Este é o saldo que o usuário TEM AGORA em conta.
 * Contas vencidas mas não pagas NÃO entram aqui.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/financial-calculations'
import { useBalanceState } from '@/hooks/use-financial-summary'
import type { FinancialSummary } from '@/lib/financial-calculations'

interface CurrentBalanceCardProps {
  summary: FinancialSummary
  className?: string
}

export function CurrentBalanceCard({ summary, className }: CurrentBalanceCardProps) {
  const { currentBalance, receivedIncomes, paidExpenses } = summary
  const balanceState = useBalanceState(currentBalance)
  
  const BalanceIcon = balanceState.isPositive 
    ? TrendingUp 
    : balanceState.isNeutral 
    ? Minus 
    : TrendingDown
  
  return (
    <Card className={`${balanceState.bgColor} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold text-foreground md:text-base">
            💰 Saldo em Conta
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[280px]">
                <p className="text-xs">
                  <strong>Regime de Caixa:</strong> Mostra apenas dinheiro disponível agora.
                  Inclui apenas receitas recebidas e despesas já pagas.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Wallet className={`h-4 w-4 ${balanceState.color} flex-shrink-0`} />
      </CardHeader>
      
      <CardContent>
        {/* Saldo Principal */}
        <div className={`text-2xl font-bold ${balanceState.color} flex items-center gap-2 mb-4 md:text-3xl`}>
          <BalanceIcon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
          <span>{formatCurrency(Math.abs(currentBalance))}</span>
        </div>
        
        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Recebido:</span>
            <span className="font-medium text-green-600 dark:text-green-500">
              {formatCurrency(receivedIncomes)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Pago:</span>
            <span className="font-medium text-red-600 dark:text-red-500">
              -{formatCurrency(paidExpenses)}
            </span>
          </div>
        </div>
        
        {/* Status Message */}
        {balanceState.isPositive && (
          <p className="text-xs text-green-600 dark:text-green-500 mt-3 font-medium">
            ✓ Você está no positivo!
          </p>
        )}
        
        {balanceState.isNegative && (
          <p className="text-xs text-red-600 dark:text-red-500 mt-3 font-medium">
            ⚠ Você gastou mais do que recebeu
          </p>
        )}
      </CardContent>
    </Card>
  )
}
