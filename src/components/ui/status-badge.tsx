import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusType = 'positive' | 'negative' | 'neutral'

interface StatusBadgeProps {
  value: number
  showIcon?: boolean
  showValue?: boolean
  className?: string
}

export function StatusBadge({ value, showIcon = true, showValue = true, className }: StatusBadgeProps) {
  const status: StatusType = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'

  const statusConfig = {
    positive: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
      icon: TrendingUp,
    },
    negative: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      border: 'border-destructive/20',
      icon: TrendingDown,
    },
    neutral: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Minus,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(value))

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium text-sm transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      {showValue && <span>{formattedValue}</span>}
    </div>
  )
}
