/**
 * StatusBadge Component
 * 
 * Badge visual para indicar status (positivo, negativo, neutro)
 */

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
      bg: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: TrendingUp,
    },
    negative: {
      bg: 'bg-red-50 dark:bg-red-950',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: TrendingDown,
    },
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-950',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-800',
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
