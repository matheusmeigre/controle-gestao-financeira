"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { type Expense, CATEGORIES, CARD_OPTIONS, PERSON_OPTIONS } from "@/types/expense"
import { Edit2, Trash2, Check, X, Receipt, CreditCard, User, Calendar, RefreshCw, CheckCircle2, Clock } from "lucide-react"

interface ExpenseListProps {
  expenses: Expense[]
  onUpdateExpense: (id: string, expense: Partial<Expense>) => void
  onDeleteExpense: (id: string) => void
}

export function ExpenseList({ expenses, onUpdateExpense, onDeleteExpense }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    cardName: "",
    personName: "",
    status: "paid" as "paid" | "pending",
    isRecurring: false,
    dueDate: "",
  })

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      cardName: expense.cardName || "",
      personName: expense.personName || "",
      status: expense.status || "paid",
      isRecurring: expense.isRecurring || false,
      dueDate: expense.dueDate || "",
    })
  }

  const saveEdit = () => {
    if (!editingId) return

    const numericAmount = Number.parseFloat(editForm.amount.replace(",", "."))
    if (isNaN(numericAmount) || numericAmount <= 0) return

    if (editForm.category === "Cartão" && (!editForm.cardName || !editForm.personName)) return

    const needsDueDate = ["Contas", "Estudos", "Assinaturas"].includes(editForm.category)
    if (needsDueDate && !editForm.dueDate) return

    onUpdateExpense(editingId, {
      description: editForm.description.trim(),
      amount: numericAmount,
      category: editForm.category,
      status: editForm.status,
      isRecurring: editForm.isRecurring,
      ...(needsDueDate && { dueDate: editForm.dueDate }),
      ...(editForm.category === "Cartão" && {
        cardName: editForm.cardName,
        personName: editForm.personName,
      }),
    })

    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ 
      description: "", 
      amount: "", 
      category: "", 
      cardName: "", 
      personName: "",
      status: "paid",
      isRecurring: false,
      dueDate: "",
    })
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Alimentação: "bg-orange-100 text-orange-800 border-orange-200",
      Transporte: "bg-blue-100 text-blue-800 border-blue-200",
      Lazer: "bg-purple-100 text-purple-800 border-purple-200",
      Contas: "bg-red-100 text-red-800 border-red-200",
      Saúde: "bg-green-100 text-green-800 border-green-200",
      Compras: "bg-pink-100 text-pink-800 border-pink-200",
      Estudos: "bg-indigo-100 text-indigo-800 border-indigo-200", // Added color for Estudos
      Cartão: "bg-emerald-100 text-emerald-800 border-emerald-200", // Added color for Cartão
      Outros: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[category] || colors["Outros"]
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Gastos do Mês ({expenses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-balance">
              Nenhum gasto registrado este mês.
              <br />
              Adicione seu primeiro gasto acima!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
              >
                {editingId === expense.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="text-sm"
                        placeholder="Descrição"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        className="text-sm"
                        placeholder="Valor"
                      />
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {["Contas", "Estudos", "Assinaturas"].includes(editForm.category) && (
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
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={editForm.status}
                          onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as "paid" | "pending" }))}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <Label className="text-xs">Recorrente</Label>
                        <Switch
                          checked={editForm.isRecurring}
                          onCheckedChange={(checked) => setEditForm((prev) => ({ ...prev, isRecurring: checked }))}
                        />
                      </div>
                    </div>

                    {editForm.category === "Cartão" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                          value={editForm.cardName}
                          onValueChange={(value) => setEditForm((prev) => ({ ...prev, cardName: value }))}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Cartão" />
                          </SelectTrigger>
                          <SelectContent>
                            {CARD_OPTIONS.map((card) => (
                              <SelectItem key={card} value={card}>
                                {card}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editForm.personName}
                          onValueChange={(value) => setEditForm((prev) => ({ ...prev, personName: value }))}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Pessoa" />
                          </SelectTrigger>
                          <SelectContent>
                            {PERSON_OPTIONS.map((person) => (
                              <SelectItem key={person} value={person}>
                                {person}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="bg-accent hover:bg-accent/90">
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
                        <span className="text-sm text-muted-foreground font-mono">{formatDate(expense.date)}</span>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </Badge>
                        {expense.status === "pending" && (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                        {expense.status === "paid" && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Pago
                          </Badge>
                        )}
                        {expense.isRecurring && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground truncate">{expense.description}</p>

                      {expense.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Venc: {new Date(expense.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}

                      {expense.category === "Cartão" && (expense.cardName || expense.personName) && (
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {expense.cardName && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>{expense.cardName}</span>
                            </div>
                          )}
                          {expense.personName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{expense.personName}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => startEdit(expense)} className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteExpense(expense.id)}
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
