'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/financial-calculations'
import { useBalanceState } from '@/hooks/use-financial-summary'
import type { FinancialSummary } from '@/lib/financial-calculations'
import { BalanceValue } from './balance-visibility'

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
    <Card className={`overflow-hidden border-primary/20 bg-[linear-gradient(145deg,var(--card),color-mix(in_oklab,var(--primary)_7%,var(--card)))] ${className ?? ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold md:text-base">
            Saldo em Conta
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Como o saldo em conta é calculado">
                  <Info className="size-4" aria-hidden="true" />
                </button>
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
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="size-4" aria-hidden="true" />
        </span>
      </CardHeader>

      <CardContent>
        <div className={`mb-4 flex items-center gap-2 font-mono text-2xl font-bold tracking-tight tabular-nums ${balanceState.color} md:text-3xl`}>
          <BalanceIcon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
          <span><BalanceValue>{formatCurrency(currentBalance)}</BalanceValue></span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Recebido:</span>
            <span className="font-medium text-success">
              <BalanceValue>{formatCurrency(receivedIncomes)}</BalanceValue>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Pago:</span>
            <span className="font-medium text-destructive">
              <BalanceValue>-{formatCurrency(paidExpenses)}</BalanceValue>
            </span>
          </div>
        </div>

        {balanceState.isPositive && (
          <p className="text-xs text-success mt-3 font-medium">
            Você está no positivo!
          </p>
        )}

        {balanceState.isNegative && (
          <p className="text-xs text-destructive mt-3 font-medium">
            Você gastou mais do que recebeu
          </p>
        )}
      </CardContent>
    </Card>
  )
}
