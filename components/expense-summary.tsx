"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense } from "@/types/expense"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Calendar, PieChartIcon } from "lucide-react"

interface ExpenseSummaryProps {
  expenses: Expense[]
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      Estudos: "#10b981",
      Contas: "#3b82f6",
      Alimentação: "#f59e0b",
      Transporte: "#ef4444",
      Lazer: "#8b5cf6",
      Saúde: "#ec4899",
      Casa: "#06b6d4",
      Roupas: "#84cc16",
      Outros: "#f97316",
      Compras: "#a855f7",
    }

    return categoryColors[category] || "#6366f1"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  const sortedCategoriesByValue = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)
  const chartData = sortedCategoriesByValue.map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / totalAmount) * 100).toFixed(1),
    color: getCategoryColor(category),
  }))

  return (
    <div className="grid gap-4 sm:gap-6">
      {/* Total Summary Card */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="text-pretty">Resumo de {currentMonth}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Gasto</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground break-all">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 whitespace-nowrap">Lançamentos</p>
              <p className="text-xl sm:text-2xl font-semibold text-primary">{expenses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      {chartData.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-xl font-semibold text-foreground flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Gastos por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Valor"]}
                      labelStyle={{ color: "#0f172a" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="space-y-2 sm:space-y-3">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(item.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
