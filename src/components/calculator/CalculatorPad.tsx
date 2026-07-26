"use client"

import { Button } from "@/components/ui/button"

interface CalculatorPadProps {
  display: string
  onNumber: (num: string) => void
  onDecimal: () => void
  onOperation: (op: string) => void
  onEquals: () => void
  onClear: () => void
  onBackspace: () => void
}

export function CalculatorPad({ display, onNumber, onDecimal, onOperation, onEquals, onClear, onBackspace }: CalculatorPadProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      <div className="bg-background border border-border rounded-lg p-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Cálculo</p>
          <input
            type="text"
            value={display}
            readOnly
            className="w-full text-right text-3xl font-bold text-foreground font-mono break-all bg-transparent border-none outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Button type="button" variant="outline" onClick={onClear}
          className="h-12 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold">C</Button>
        <Button type="button" variant="outline" onClick={onBackspace}
          className="h-12 font-semibold bg-transparent">←</Button>
        <Button type="button" variant="outline" onClick={() => onOperation("÷")}
          className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg">÷</Button>
        <Button type="button" variant="outline" onClick={() => onOperation("×")}
          className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg">×</Button>

        <Button type="button" variant="outline" onClick={() => onNumber("7")}
          className="h-12 font-semibold">7</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("8")}
          className="h-12 font-semibold">8</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("9")}
          className="h-12 font-semibold">9</Button>
        <Button type="button" variant="outline" onClick={() => onOperation("-")}
          className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg">−</Button>

        <Button type="button" variant="outline" onClick={() => onNumber("4")}
          className="h-12 font-semibold">4</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("5")}
          className="h-12 font-semibold">5</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("6")}
          className="h-12 font-semibold">6</Button>
        <Button type="button" variant="outline" onClick={() => onOperation("+")}
          className="h-12 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-lg">+</Button>

        <Button type="button" variant="outline" onClick={() => onNumber("1")}
          className="h-12 font-semibold">1</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("2")}
          className="h-12 font-semibold">2</Button>
        <Button type="button" variant="outline" onClick={() => onNumber("3")}
          className="h-12 font-semibold">3</Button>
        <Button type="button" variant="outline" onClick={onEquals}
          className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg row-span-2">=</Button>

        <Button type="button" variant="outline" onClick={() => onNumber("0")}
          className="h-12 font-semibold col-span-2">0</Button>
        <Button type="button" variant="outline" onClick={onDecimal}
          className="h-12 font-semibold bg-transparent">.</Button>
      </div>
    </div>
  )
}
