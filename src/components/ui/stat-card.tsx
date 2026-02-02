/**
 * StatCard Component
 * 
 * Card de estatística visual com ícone e variação
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'error' | 'highlight'
  className?: string
  formatAsNumber?: boolean // Para números inteiros sem formatação monetária
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default', 
  className,
  formatAsNumber = false 
}: StatCardProps) {
  const variantStyles = {
    default: {
      icon: 'text-foreground/60',
      iconBg: 'bg-muted',
      border: 'border-border',
    },
    success: {
      icon: 'text-green-600 dark:text-green-500',
      iconBg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
    },
    warning: {
      icon: 'text-amber-600 dark:text-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
    },
    error: {
      icon: 'text-red-600 dark:text-red-500',
      iconBg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
    },
    highlight: {
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
      border: 'border-primary/20',
    },
  }

  const styles = variantStyles[variant]
  
  // Formatação condicional
  let formattedValue: string
  if (formatAsNumber && typeof value === 'number') {
    formattedValue = value.toString()
  } else if (typeof value === 'number') {
    formattedValue = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  } else {
    formattedValue = value
  }

  return (
    <Card className={cn(
      'hover:shadow-sm transition-all duration-150 border',
      styles.border,
      variant === 'highlight' && 'shadow-sm',
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className={cn(
              "font-semibold tracking-tight",
              formatAsNumber ? "text-3xl" : "text-2xl font-mono"
            )}>
              {formattedValue}
            </p>
            
            {trend && (
              <p className={cn(
                'text-xs mt-2 font-medium flex items-center gap-1',
                trend.value >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              )}>
                <span>{trend.value >= 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value).toFixed(1)}% {trend.label}</span>
              </p>
            )}
          </div>
          
          <div className={cn(
            'flex items-center justify-center h-10 w-10 rounded-lg flex-shrink-0',
            styles.iconBg
          )}>
            <Icon className={cn('h-5 w-5', styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
