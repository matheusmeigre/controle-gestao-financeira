"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"
import { PlusCircle, DollarSign } from "lucide-react"
import type { Income } from "../types"
import { CategorySelector, INCOME_CATEGORIES } from "@/features/categories"

interface IncomeFormProps {
  onAddIncome: (income: Omit<Income, "id" | "date">) => void
}

export function IncomeForm({ onAddIncome }: IncomeFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<"salary" | "extra">("salary")
  const [category, setCategory] = useState("")
  const [isReceived, setIsReceived] = useState(false)
  const [salaryMonth, setSalaryMonth] = useState("")
  const [salaryPeriod, setSalaryPeriod] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação especial para salário
    if (type === 'salary') {
      if (amount <= 0 || !salaryMonth) {
        alert('Preencha o valor e o mês do salário')
        return
      }
    } else {
      if (!description.trim() || amount <= 0 || !category) {
        return
      }
    }

    const currentDate = new Date().toISOString()
    
    // Gera descrição automática para salário
    let finalDescription = description.trim()
    if (type === 'salary') {
      const [year, month] = salaryMonth.split('-')
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      const monthName = monthNames[parseInt(month) - 1]
      
      finalDescription = `Salário - ${monthName}/${year}`
      if (salaryPeriod) {
        finalDescription += ` (${salaryPeriod})`
      }
    }

    onAddIncome({
      description: finalDescription,
      amount,
      type,
      category: category || 'Outros',
      status: isReceived ? "received" : "pending",
      registrationDate: currentDate,
      receivedDate: isReceived ? currentDate : null,
    })

    // Reset form
    setDescription("")
    setAmount(0)
    setType("salary")
    setCategory("")
    setIsReceived(false)
    setSalaryMonth("")
    setSalaryPeriod("")
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

          {/* Campos condicionais para Salário */}
          {type === 'salary' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="salary-month">Mês do Salário *</Label>
                <Input
                  id="salary-month"
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  max="9999-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary-period">Período de Vigência (Opcional)</Label>
                <Input
                  id="salary-period"
                  placeholder="Ex: 01/02 - 28/02"
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Informe o período da folha de pagamento, se aplicável
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="income-description">Descrição</Label>
                <Input
                  id="income-description"
                  type="text"
                  placeholder="Ex: Freelance, Aluguel, Venda"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income-category">Categoria</Label>
                <CategorySelector 
                  value={category} 
                  onChange={setCategory}
                  categories={INCOME_CATEGORIES}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="income-amount">Valor</Label>
            <CurrencyInput
              id="income-amount"
              value={amount}
              onChange={setAmount}
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
