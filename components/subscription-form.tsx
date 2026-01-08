"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface SubscriptionFormProps {
  onAddSubscription: (subscription: {
    description: string
    amount: number
    category: "Assinaturas"
    status?: "paid" | "pending"
    isRecurring: boolean
    recurringFrequency: "monthly" | "yearly"
    dueDate: string
    isActive: boolean
    notes?: string
  }) => void
}

export function SubscriptionForm({ onAddSubscription }: SubscriptionFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<"paid" | "pending">("pending")
  const [recurringFrequency, setRecurringFrequency] = useState<"monthly" | "yearly">("monthly")
  const [notes, setNotes] = useState("")
  const [isRecurring] = useState(true) // Assinaturas são sempre recorrentes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim() || !amount || !dueDate) {
      return
    }

    const numericAmount = Number.parseFloat(amount.replace(",", "."))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return
    }

    onAddSubscription({
      description: description.trim(),
      amount: numericAmount,
      category: "Assinaturas",
      status,
      isRecurring,
      recurringFrequency,
      dueDate,
      isActive: true,
      ...(notes.trim() && { notes: notes.trim() }),
    })

    // Clear form for next entry
    setDescription("")
    setAmount("")
    setDueDate("")
    setStatus("pending")
    setRecurringFrequency("monthly")
    setNotes("")
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Adicionar Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Nome da Assinatura
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Netflix, Spotify, Amazon Prime..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-base"
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium text-foreground">
              Frequência de Cobrança
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

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">
              Observações <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Ex: Plano familiar, compartilhado com... "
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-base resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{notes.length}/200</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">
                Status do Pagamento
              </Label>
              <p className="text-xs text-muted-foreground">
                {status === "paid" ? "Já foi pago este mês" : "Ainda não foi pago"}
              </p>
            </div>
            <Switch
              id="status"
              checked={status === "paid"}
              onCheckedChange={(checked) => setStatus(checked ? "paid" : "pending")}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!description.trim() || !amount || !dueDate}
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Assinatura
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
