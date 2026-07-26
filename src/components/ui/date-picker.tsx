'use client'

import type { ComponentProps } from 'react'
import { CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type DatePickerProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'min' | 'max'> & {
  value?: string
  onChange?: (date: string) => void
  minDate?: string
  maxDate?: string
}

export function DatePicker({
  value = '',
  onChange,
  minDate,
  maxDate,
  className,
  ...props
}: DatePickerProps) {
  return (
    <div className="relative">
      <CalendarDays
        className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        {...props}
        type="date"
        value={value}
        min={minDate}
        max={maxDate}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn('pl-10', className)}
      />
    </div>
  )
}
