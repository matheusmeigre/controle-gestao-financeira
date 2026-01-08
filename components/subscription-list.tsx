"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type Expense } from "@/types/expense"
import { Edit2, Trash2, Check, X, Calendar, CheckCircle2, Clock, RefreshCw, Power } from "lucide-react"

interface SubscriptionListProps {
  subscriptions: Expense[]
  onUpdateSubscription: (id: string, subscription: Partial<Expense>) => void
  onDeleteSubscription: (id: string) => void
}

export function SubscriptionList({ subscriptions, onUpdateSubscription, onDeleteSubscription }: SubscriptionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    dueDate: "",
    status: "paid" as "paid" | "pending",
    recurringFrequency: "monthly" as "monthly" | "yearly",
    isActive: true,
    notes: "",
  })

  const startEdit = (subscription: Expense) => {
    setEditingId(subscription.id)
    setEditForm({
      description: subscription.description,
      amount: subscription.amount.toString(),
      dueDate: subscription.dueDate || "",
      status: subscription.status || "paid",
      recurringFrequency: subscription.recurringFrequency || "monthly",
      isActive: subscription.isActive !== false,
      notes: subscription.notes || "",
    })
  }

  const saveEdit = () => {
    if (!editingId) return

    const numericAmount = Number.parseFloat(editForm.amount.replace(",", "."))
    if (isNaN(numericAmount) || numericAmount <= 0) return

    if (!editForm.dueDate) return

    onUpdateSubscription(editingId, {
      description: editForm.description.trim(),
      amount: numericAmount,
      dueDate: editForm.dueDate,
      status: editForm.status,
      recurringFrequency: editForm.recurringFrequency,
      isActive: editForm.isActive,
      ...(editForm.notes.trim() && { notes: editForm.notes.trim() }),
    })

    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ description: "", amount: "", dueDate: "", status: "paid", recurringFrequency: "monthly", isActive: true, notes: "" })
  }

  const toggleActive = (id: string, currentActive: boolean | undefined) => {
    onUpdateSubscription(id, { isActive: !currentActive })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const getTotalMonthly = () => {
    return subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Assinaturas Ativas ({subscriptions.length})
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total mensal</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(getTotalMonthly())}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-balance">
              Nenhuma assinatura registrada.
              <br />
              Adicione suas assinaturas para melhor controle!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
              >
                {editingId === subscription.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="text-sm"
                        placeholder="Nome da assinatura"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        className="text-sm"
                        placeholder="Valor"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Data de Vencimento</Label>
                        <Input
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Frequência</Label>
                        <Select 
                          value={editForm.recurringFrequency} 
                          onValueChange={(value: "monthly" | "yearly") => setEditForm((prev) => ({ ...prev, recurringFrequency: value }))}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Observações (opcional)</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Descrição adicional..."
                        className="text-sm min-h-[60px] resize-none"
                        maxLength={200}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <Label className="text-xs">Pago este mês</Label>
                      <Switch
                        checked={editForm.status === "paid"}
                        onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, status: checked ? "paid" : "pending" }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <Label className="text-xs">Assinatura Ativa</Label>
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, isActive: checked }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {subscription.isActive === false && (
                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                            <X className="h-3 w-3 mr-1" />
                            Inativa
                          </Badge>
                        )}
                        {subscription.status === "pending" && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {subscription.status === "paid" && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Pago
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-800 border-cyan-200">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {subscription.recurringFrequency === "yearly" ? "Anual" : "Mensal"}
                        </Badge>
                      </div>
                      <p className={`font-medium truncate text-lg ${subscription.isActive === false ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {subscription.description}
                      </p>

                      {subscription.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic line-clamp-2">
                          {subscription.notes}
                        </p>
                      )}

                      {subscription.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Vence dia {formatDate(subscription.dueDate)}</span>
                        </div>
                      )}

                      <p className={`text-xl font-bold mt-2 ${subscription.isActive === false ? "text-muted-foreground" : "text-foreground"}`}>
                        {formatCurrency(subscription.amount)}/{subscription.recurringFrequency === "yearly" ? "ano" : "mês"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toggleActive(subscription.id, subscription.isActive !== false)}
                        className={`h-8 w-8 p-0 ${subscription.isActive === false ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}`}
                        title={subscription.isActive === false ? "Ativar assinatura" : "Inativar assinatura"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(subscription)} className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteSubscription(subscription.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
