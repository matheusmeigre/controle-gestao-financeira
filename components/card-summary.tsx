"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CardBill } from "@/types/expense"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { CreditCard, TrendingUp, Users, Wallet } from "lucide-react"

interface CardSummaryProps {
  cardBills: CardBill[]
}

const PERSON_COLORS = [
  "#3b82f6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
]

const CARD_COLORS = [
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#ec4899",
  "#10b981",
]

export function CardSummary({ cardBills }: CardSummaryProps) {
  if (cardBills.length === 0) {
    return null
  }

  const personTotals = cardBills.reduce(
    (acc, bill) => {
      bill.divisions.forEach((division) => {
        acc[division.personName] = (acc[division.personName] || 0) + division.amount
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const cardTotals = cardBills.reduce(
    (acc, bill) => {
      acc[bill.cardName] = (acc[bill.cardName] || 0) + bill.totalAmount
      return acc
    },
    {} as Record<string, number>,
  )

  const personData = Object.entries(personTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], index) => ({
      name,
      value,
      color: PERSON_COLORS[index % PERSON_COLORS.length],
    }))

  const cardData = Object.entries(cardTotals).map(([name, amount], index) => ({
    name,
    amount,
    color: CARD_COLORS[index % CARD_COLORS.length],
  }))

  const totalAmount = cardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
  const totalDivided = Object.values(personTotals).reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Total em Faturas</p>
                <p className="text-base sm:text-xl font-bold text-foreground break-all">R$ {totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-950/30 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Total Dividido</p>
                <p className="text-base sm:text-xl font-bold text-foreground break-all">R$ {totalDivided.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex-shrink-0">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Cartões Ativos</p>
                <p className="text-base sm:text-xl font-bold text-foreground">{Object.keys(cardTotals).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Person Distribution */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Gastos por Pessoa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pie Chart */}
              <div className="h-52 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={personData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {personData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {personData.map((person) => (
                  <div key={person.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: person.color }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate">{person.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                        R$ {person.value.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((person.value / totalDivided) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Distribution */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span>Faturas por Cartão</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 sm:h-64 -ml-4 sm:-ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={60} />
                  <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Total"]} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {cardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
