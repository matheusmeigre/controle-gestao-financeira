"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Briefcase, TrendingUp } from "lucide-react"
import type { Income } from "@/types/expense"

interface IncomeSummaryProps {
  incomes: Income[]
}

export function IncomeSummary({ incomes }: IncomeSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const salaryIncome = incomes.filter((i) => i.type === "salary").reduce((sum, income) => sum + income.amount, 0)
  const extraIncome = incomes.filter((i) => i.type === "extra").reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda Total</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">{incomes.length} fonte(s) de renda</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Salário</CardTitle>
          <Briefcase className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(salaryIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((salaryIncome / totalIncome) * 100 || 0).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendas Extras</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(extraIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((extraIncome / totalIncome) * 100 || 0).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
