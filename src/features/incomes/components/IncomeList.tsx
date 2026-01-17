"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryBadge } from "@/features/categories"
import { Trash2, DollarSign, Briefcase, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import type { Income } from "../types"
import { useToast } from "@/hooks/use-toast"

interface IncomeListProps {
  incomes: Income[]
  onDeleteIncome: (id: string) => void
  onMarkAsReceived: (id: string) => void
}

export function IncomeList({ incomes, onDeleteIncome, onMarkAsReceived }: IncomeListProps) {
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  }

  const calculateDaysDifference = (registrationDate: string, receivedDate: string) => {
    const regDate = new Date(registrationDate)
    const recDate = new Date(receivedDate)
    const diffTime = Math.abs(recDate.getTime() - regDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleMarkAsReceived = (income: Income) => {
    onMarkAsReceived(income.id)

    const days = calculateDaysDifference(income.registrationDate, new Date().toISOString())

    toast({
      title: "Renda marcada como recebida",
      description: `Recebido após ${days} ${days === 1 ? "dia" : "dias"} do registro`,
      duration: 5000,
    })
  }

  if (incomes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Rendas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Nenhuma renda registrada este mês</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Rendas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {income.type === "salary" ? (
                      <Briefcase className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="font-medium text-sm break-words">{income.description}</p>
                      <CategoryBadge category={income.category} size="sm" />
                      {income.status === "pending" ? (
                        <Badge
                          variant="outline"
                          className="text-yellow-600 border-yellow-600 bg-yellow-50 w-fit whitespace-nowrap"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600 bg-green-50 w-fit whitespace-nowrap"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Recebido
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {income.type === "salary" ? "Salário" : "Renda Extra"} • {formatDate(income.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  <span className="font-semibold text-green-600 text-base">{formatCurrency(income.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteIncome(income.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {income.status === "pending" && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Aguardando recebimento desde {formatDate(income.registrationDate)}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsReceived(income)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto whitespace-nowrap"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Marcar como Recebido
                  </Button>
                </div>
              )}

              {income.status === "received" && income.receivedDate && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Recebido após {calculateDaysDifference(income.registrationDate, income.receivedDate)}{" "}
                    {calculateDaysDifference(income.registrationDate, income.receivedDate) === 1 ? "dia" : "dias"} do
                    registro
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
