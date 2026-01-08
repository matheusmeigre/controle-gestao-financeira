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
import { CreditCard, Plus, Minus, Receipt, Trash2 } from 'lucide-react'

interface CardBillFormV2Props {
  onAddCardBill: (cardBill: Omit<CardBill, "id" | "date" | "userId">) => void
}

export function CardBillFormV2({ onAddCardBill }: CardBillFormV2Props) {
  const [cardName, setCardName] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<Omit<CardBillItem, "id">[]>([
    { description: "", amount: 0, category: "", personName: "" }
  ])

  const handleAddItem = () => {
    setItems([...items, { description: "", amount: 0, category: "", personName: "" }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof Omit<CardBillItem, "id">, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
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

    if (!cardName || !description.trim()) {
      return
    }

    const validItems = items.filter((item) => 
      item.description.trim() && 
      item.amount > 0 && 
      item.category && 
      item.personName
    )

    if (validItems.length === 0) {
      return
    }

    const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0)
    const divisions = getDivisionsByPerson()

    const billItems: CardBillItem[] = validItems.map((item, idx) => ({
      ...item,
      id: `${Date.now()}-${idx}`,
      description: item.description.trim()
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
    setItems([{ description: "", amount: 0, category: "", personName: "" }])
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
      Assinaturas: "bg-cyan-100 text-cyan-800",
      Outros: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors["Outros"]
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium text-foreground">Itens da Fatura</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={index} className="border-muted">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Descrição</Label>
                        <Input
                          type="text"
                          placeholder="Ex: Netflix, Almoço..."
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="h-10"
                          autoComplete="off"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={item.amount || ""}
                          onChange={(e) => handleItemChange(index, "amount", Number.parseFloat(e.target.value) || 0)}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Categoria</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => handleItemChange(index, "category", value)}
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

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Pessoa</Label>
                        <div className="flex gap-2">
                          <Select
                            value={item.personName}
                            onValueChange={(value) => handleItemChange(index, "personName", value)}
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
                          
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.category && (
                      <Badge variant="secondary" className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Total da Fatura:</span>
                <span className="text-2xl font-bold text-foreground">R$ {getTotalAmount().toFixed(2)}</span>
              </div>
              
              {getDivisionsByPerson().length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Divisão por pessoa:</span>
                    {getDivisionsByPerson().map((div, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{div.personName}:</span>
                        <span className="font-medium">R$ {div.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={
              !cardName ||
              !description.trim() ||
              items.filter((item) => item.description.trim() && item.amount > 0 && item.category && item.personName).length === 0
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
