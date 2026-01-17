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
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: {
      icon: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    success: {
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    warning: {
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    error: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  }

  const styles = variantStyles[variant]
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    : value

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{formattedValue}</p>
            
            {trend && (
              <p className={cn(
                'text-xs mt-2 font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}% {trend.label}
              </p>
            )}
          </div>
          
          <div className={cn(
            'flex items-center justify-center h-12 w-12 rounded-full',
            styles.iconBg
          )}>
            <Icon className={cn('h-6 w-6', styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
