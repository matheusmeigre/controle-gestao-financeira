"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

interface DatePickerProps {
  value?: string // formato: YYYY-MM-DD
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  minDate?: string
  maxDate?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  id,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(value || "")
  
  // Helper para criar Date local sem problemas de timezone
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  
  const [viewDate, setViewDate] = React.useState(
    value ? createLocalDate(value) : new Date()
  )

  React.useEffect(() => {
    if (value !== selectedDate) {
      setSelectedDate(value || "")
      if (value) {
        setViewDate(createLocalDate(value))
      }
    }
  }, [value])

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString)
    onChange?.(dateString)
    setOpen(false)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = createLocalDate(dateString)
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return ""
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(viewDate)

  const previousMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const isDateDisabled = (dateString: string) => {
    if (disabled) return true
    if (minDate && dateString < minDate) return true
    if (maxDate && dateString > maxDate) return true
    return false
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-9" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const isSelected = dateString === selectedDate
    const isToday = dateString === format(new Date(), "yyyy-MM-dd")
    const isDisabled = isDateDisabled(dateString)

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => !isDisabled && handleDateSelect(dateString)}
        disabled={isDisabled}
        className={`
          h-9 w-9 rounded-md text-sm font-normal
          ${isSelected
            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            : isToday
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          transition-colors
        `}
      >
        {day}
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className={cn(!selectedDate && "text-muted-foreground")}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Header com navegação */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              className="h-7 w-7 bg-transparent p-0 hover:bg-accent rounded-md transition-colors"
            >
              <span className="sr-only">Mês anterior</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="font-semibold text-sm">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="h-7 w-7 bg-transparent p-0 hover:bg-accent rounded-md transition-colors"
            >
              <span className="sr-only">Próximo mês</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-9 w-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
              >
                {day}
              </div>
            ))}
            {days}
          </div>

          {/* Atalhos */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => {
                const today = format(new Date(), "yyyy-MM-dd")
                if (!isDateDisabled(today)) {
                  handleDateSelect(today)
                }
              }}
            >
              Hoje
            </Button>
            {selectedDate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  setSelectedDate("")
                  onChange?.("")
                  setOpen(false)
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
