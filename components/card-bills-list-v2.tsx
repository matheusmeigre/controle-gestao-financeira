"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CardBill, CardBillItem } from "@/types/expense"
import { CARD_OPTIONS, PERSON_OPTIONS, CATEGORIES } from "@/types/expense"
import { CreditCard, Trash2, Calendar, Users, ChevronDown, ChevronUp, Package, Edit2, Check, X, Plus } from "lucide-react"

interface CardBillsListV2Props {
  cardBills: CardBill[]
  onDeleteCardBill: (id: string) => void
  onUpdateCardBill: (id: string, cardBill: Partial<CardBill>) => void
}

const PERSON_COLORS = {
  Eu: "bg-blue-100 text-blue-800 border-blue-200",
  Mãe: "bg-pink-100 text-pink-800 border-pink-200",
  Irmão: "bg-green-100 text-green-800 border-green-200",
}

export function CardBillsListV2({ cardBills, onDeleteCardBill, onUpdateCardBill }: CardBillsListV2Props) {
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    cardName: "",
    description: "",
    items: [] as (Omit<CardBillItem, "id"> & { tempId: string; id?: string })[],
    newItem: {
      description: "",
      amount: "",
      category: "",
      personName: ""
    }
  })

  const toggleExpanded = (billId: string) => {
    const newExpanded = new Set(expandedBills)
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId)
    } else {
      newExpanded.add(billId)
    }
    setExpandedBills(newExpanded)
  }

  const handleStartEdit = (bill: CardBill) => {
    setEditingId(bill.id)
    setEditForm({
      cardName: bill.cardName,
      description: bill.description || "",
      items: bill.items.map((item, idx) => ({ ...item, tempId: `existing-${idx}` })),
      newItem: {
        description: "",
        amount: "",
        category: "",
        personName: ""
      }
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({
      cardName: "",
      description: "",
      items: [],
      newItem: {
        description: "",
        amount: "",
        category: "",
        personName: ""
      }
    })
  }

  const handleSaveEdit = (billId: string) => {
    const items: CardBillItem[] = editForm.items.map((item, idx) => ({
      id: item.id || `item-${Date.now()}-${idx}`,
      description: item.description,
      amount: item.amount,
      category: item.category,
      personName: item.personName
    }))

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

    onUpdateCardBill(billId, {
      cardName: editForm.cardName,
      description: editForm.description,
      items,
      totalAmount
    })

    handleCancelEdit()
  }

  const handleAddItemInEdit = () => {
    const { description, amount, category, personName } = editForm.newItem
    if (!description || !amount || !category || !personName) {
      alert("Preencha todos os campos do item")
      return
    }

    const newItem = {
      tempId: `new-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category,
      personName
    }

    setEditForm(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      newItem: {
        description: "",
        amount: "",
        category: "",
        personName: ""
      }
    }))
  }

  const handleRemoveItemInEdit = (tempId: string) => {
    setEditForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.tempId !== tempId)
    }))
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
        const isEditing = editingId === bill.id
        const hasItems = bill.items && bill.items.length > 0

        // Modo de edição
        if (isEditing) {
          const editTotal = editForm.items.reduce((sum, item) => sum + item.amount, 0)
          const divisionByPerson = editForm.items.reduce((acc, item) => {
            acc[item.personName] = (acc[item.personName] || 0) + item.amount
            return acc
          }, {} as Record<string, number>)

          return (
            <Card key={bill.id} className="border-blue-500 border-2 shadow-md">
              <CardHeader className="pb-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-700 font-semibold">Editando Fatura</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveEdit(bill.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8 w-8 p-0"
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Formulário de informações básicas */}
                <div className="grid gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-card-${bill.id}`} className="text-sm font-medium">Cartão</Label>
                    <Select
                      value={editForm.cardName}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, cardName: value }))}
                    >
                      <SelectTrigger id={`edit-card-${bill.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CARD_OPTIONS.map((card) => (
                          <SelectItem key={card} value={card}>
                            {card}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`edit-desc-${bill.id}`} className="text-sm font-medium">Descrição (opcional)</Label>
                    <Input
                      id={`edit-desc-${bill.id}`}
                      placeholder="Ex: Fatura de Janeiro"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Formulário para adicionar novos itens */}
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </h3>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`new-item-desc-${bill.id}`} className="text-sm">Descrição</Label>
                      <Input
                        id={`new-item-desc-${bill.id}`}
                        placeholder="Ex: Netflix"
                        value={editForm.newItem.description}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          newItem: { ...prev.newItem, description: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`new-item-amount-${bill.id}`} className="text-sm">Valor</Label>
                      <Input
                        id={`new-item-amount-${bill.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editForm.newItem.amount}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          newItem: { ...prev.newItem, amount: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`new-item-cat-${bill.id}`} className="text-sm">Categoria</Label>
                      <Select
                        value={editForm.newItem.category}
                        onValueChange={(value) => setEditForm(prev => ({
                          ...prev,
                          newItem: { ...prev.newItem, category: value }
                        }))}
                      >
                        <SelectTrigger id={`new-item-cat-${bill.id}`}>
                          <SelectValue placeholder="Selecione" />
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

                    <div className="grid gap-2">
                      <Label htmlFor={`new-item-person-${bill.id}`} className="text-sm">Pessoa</Label>
                      <Select
                        value={editForm.newItem.personName}
                        onValueChange={(value) => setEditForm(prev => ({
                          ...prev,
                          newItem: { ...prev.newItem, personName: value }
                        }))}
                      >
                        <SelectTrigger id={`new-item-person-${bill.id}`}>
                          <SelectValue placeholder="Selecione" />
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

                    <Button
                      type="button"
                      onClick={handleAddItemInEdit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Lista de itens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Itens da Fatura ({editForm.items.length})
                    </h3>
                    <p className="text-lg font-bold text-green-600">
                      R$ {editTotal.toFixed(2)}
                    </p>
                  </div>

                  {editForm.items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
                      Nenhum item adicionado
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {editForm.items.map((item) => (
                        <div
                          key={item.tempId}
                          className="flex items-start justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </Badge>
                              <Badge variant="secondary" className={PERSON_COLORS[item.personName as keyof typeof PERSON_COLORS]}>
                                {item.personName}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium truncate">{item.description}</p>
                            <p className="text-sm font-semibold text-green-600">
                              R$ {item.amount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItemInEdit(item.tempId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divisão por pessoa */}
                {Object.keys(divisionByPerson).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Divisão por Pessoa
                      </h3>
                      <div className="grid gap-2">
                        {Object.entries(divisionByPerson).map(([person, amount]) => (
                          <div key={person} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <Badge variant="secondary" className={PERSON_COLORS[person as keyof typeof PERSON_COLORS]}>
                              {person}
                            </Badge>
                            <span className="font-semibold text-green-600">
                              R$ {amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        }

        // Modo de visualização normal
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(bill)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCardBill(bill.id)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
