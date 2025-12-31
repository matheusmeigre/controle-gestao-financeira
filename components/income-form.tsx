"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PlusCircle, DollarSign } from "lucide-react"
import type { Income } from "@/types/expense"

interface IncomeFormProps {
  onAddIncome: (income: Omit<Income, "id" | "date">) => void
}

export function IncomeForm({ onAddIncome }: IncomeFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"salary" | "extra">("salary")
  const [isReceived, setIsReceived] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !amount || Number.parseFloat(amount) <= 0) {
      return
    }

    const currentDate = new Date().toISOString()

    onAddIncome({
      description: description.trim(),
      amount: Number.parseFloat(amount),
      type,
      status: isReceived ? "received" : "pending",
      registrationDate: currentDate,
      receivedDate: isReceived ? currentDate : null,
    })

    // Reset form
    setDescription("")
    setAmount("")
    setType("salary")
    setIsReceived(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Registrar Renda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-type">Tipo de Renda</Label>
            <Select value={type} onValueChange={(value: "salary" | "extra") => setType(value)}>
              <SelectTrigger id="income-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salário</SelectItem>
                <SelectItem value="extra">Renda Extra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-description">Descrição</Label>
            <Input
              id="income-description"
              type="text"
              placeholder={type === "salary" ? "Ex: Salário mensal" : "Ex: Freelance, Aluguel, Venda"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-amount">Valor (R$)</Label>
            <Input
              id="income-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="received-status" className="text-base">
                Valor já recebido?
              </Label>
              <p className="text-sm text-muted-foreground">Marque se o valor já está disponível</p>
            </div>
            <Switch id="received-status" checked={isReceived} onCheckedChange={setIsReceived} />
          </div>

          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Renda
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
