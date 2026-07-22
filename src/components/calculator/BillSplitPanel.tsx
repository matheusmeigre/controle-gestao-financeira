"use client"

import { Plus, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"

interface SplitPerson {
  name: string
  amount: number
}

interface BillSplitPanelProps {
  splitMethod: "total" | "equal" | "custom"
  splitPeople: SplitPerson[]
  total: number
  hasPurchases: boolean
  onSplitMethodChange: (method: "total" | "equal" | "custom") => void
  onPersonChange: (index: number, field: "name" | "amount", value: string | number) => void
  onAddPerson: () => void
  onRemovePerson: (index: number) => void
}

export function BillSplitPanel({
  splitMethod,
  splitPeople,
  total,
  hasPurchases,
  onSplitMethodChange,
  onPersonChange,
  onAddPerson,
  onRemovePerson,
}: BillSplitPanelProps) {
  if (!hasPurchases) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>Adicione compras na aba calculadora primeiro</p>
      </div>
    )
  }

  const validPeople = splitPeople.filter((p) => p.name.trim())

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Método de Divisão</label>
        <div className="flex gap-2">
          {(["total", "equal", "custom"] as const).map((method) => (
            <Button
              key={method}
              type="button"
              variant={splitMethod === method ? "default" : "outline"}
              onClick={() => onSplitMethodChange(method)}
              className="flex-1 h-9"
            >
              {method === "total" ? "Valor Total" : method === "equal" ? "Dividir Igualmente" : "Personalizado"}
            </Button>
          ))}
        </div>
      </div>

      {(splitMethod === "equal" || splitMethod === "custom") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Pessoas</label>
            <Button type="button" variant="outline" size="sm" onClick={onAddPerson} className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Pessoa
            </Button>
          </div>

          <div className="space-y-2">
            {splitPeople.map((person, index) => (
              <div key={index} className="flex gap-2 items-end">
                <Input
                  type="text"
                  placeholder="Nome da pessoa"
                  value={person.name}
                  onChange={(e) => onPersonChange(index, "name", e.target.value)}
                  className="h-10 flex-1"
                />
                {splitMethod === "custom" && (
                  <CurrencyInput
                    value={person.amount}
                    onChange={(value) => onPersonChange(index, "amount", value)}
                    className="h-10 flex-1"
                  />
                )}
                {splitPeople.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => onRemovePerson(index)}
                    className="h-10 w-10 p-0">
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {splitMethod === "equal" && validPeople.length > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-foreground">
                Total por pessoa:{" "}
                <span className="font-bold text-primary">
                  R$ {(total / validPeople.length).toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg">
        <span className="font-semibold text-foreground">Total:</span>
        <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
      </div>
    </>
  )
}
