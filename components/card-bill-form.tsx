"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CARD_OPTIONS, type CardBill, type PersonDivision } from "@/types/expense"
import { CreditCard, Plus, Minus, Receipt } from 'lucide-react'
import { CardCalculator } from "./card-calculator"

interface CardBillFormProps {
  onAddCardBill: (cardBill: Omit<CardBill, "id" | "date">) => void
}

export function CardBillForm({ onAddCardBill }: CardBillFormProps) {
  const [cardName, setCardName] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [description, setDescription] = useState("")
  const [divisions, setDivisions] = useState<PersonDivision[]>([{ personName: "", amount: 0 }])

  const handleAddDivision = () => {
    setDivisions([...divisions, { personName: "", amount: 0 }])
  }

  const handleRemoveDivision = (index: number) => {
    if (divisions.length > 1) {
      setDivisions(divisions.filter((_, i) => i !== index))
    }
  }

  const handleDivisionChange = (index: number, field: keyof PersonDivision, value: string | number) => {
    const newDivisions = [...divisions]
    newDivisions[index] = { ...newDivisions[index], [field]: value }
    setDivisions(newDivisions)
  }

  const getTotalDivisions = () => {
    return divisions.reduce((sum, div) => sum + (div.amount || 0), 0)
  }

  const getRemainingAmount = () => {
    const total = Number.parseFloat(totalAmount.replace(",", ".")) || 0
    return total - getTotalDivisions()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardName || !totalAmount || !description.trim()) {
      return
    }

    const numericTotal = Number.parseFloat(totalAmount.replace(",", "."))
    if (isNaN(numericTotal) || numericTotal <= 0) {
      return
    }

    const validDivisions = divisions.filter((div) => div.personName && div.amount > 0)
    if (validDivisions.length === 0) {
      return
    }

    onAddCardBill({
      cardName,
      totalAmount: numericTotal,
      description: description.trim(),
      divisions: validDivisions,
    })

    // Clear form
    setCardName("")
    setTotalAmount("")
    setDescription("")
    setDivisions([{ personName: "", amount: 0 }])
  }

  const handleApplyCalculatorTotal = (total: number, divisions?: { personName: string; amount: number }[]) => {
    setTotalAmount(total.toString())
    if (divisions && divisions.length > 0) {
      setDivisions(divisions)
    }
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Registrar Fatura do Cartão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardCalculator onApplyTotal={handleApplyCalculatorTotal} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-sm font-medium text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão/Banco
              </Label>
              <Select value={cardName} onValueChange={setCardName}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_OPTIONS.map((card) => (
                    <SelectItem key={card} value={card} className="text-base">
                      {card}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-sm font-medium text-foreground">
                Valor Total da Fatura (R$)
              </Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Descrição da Fatura
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Fatura Janeiro 2024, Compras do mês..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base"
              autoComplete="off"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground">Divisão por Pessoa</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDivision}
                className="h-8 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {divisions.map((division, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm text-muted-foreground">Pessoa</Label>
                  <Input
                    type="text"
                    placeholder="Digite o nome da pessoa"
                    value={division.personName}
                    onChange={(e) => handleDivisionChange(index, "personName", e.target.value)}
                    className="h-10"
                    autoComplete="off"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label className="text-sm text-muted-foreground">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={division.amount || ""}
                    onChange={(e) => handleDivisionChange(index, "amount", Number.parseFloat(e.target.value) || 0)}
                    className="h-10"
                  />
                </div>

                {divisions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDivision(index)}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total dividido:</span>
                <span className="font-medium">R$ {getTotalDivisions().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Restante:</span>
                <span
                  className={`font-medium ${getRemainingAmount() < 0 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  R$ {getRemainingAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={
              !cardName ||
              !totalAmount ||
              !description.trim() ||
              divisions.filter((div) => div.personName && div.amount > 0).length === 0
            }
          >
            <Receipt className="h-5 w-5 mr-2" />
            Registrar Fatura
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
