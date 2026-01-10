'use client'

import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface CreditLimitInputProps {
  value?: number
  onChange: (value: number | undefined) => void
  disabled?: boolean
}

export function CreditLimitInput({ value, onChange, disabled }: CreditLimitInputProps) {
  const [rangeValue, setRangeValue] = useState(value || 5000)
  const [inputValue, setInputValue] = useState(value?.toString() || '')
  const [isEditing, setIsEditing] = useState(false)
  
  const MIN = 500
  const MAX = 50000
  const STEP = 500
  
  useEffect(() => {
    if (value !== undefined && !isEditing) {
      setRangeValue(value)
      setInputValue(value.toString())
    } else if (value === undefined && !isEditing) {
      setInputValue('')
    }
  }, [value, isEditing])
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setRangeValue(newValue)
    setInputValue(newValue.toString())
    onChange(newValue)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setInputValue(rawValue)
    
    if (rawValue) {
      const numValue = parseInt(rawValue)
      if (numValue >= MIN && numValue <= MAX) {
        setRangeValue(numValue)
        onChange(numValue)
      }
    } else {
      onChange(undefined)
    }
  }
  
  const handleInputFocus = () => {
    setIsEditing(true)
  }
  
  const handleInputBlur = () => {
    setIsEditing(false)
    
    if (!inputValue) {
      setRangeValue(MIN)
      onChange(undefined)
      return
    }
    
    const numValue = parseInt(inputValue)
    if (numValue < MIN) {
      setRangeValue(MIN)
      setInputValue(MIN.toString())
      onChange(MIN)
    } else if (numValue > MAX) {
      setRangeValue(MAX)
      setInputValue(MAX.toString())
      onChange(MAX)
    }
  }
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }
  
  return (
    <div className="space-y-4">
      <Label htmlFor="creditLimit">Limite de Crédito (Opcional)</Label>
      
      {/* Display atual do valor */}
      <div className="flex items-center gap-2 text-2xl font-bold text-primary">
        <DollarSign className="h-6 w-6" />
        <span>{formatCurrency(rangeValue)}</span>
      </div>
      
      {/* Range Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={rangeValue}
          onChange={handleRangeChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        
        {/* Marcadores de min/max */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(MIN)}</span>
          <span>{formatCurrency(MAX)}</span>
        </div>
      </div>
      
      {/* Input para digitação manual */}
      <div className="relative">
        <div className="absolute left-3 top-2.5 text-muted-foreground">R$</div>
        <Input
          id="creditLimit"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder="Digite ou use o controle acima"
          className="pl-10"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Arraste o controle ou digite o valor desejado (entre {formatCurrency(MIN)} e {formatCurrency(MAX)})
      </p>
    </div>
  )
}
