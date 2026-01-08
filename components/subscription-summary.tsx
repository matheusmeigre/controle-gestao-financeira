"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense } from "@/types/expense"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Calendar, PieChartIcon } from "lucide-react"

interface SubscriptionSummaryProps {
  subscriptions: Expense[]
}

export function SubscriptionSummary({ subscriptions }: SubscriptionSummaryProps) {
  // Filtrar apenas assinaturas ativas
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive !== false)
  const totalAmount = activeSubscriptions.reduce((sum, subscription) => sum + subscription.amount, 0)

  // Agrupar por nome da assinatura
  const subscriptionTotals = activeSubscriptions.reduce(
    (acc, subscription) => {
      acc[subscription.description] = (acc[subscription.description] || 0) + subscription.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const getSubscriptionColor = (index: number) => {
    const colors = [
      "#06b6d4", // cyan
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#f59e0b", // amber
      "#10b981", // emerald
      "#3b82f6", // blue
      "#ef4444", // red
      "#84cc16", // lime
      "#f97316", // orange
      "#a855f7", // violet
    ]
    return colors[index % colors.length]
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

  const sortedSubscriptionsByValue = Object.entries(subscriptionTotals).sort(([, a], [, b]) => b - a)
  const chartData = sortedSubscriptionsByValue.map(([name, amount], index) => ({
    name: name,
    value: amount,
    percentage: ((amount / totalAmount) * 100).toFixed(1),
    color: getSubscriptionColor(index),
  }))

  return (
    <div className="grid gap-3 sm:gap-4">
      {/* Total Summary Card */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base md:text-xl font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
            <span className="text-pretty text-sm sm:text-base">Assinaturas em {currentMonth}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Mensal</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 whitespace-nowrap">Ativas</p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">{activeSubscriptions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      {chartData.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base md:text-xl font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
              <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base">Gastos por Assinatura</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <div className="h-48 sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={60}
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

              {/* Subscription List */}
              <div className="space-y-1.5 sm:space-y-2">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
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
