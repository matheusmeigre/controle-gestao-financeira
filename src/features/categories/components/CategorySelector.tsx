/**
 * CategorySelector Component
 * 
 * Seletor visual moderno de categorias com ícones
 */

import React from 'react'
import { CategoryBadge } from './CategoryBadge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CategorySelectorProps {
  categories: string[]
  value: string
  onChange: (category: string) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function CategorySelector({ 
  categories, 
  value, 
  onChange, 
  label,
  disabled = false,
  className 
}: CategorySelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            disabled={disabled}
            onClick={() => onChange(category)}
            className={cn(
              'group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all',
              'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              value === category
                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                : 'border-border bg-card hover:border-border/80 dark:hover:border-border'
            )}
          >
            <div className="flex items-center gap-2">
              <CategoryBadge 
                category={category} 
                size="sm" 
                showIcon={true}
                variant={value === category ? 'default' : 'outline'}
              />
            </div>
            
            {/* Indicador de seleção */}
            {value === category && (
              <div className="absolute top-1 right-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
