"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"
import { CategorySelector, CATEGORIES } from "@/features/categories"
import { Plus } from "lucide-react"

interface ExpenseFormProps {
  onAddExpense: (expense: {
    description: string
    amount: number
    category: string
    status?: "paid" | "pending"
    isRecurring?: boolean
    recurringFrequency?: "monthly" | "yearly"
    dueDate?: string
  }) => void
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<"paid" | "pending">("paid")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"monthly" | "yearly">("monthly")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || amount <= 0 || !category) {
      return
    }

    const needsDueDate = ["Contas", "Estudos", "Assinaturas"].includes(category)
    if (needsDueDate && !dueDate) {
      return
    }

    onAddExpense({
      description: description.trim(),
      amount,
      category,
      status,
      isRecurring,
      ...(isRecurring && { recurringFrequency }),
      ...(needsDueDate && { dueDate })
    })

    // Clear form for next entry
    setDescription("")
    setAmount(0)
    setCategory("")
    setStatus("paid")
    setIsRecurring(false)
    setRecurringFrequency("monthly")
    setDueDate("")
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Adicionar Gasto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Descrição
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Almoço, Uber, Café..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              Valor
            </Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onChange={setAmount}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              Categoria
            </Label>
            <CategorySelector 
              value={category} 
              onChange={setCategory}
              categories={CATEGORIES}
            />
          </div>

          {["Contas", "Estudos", "Assinaturas"].includes(category) && (
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                Data de Vencimento
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">
                Status do Pagamento
              </Label>
              <p className="text-xs text-muted-foreground">
                {status === "paid" ? "Já foi pago" : "Ainda não foi pago"}
              </p>
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as "paid" | "pending")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="recurring" className="text-sm font-medium text-foreground">
                Gasto Recorrente
              </Label>
              <p className="text-xs text-muted-foreground">
                Se repete periodicamente
              </p>
            </div>
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-medium text-foreground">
                Frequência de Recorrência
              </Label>
              <Select value={recurringFrequency} onValueChange={(value: "monthly" | "yearly") => setRecurringFrequency(value)}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={
              !description.trim() || 
              !amount || 
              !category || 
              (["Contas", "Estudos", "Assinaturas"].includes(category) && !dueDate)
            }
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Gasto
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
