"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number
  onChange?: (value: number) => void
  maxValue?: number
}

export function CurrencyInput({ 
  value = 0, 
  onChange,
  maxValue = 9999999.99, // Limite de 9 milhões
  className,
  ...props 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  // Formata o número para exibição
  const formatDisplay = (num: number): string => {
    if (num === 0) return ''
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Atualiza o display quando o valor externo muda
  React.useEffect(() => {
    setDisplayValue(formatDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Remove todos os caracteres não numéricos
    const numbersOnly = input.replace(/\D/g, '')

    if (numbersOnly === '') {
      setDisplayValue('')
      onChange?.(0)
      return
    }

    // Converte para número (centavos)
    const cents = parseInt(numbersOnly, 10)
    const newValue = cents / 100

    // Verifica se excede o limite
    if (newValue > maxValue) {
      return
    }

    // Atualiza o valor
    setDisplayValue(formatDisplay(newValue))
    onChange?.(newValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleciona todo o texto ao focar
    e.target.select()
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        R$
      </span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        className={`pl-10 ${className}`}
        placeholder="0,00"
      />
    </div>
  )
}
