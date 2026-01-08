"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CardBill } from "@/types/expense"
import { CreditCard, Trash2, Calendar, Users, ChevronDown, ChevronUp, Package } from "lucide-react"

interface CardBillsListV2Props {
  cardBills: CardBill[]
  onDeleteCardBill: (id: string) => void
}

const PERSON_COLORS = {
  Eu: "bg-blue-100 text-blue-800 border-blue-200",
  Mãe: "bg-pink-100 text-pink-800 border-pink-200",
  Irmão: "bg-green-100 text-green-800 border-green-200",
}

export function CardBillsListV2({ cardBills, onDeleteCardBill }: CardBillsListV2Props) {
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set())

  const toggleExpanded = (billId: string) => {
    const newExpanded = new Set(expandedBills)
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId)
    } else {
      newExpanded.add(billId)
    }
    setExpandedBills(newExpanded)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Alimentação: "bg-orange-100 text-orange-800 border-orange-200",
      Transporte: "bg-blue-100 text-blue-800 border-blue-200",
      Lazer: "bg-purple-100 text-purple-800 border-purple-200",
      Contas: "bg-red-100 text-red-800 border-red-200",
      Saúde: "bg-green-100 text-green-800 border-green-200",
      Compras: "bg-pink-100 text-pink-800 border-pink-200",
      Estudos: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Assinaturas: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Outros: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[category] || colors["Outros"]
  }

  if (cardBills.length === 0) {
    return (
      <Card className="shadow-sm border-border">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma fatura de cartão registrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {cardBills.map((bill) => {
        const isExpanded = expandedBills.has(bill.id)
        const hasItems = bill.items && bill.items.length > 0

        return (
          <Card key={bill.id} className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {bill.cardName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(bill.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCardBill(bill.id)}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{bill.description}</p>
                <p className="text-2xl font-bold text-foreground">R$ {bill.totalAmount.toFixed(2)}</p>
              </div>

              <Separator />

              {/* Botão para expandir/colapsar itens */}
              {hasItems && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(bill.id)}
                  className="w-full"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {isExpanded ? "Ocultar" : "Ver"} itens ({bill.items!.length})
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </Button>
              )}

              {/* Lista de itens categorizados */}
              {hasItems && isExpanded && (
                <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Itens da fatura:</p>
                  {bill.items!.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={
                              PERSON_COLORS[item.personName as keyof typeof PERSON_COLORS] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {item.personName}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground truncate">{item.description}</p>
                      </div>
                      <span className="font-semibold text-foreground ml-3">R$ {item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Divisão por pessoa */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4" />
                  Divisão por pessoa:
                </div>

                <div className="grid gap-2">
                  {bill.divisions.map((division, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={
                            PERSON_COLORS[division.personName as keyof typeof PERSON_COLORS] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {division.personName}
                        </Badge>
                        {division.description && (
                          <span className="text-sm text-muted-foreground">{division.description}</span>
                        )}
                      </div>
                      <span className="font-semibold text-foreground">R$ {division.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Total dividido:</span>
                  <span className="font-semibold text-foreground">
                    R$ {bill.divisions.reduce((sum, div) => sum + div.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
