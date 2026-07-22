"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Plus, Trash2, ArrowRight, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { CalculatorPad } from "@/components/calculator/CalculatorPad"
import { PurchaseList } from "@/components/calculator/PurchaseList"
import { BillSplitPanel } from "@/components/calculator/BillSplitPanel"

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

  function handleCalculatorNumber(num: string) {
    if (shouldResetDisplay) {
      setCalculatorDisplay(num)
      setShouldResetDisplay(false)
    } else {
      setCalculatorDisplay(calculatorDisplay === "0" ? num : calculatorDisplay + num)
    }
  }

  function handleCalculatorDecimal() {
    if (shouldResetDisplay) {
      setCalculatorDisplay("0.")
      setShouldResetDisplay(false)
    } else if (!calculatorDisplay.includes(".")) {
      setCalculatorDisplay(calculatorDisplay + ".")
    }
  }

  const performOperation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case "+": return prev + current
      case "-": return prev - current
      case "×": return prev * current
      case "÷": return current !== 0 ? prev / current : 0
      default: return current
    }
  }

  function handleCalculatorOperation(op: string) {
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

  function handleCalculatorEquals() {
    if (calculatorValue !== null && operation) {
      const currentNum = Number.parseFloat(calculatorDisplay)
      const result = performOperation(calculatorValue, currentNum, operation)
      setCalculatorDisplay(result.toString())
      setCalculatorValue(null)
      setOperation(null)
      setShouldResetDisplay(true)
    }
  }

  function handleCalculatorClear() {
    setCalculatorDisplay("0")
    setCalculatorValue(null)
    setOperation(null)
    setShouldResetDisplay(false)
  }

  function handleCalculatorBackspace() {
    setCalculatorDisplay(calculatorDisplay.length > 1 ? calculatorDisplay.slice(0, -1) : "0")
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isExpanded || activeTab !== "calculator") return
      const key = e.key
      if (/[0-9]/.test(key)) { e.preventDefault(); handleCalculatorNumber(key) }
      else if (key === ".") { e.preventDefault(); handleCalculatorDecimal() }
      else if (key === "+" || key === "-") { e.preventDefault(); handleCalculatorOperation(key) }
      else if (key === "*") { e.preventDefault(); handleCalculatorOperation("×") }
      else if (key === "/") { e.preventDefault(); handleCalculatorOperation("÷") }
      else if (key === "Enter" || key === "=") { e.preventDefault(); handleCalculatorEquals() }
      else if (key === "Backspace") { e.preventDefault(); handleCalculatorBackspace() }
      else if (key === "Escape") { e.preventDefault(); handleCalculatorClear() }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, activeTab, calculatorDisplay, calculatorValue, operation, shouldResetDisplay])

  const addPurchaseFromCalculator = () => {
    if (!currentDesc.trim()) { alert("Digite uma descrição para a compra"); return }
    const amount = Number.parseFloat(calculatorDisplay)
    if (isNaN(amount) || amount <= 0) { alert("Valor deve ser maior que zero"); return }

    setPurchases([...purchases, { id: Date.now().toString(), description: currentDesc.trim(), amount }])
    setCurrentDesc("")
    handleCalculatorClear()
  }

  const getTotal = () => purchases.reduce((sum, p) => sum + p.amount, 0)

  const calculateSplit = () => {
    const total = getTotal()
    if (splitMethod === "equal") {
      const validPeople = splitPeople.filter((p) => p.name.trim())
      if (validPeople.length === 0) return []
      const amountPerPerson = total / validPeople.length
      return validPeople.map((p) => ({ personName: p.name, amount: amountPerPerson }))
    }
    if (splitMethod === "custom") {
      return splitPeople.filter((p) => p.name.trim() && p.amount > 0).map((p) => ({ personName: p.name, amount: p.amount }))
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
    newPeople[index] = { ...newPeople[index], [field]: field === "name" ? value : (typeof value === 'number' ? value : Number(value)) }
    setSplitPeople(newPeople)
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
          <Button type="button" variant="ghost" size="sm"
            onClick={() => { setIsExpanded(false); setPurchases([]); handleCalculatorClear() }}
            className="text-xs">Fechar</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dica: Use o teclado em desktop (números, +, -, *, /, Enter, Backspace)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="text-xs">
              <Calculator className="h-4 w-4 mr-2" /> Calculadora
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs">
              <Users className="h-4 w-4 mr-2" /> Divisão
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descrição da Compra</label>
              <Input
                ref={inputRef}
                type="text" placeholder="Ex: Supermercado, Restaurante..."
                value={currentDesc}
                onChange={(e) => setCurrentDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPurchaseFromCalculator()}
                className="h-10"
              />
            </div>

            <CalculatorPad
              display={calculatorDisplay}
              onNumber={handleCalculatorNumber}
              onDecimal={handleCalculatorDecimal}
              onOperation={handleCalculatorOperation}
              onEquals={handleCalculatorEquals}
              onClear={handleCalculatorClear}
              onBackspace={handleCalculatorBackspace}
            />

            <Button type="button" onClick={addPurchaseFromCalculator}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Compra
            </Button>

            <PurchaseList purchases={purchases} onRemove={(id) => setPurchases((prev) => prev.filter((p) => p.id !== id))} onClear={() => setPurchases([])} />
          </TabsContent>

          <TabsContent value="split" className="space-y-4">
            <BillSplitPanel
              splitMethod={splitMethod}
              splitPeople={splitPeople}
              total={getTotal()}
              hasPurchases={purchases.length > 0}
              onSplitMethodChange={setSplitMethod}
              onPersonChange={handleSplitPersonChange}
              onAddPerson={() => setSplitPeople([...splitPeople, { name: "", amount: 0 }])}
              onRemovePerson={(index) => splitPeople.length > 1 && setSplitPeople(splitPeople.filter((_, i) => i !== index))}
            />
          </TabsContent>
        </Tabs>

        {purchases.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border">
            <Button type="button" onClick={handleApplyTotal}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <ArrowRight className="h-4 w-4 mr-2" />
              {splitMethod === "total" ? "Usar Este Total" : "Aplicar Divisão"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
