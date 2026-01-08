"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CARD_OPTIONS, PERSON_OPTIONS, CATEGORIES, type CardBill, type CardBillItem } from "@/types/expense"
import { CreditCard, Plus, Receipt, Trash2, Edit2, Check, X } from 'lucide-react'

interface CardBillFormV2Props {
  onAddCardBill: (cardBill: Omit<CardBill, "id" | "date" | "userId">) => void
}

export function CardBillFormV2({ onAddCardBill }: CardBillFormV2Props) {
  const [cardName, setCardName] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<(Omit<CardBillItem, "id"> & { tempId: string })[]>([])
  
  // Formulário temporário para adicionar item
  const [newItem, setNewItem] = useState({
    description: "",
    amount: "",
    category: "",
    personName: ""
  })

  // Estado de edição
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    personName: ""
  })

  const handleAddItem = () => {
    if (!newItem.description.trim() || !newItem.amount || !newItem.category || !newItem.personName) {
      return
    }

    const itemToAdd = {
      tempId: Date.now().toString(),
      description: newItem.description.trim(),
      amount: Number.parseFloat(newItem.amount),
      category: newItem.category,
      personName: newItem.personName
    }

    setItems([...items, itemToAdd])
    
    // Limpar formulário
    setNewItem({
      description: "",
      amount: "",
      category: "",
      personName: ""
    })
  }

  const handleRemoveItem = (tempId: string) => {
    setItems(items.filter(item => item.tempId !== tempId))
  }

  const startEdit = (item: Omit<CardBillItem, "id"> & { tempId: string }) => {
    setEditingId(item.tempId)
    setEditForm({
      description: item.description,
      amount: item.amount.toString(),
      category: item.category,
      personName: item.personName
    })
  }

  const saveEdit = (tempId: string) => {
    if (!editForm.description.trim() || !editForm.amount || !editForm.category || !editForm.personName) {
      return
    }

    setItems(items.map(item => 
      item.tempId === tempId 
        ? {
            ...item,
            description: editForm.description.trim(),
            amount: Number.parseFloat(editForm.amount),
            category: editForm.category,
            personName: editForm.personName
          }
        : item
    ))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const getDivisionsByPerson = () => {
    const divisionMap = new Map<string, number>()
    items.forEach(item => {
      if (item.personName && item.amount > 0) {
        const current = divisionMap.get(item.personName) || 0
        divisionMap.set(item.personName, current + item.amount)
      }
    })
    return Array.from(divisionMap.entries()).map(([personName, amount]) => ({
      personName,
      amount,
      description: `Total de ${personName}`
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardName || !description.trim() || items.length === 0) {
      return
    }

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    const divisions = getDivisionsByPerson()

    const billItems: CardBillItem[] = items.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      description: item.description,
      amount: item.amount,
      category: item.category,
      personName: item.personName
    }))

    onAddCardBill({
      cardName,
      totalAmount,
      description: description.trim(),
      divisions,
      items: billItems
    })

    // Clear form
    setCardName("")
    setDescription("")
    setItems([])
    setNewItem({
      description: "",
      amount: "",
      category: "",
      personName: ""
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Alimentação: "bg-orange-100 text-orange-800",
      Transporte: "bg-blue-100 text-blue-800",
      Lazer: "bg-purple-100 text-purple-800",
      Contas: "bg-red-100 text-red-800",
      Saúde: "bg-green-100 text-green-800",
      Compras: "bg-pink-100 text-pink-800",
      Estudos: "bg-indigo-100 text-indigo-800",
      Outros: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors["Outros"]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Fatura */}
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
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Descrição da Fatura
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Ex: Fatura Janeiro 2024..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 text-base"
                autoComplete="off"
              />
            </div>
          </div>

          <Separator />

          {/* Formulário de Adição de Item */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">Adicionar Item à Fatura</Label>
            
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Descrição *</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Netflix, Almoço..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="h-10"
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Categoria *</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({...newItem, category: value})}
                    >
                      <SelectTrigger className="h-10">
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

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Pessoa *</Label>
                    <Select
                      value={newItem.personName}
                      onValueChange={(value) => setNewItem({...newItem, personName: value})}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Quem?" />
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
                </div>

                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!newItem.description.trim() || !newItem.amount || !newItem.category || !newItem.personName}
                  className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item à Lista
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Itens Adicionados */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-foreground">
                  Itens da Fatura ({items.length})
                </Label>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <Card key={item.tempId} className="border-muted">
                    <CardContent className="p-3">
                      {editingId === item.tempId ? (
                        // Modo de edição
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="Descrição"
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              className="h-9 text-sm"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Valor"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Select
                              value={editForm.category}
                              onValueChange={(value) => setEditForm({...editForm, category: value})}
                            >
                              <SelectTrigger className="h-9 text-sm">
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
                            <Select
                              value={editForm.personName}
                              onValueChange={(value) => setEditForm({...editForm, personName: value})}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
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
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveEdit(item.tempId)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="flex-1 h-8"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{item.personName}</span>
                            </div>
                            <p className="font-medium text-sm truncate">{item.description}</p>
                            <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(item.amount)}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveItem(item.tempId)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Resumo da Fatura */}
          {items.length > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total da Fatura:</span>
                <span className="text-2xl font-bold text-foreground">{formatCurrency(getTotalAmount())}</span>
              </div>
              
              {getDivisionsByPerson().length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Divisão por pessoa:</span>
                    {getDivisionsByPerson().map((div, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{div.personName}:</span>
                        <span className="font-medium">{formatCurrency(div.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botão de Submissão */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!cardName || !description.trim() || items.length === 0}
          >
            <Receipt className="h-5 w-5 mr-2" />
            Registrar Fatura com {items.length} {items.length === 1 ? 'item' : 'itens'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
