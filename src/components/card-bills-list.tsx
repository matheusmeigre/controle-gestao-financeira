"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CardBill } from "@/types/expense"
import { CreditCard, Trash2, Calendar, Users } from "lucide-react"

interface CardBillsListProps {
  cardBills: CardBill[]
  onDeleteCardBill: (id: string) => void
}

const PERSON_COLORS = {
  Eu: "bg-blue-100 text-blue-800 border-blue-200",
  Mãe: "bg-pink-100 text-pink-800 border-pink-200",
  Irmão: "bg-green-100 text-green-800 border-green-200",
}

export function CardBillsList({ cardBills, onDeleteCardBill }: CardBillsListProps) {
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
      {cardBills.map((bill) => (
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
      ))}
    </div>
  )
}
