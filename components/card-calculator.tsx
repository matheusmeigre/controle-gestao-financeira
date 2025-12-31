"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Plus, Delete as Delete2, ArrowRight, Trash2, DivideIcon, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface CardCalculatorProps {
  onApplyTotal: (total: number, divisions?: { personName: string; amount: number }[]) => void
}

export function CardCalculator({ onApplyTotal }: CardCalculatorProps) {
  const [purchases, setPurchases] = useState<{ id: string; description: string; amount: number }[]>([])
  const [currentDesc, setCurrentDesc] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("calculator")

  const [calculatorDisplay, setCalculatorDisplay] = useState("0")
  const [calculatorValue, setCalculatorValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [splitMethod, setSplitMethod] = useState<"total" | "equal" | "custom">("total")
  const [splitPeople, setSplitPeople] = useState<{ name: string; amount: number }[]>([{ name: "", amount: 0 }])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isExpanded || activeTab !== "calculator") return

      const key = e.key

      if (/[0-9]/.test(key)) {
        e.preventDefault()
        handleCalculatorNumber(key)
      } else if (key === ".") {
        e.preventDefault()
        handleCalculatorDecimal()
      } else if (key === "+" || key === "-") {
        e.preventDefault()
        handleCalculatorOperation(key)
      } else if (key === "*") {
        e.preventDefault()
        handleCalculatorOperation("×")
      } else if (key === "/") {
        e.preventDefault()
        handleCalculatorOperation("÷")
      } else if (key === "Enter" || key === "=") {
        e.preventDefault()
        handleCalculatorEquals()
      } else if (key === "Backspace") {
        e.preventDefault()
        handleCalculatorBackspace()
      } else if (key === "Escape") {
        e.preventDefault()
        handleCalculatorClear()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isExpanded, activeTab, calculatorDisplay, calculatorValue, operation, shouldResetDisplay])

  const handleCalculatorNumber = (num: string) => {
    if (shouldResetDisplay) {
      setCalculatorDisplay(num)
      setShouldResetDisplay(false)
    } else {
      setCalculatorDisplay(calculatorDisplay === "0" ? num : calculatorDisplay + num)
    }
  }

  const handleCalculatorDecimal = () => {
    if (shouldResetDisplay) {
      setCalculatorDisplay("0.")
      setShouldResetDisplay(false)
    } else if (!calculatorDisplay.includes(".")) {
      setCalculatorDisplay(calculatorDisplay + ".")
    }
  }

  const handleCalculatorOperation = (op: string) => {
    const currentNum = Number.parseFloat(calculatorDisplay)

    if (calculatorValue !== null && operation && !shouldResetDisplay) {
      const result = performOperation(calculatorValue, currentNum, operation)
      setCalculatorDisplay(result.toString())
      setCalculatorValue(result)
    } else {
      setCalculatorValue(currentNum)
    }

    setOperation(op)
    setShouldResetDisplay(true)
  }

  const performOperation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case "+":
        return prev + current
      case "-":
        return prev - current
      case "×":
        return prev * current
      case "÷":
        return current !== 0 ? prev / current : 0
      default:
        return current
    }
  }

  const handleCalculatorEquals = () => {
    if (calculatorValue !== null && operation) {
      const currentNum = Number.parseFloat(calculatorDisplay)
      const result = performOperation(calculatorValue, currentNum, operation)
      setCalculatorDisplay(result.toString())
      setCalculatorValue(null)
      setOperation(null)
      setShouldResetDisplay(true)
    }
  }

  const handleCalculatorClear = () => {
    setCalculatorDisplay("0")
    setCalculatorValue(null)
    setOperation(null)
    setShouldResetDisplay(false)
  }

  const handleCalculatorBackspace = () => {
    if (calculatorDisplay.length > 1) {
      setCalculatorDisplay(calculatorDisplay.slice(0, -1))
    } else {
      setCalculatorDisplay("0")
    }
  }

  const addPurchaseFromCalculator = () => {
    if (!currentDesc.trim()) {
      alert("Digite uma descrição para a compra")
      return
    }

    const amount = Number.parseFloat(calculatorDisplay)
    if (isNaN(amount) || amount <= 0) {
      alert("Valor deve ser maior que zero")
      return
    }

    setPurchases([
      ...purchases,
      {
        id: Date.now().toString(),
        description: currentDesc.trim(),
        amount,
      },
    ])

    setCurrentDesc("")
    handleCalculatorClear()
  }

  const removePurchase = (id: string) => {
    setPurchases(purchases.filter((p) => p.id !== id))
  }

  const getTotal = () => {
    return purchases.reduce((sum, p) => sum + p.amount, 0)
  }

  const calculateSplit = () => {
    const total = getTotal()

    if (splitMethod === "equal") {
      const validPeople = splitPeople.filter((p) => p.name.trim())
      if (validPeople.length === 0) return []

      const amountPerPerson = total / validPeople.length
      return validPeople.map((p) => ({
        personName: p.name,
        amount: amountPerPerson,
      }))
    }

    if (splitMethod === "custom") {
      return splitPeople
        .filter((p) => p.name.trim() && p.amount > 0)
        .map((p) => ({
          personName: p.name,
          amount: p.amount,
        }))
    }

    return []
  }

  const handleApplyTotal = () => {
    if (purchases.length === 0) return

    const total = getTotal()
    const divisions = splitMethod !== "total" ? calculateSplit() : undefined

    onApplyTotal(total, divisions)
    setPurchases([])
    setIsExpanded(false)
    handleCalculatorClear()
    setSplitMethod("total")
    setSplitPeople([{ name: "", amount: 0 }])
  }

  const handleSplitPersonChange = (index: number, field: "name" | "amount", value: string | number) => {
    const newPeople = [...splitPeople]
    newPeople[index] = {
      ...newPeople[index],
      [field]: field === "name" ? value : Number(value),
    }
    setSplitPeople(newPeople)
  }

  const addSplitPerson = () => {
    setSplitPeople([...splitPeople, { name: "", amount: 0 }])
  }

  const removeSplitPerson = (index: number) => {
    if (splitPeople.length > 1) {
      setSplitPeople(splitPeople.filter((_, i) => i !== index))
    }
  }

  if (!isExpanded) {
    return (
      <Button type="button" variant="outline" onClick={() => setIsExpanded(true)} className="w-full h-10 text-sm">
        <Calculator className="h-4 w-4 mr-2" />
        Abrir Calculadora de Compras
      </Button>
    )
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora de Compras
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false)
              setPurchases([])
              handleCalculatorClear()
            }}
            className="text-xs"
          >
            Fechar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dica: Use o teclado em desktop (números, +, -, *, /, Enter, Backspace)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="text-xs">
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs">
              <Users className="h-4 w-4 mr-2" />
              Divisão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            {/* Input area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descrição da Compra</label>
              <input
                type="text"
                placeholder="Ex: Supermercado, Restaurante..."
                value={currentDesc}
                onChange={(e) => setCurrentDesc(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addPurchaseFromCalculator()}
                className="w-full h-10 px-3 border border-input rounded-md text-sm bg-background"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {/* Display */}
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Cálculo</p>
                  <input
                    ref={inputRef}
                    type="text"
                    value={calculatorDisplay}
                    readOnly
                    className="w-full text-right text-3xl font-bold text-foreground font-mono break-all bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* Calculator Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculatorClear}
                  className="h-12 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold"
                >
                  C
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculatorBackspace}
                  className="h-12 font-semibold bg-transparent"
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorOperation("÷")}
                  className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg"
                >
                  ÷
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorOperation("×")}
                  className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg"
                >
                  ×
                </Button>

                {/* Row 2 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("7")}
                  className="h-12 font-semibold"
                >
                  7
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("8")}
                  className="h-12 font-semibold"
                >
                  8
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("9")}
                  className="h-12 font-semibold"
                >
                  9
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorOperation("-")}
                  className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg"
                >
                  −
                </Button>

                {/* Row 3 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("4")}
                  className="h-12 font-semibold"
                >
                  4
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("5")}
                  className="h-12 font-semibold"
                >
                  5
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("6")}
                  className="h-12 font-semibold"
                >
                  6
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorOperation("+")}
                  className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg"
                >
                  +
                </Button>

                {/* Row 4 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("1")}
                  className="h-12 font-semibold"
                >
                  1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("2")}
                  className="h-12 font-semibold"
                >
                  2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("3")}
                  className="h-12 font-semibold"
                >
                  3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculatorEquals}
                  className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg row-span-2"
                >
                  =
                </Button>

                {/* Row 5 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCalculatorNumber("0")}
                  className="h-12 font-semibold col-span-2"
                >
                  0
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculatorDecimal}
                  className="h-12 font-semibold bg-transparent"
                >
                  .
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={addPurchaseFromCalculator}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Compra
            </Button>

            {/* Purchases list */}
            {purchases.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Compras Registradas:</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPurchases([])}
                    className="h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar Tudo
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between bg-background p-2 rounded border border-border"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{purchase.description}</p>
                        <p className="text-xs text-muted-foreground">R$ {purchase.amount.toFixed(2)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePurchase(purchase.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Delete2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="split" className="space-y-4">
            {purchases.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>Adicione compras na aba calculadora primeiro</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Método de Divisão</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={splitMethod === "total" ? "default" : "outline"}
                      onClick={() => setSplitMethod("total")}
                      className="flex-1 h-9"
                    >
                      Valor Total
                    </Button>
                    <Button
                      type="button"
                      variant={splitMethod === "equal" ? "default" : "outline"}
                      onClick={() => setSplitMethod("equal")}
                      className="flex-1 h-9"
                    >
                      Dividir Igualmente
                    </Button>
                    <Button
                      type="button"
                      variant={splitMethod === "custom" ? "default" : "outline"}
                      onClick={() => setSplitMethod("custom")}
                      className="flex-1 h-9"
                    >
                      Personalizado
                    </Button>
                  </div>
                </div>

                {(splitMethod === "equal" || splitMethod === "custom") && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Pessoas</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSplitPerson}
                        className="h-8 text-xs"
                      >
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
                            onChange={(e) => handleSplitPersonChange(index, "name", e.target.value)}
                            className="h-10 flex-1"
                          />
                          {splitMethod === "custom" && (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={person.amount || ""}
                              onChange={(e) => handleSplitPersonChange(index, "amount", e.target.value)}
                              className="h-10 flex-1"
                            />
                          )}
                          {splitPeople.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSplitPerson(index)}
                              className="h-10 w-10 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {splitMethod === "equal" && splitPeople.filter((p) => p.name.trim()).length > 0 && (
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm text-foreground">
                          Total por pessoa:{" "}
                          <span className="font-bold text-primary">
                            R$ {(getTotal() / splitPeople.filter((p) => p.name.trim()).length).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center bg-primary/10 p-3 rounded-lg">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="text-xl font-bold text-primary">R$ {getTotal().toFixed(2)}</span>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Total and apply button */}
        {purchases.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border">
            <Button
              type="button"
              onClick={handleApplyTotal}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {splitMethod === "total" ? "Usar Este Total" : "Aplicar Divisão"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
