'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface MonthYearPickerProps {
  value: { month: number; year: number }
  onChange: (value: { month: number; year: number }) => void
  disabled?: boolean
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export function MonthYearPicker({ value, onChange, disabled }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handlePrevMonth = () => {
    const newMonth = value.month === 1 ? 12 : value.month - 1
    const newYear = value.month === 1 ? value.year - 1 : value.year
    onChange({ month: newMonth, year: newYear })
  }
  
  const handleNextMonth = () => {
    const newMonth = value.month === 12 ? 1 : value.month + 1
    const newYear = value.month === 12 ? value.year + 1 : value.year
    onChange({ month: newMonth, year: newYear })
  }
  
  const handleMonthSelect = (month: number) => {
    onChange({ ...value, month })
    setIsOpen(false)
  }
  
  const handleYearChange = (delta: number) => {
    onChange({ ...value, year: value.year + delta })
  }
  
  const currentMonth = MONTHS[value.month - 1]
  
  return (
    <div className="space-y-2">
      <Label>Competência (Mês/Ano)</Label>
      
      {/* Navegação Rápida */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          <span className="font-medium">
            {currentMonth} / {value.year}
          </span>
        </button>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Dropdown Picker */}
      {isOpen && (
        <div className="rounded-lg border bg-card p-4 shadow-lg space-y-4">
          {/* Year Selector */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg">{value.year}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_SHORT.map((month, index) => {
              const monthNumber = index + 1
              const isSelected = monthNumber === value.month
              
              return (
                <Button
                  key={month}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMonthSelect(monthNumber)}
                  className="w-full"
                >
                  {month}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
