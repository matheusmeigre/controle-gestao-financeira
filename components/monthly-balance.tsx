"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Wallet } from "lucide-react"
import type { Income, Expense, CardBill } from "@/types/expense"

interface MonthlyBalanceProps {
  incomes: Income[]
  expenses: Expense[]
  cardBills: CardBill[]
}

export function MonthlyBalance({ incomes, expenses, cardBills }: MonthlyBalanceProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalCardBills = cardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const totalOutflow = totalExpenses + totalCardBills
  const balance = totalIncome - totalOutflow

  // Determine color and icon based on balance
  const isPositive = balance > 0
  const isNeutral = balance === 0
  const balanceColor = isPositive ? "text-green-600" : isNeutral ? "text-muted-foreground" : "text-red-600"
  const balanceBgColor = isPositive ? "bg-green-50" : isNeutral ? "bg-muted" : "bg-red-50"
  const BalanceIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown

  return (
    <Card className={balanceBgColor}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">Saldo do Mês</CardTitle>
        <Wallet className={`h-4 w-4 ${balanceColor} flex-shrink-0`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl sm:text-3xl font-bold ${balanceColor} flex items-center gap-2 flex-wrap`}>
          <BalanceIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          <span className="break-all">{formatCurrency(Math.abs(balance))}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Receitas:</span>
            <span className="font-medium text-green-600 text-xs sm:text-sm break-all text-right">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground text-xs sm:text-sm">Despesas:</span>
            <span className="font-medium text-red-600 text-xs sm:text-sm break-all text-right">
              -{formatCurrency(totalOutflow)}
            </span>
          </div>
          <div className="border-t pt-2 mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground gap-2">
              <span className="whitespace-nowrap">Gastos Gerais:</span>
              <span className="break-all text-right">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground gap-2">
              <span className="whitespace-nowrap">Faturas de Cartão:</span>
              <span className="break-all text-right">{formatCurrency(totalCardBills)}</span>
            </div>
          </div>
        </div>
        {isPositive && <p className="text-xs text-green-600 mt-3 font-medium">Você está economizando este mês!</p>}
        {!isPositive && !isNeutral && (
          <p className="text-xs text-red-600 mt-3 font-medium">Atenção: suas despesas superam suas receitas</p>
        )}
      </CardContent>
    </Card>
  )
}
