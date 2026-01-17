/**
 * CategoryBadge Component
 * 
 * Badge visual moderno para exibir categorias com ícones e cores
 */

import React from 'react'
import { 
  Utensils, Car, Heart, GraduationCap, Home, 
  Sparkles, Shirt, RefreshCw, FileText, TrendingUp, 
  DollarSign, Briefcase, Gift, ShoppingCart, HelpCircle 
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

// Mapeamento de categorias para ícones e cores
const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  'Alimentação': { icon: Utensils, color: 'text-orange-600 bg-orange-100 border-orange-200' },
  'Transporte': { icon: Car, color: 'text-blue-600 bg-blue-100 border-blue-200' },
  'Saúde': { icon: Heart, color: 'text-red-600 bg-red-100 border-red-200' },
  'Educação': { icon: GraduationCap, color: 'text-purple-600 bg-purple-100 border-purple-200' },
  'Moradia': { icon: Home, color: 'text-green-600 bg-green-100 border-green-200' },
  'Lazer': { icon: Sparkles, color: 'text-pink-600 bg-pink-100 border-pink-200' },
  'Vestuário': { icon: Shirt, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
  'Assinaturas': { icon: RefreshCw, color: 'text-cyan-600 bg-cyan-100 border-cyan-200' },
  'Impostos e Taxas': { icon: FileText, color: 'text-gray-600 bg-gray-100 border-gray-200' },
  'Investimentos': { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  'Salário': { icon: DollarSign, color: 'text-green-600 bg-green-100 border-green-200' },
  'Freelance': { icon: Briefcase, color: 'text-blue-600 bg-blue-100 border-blue-200' },
  'Rendimentos de Investimentos': { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  'Bônus': { icon: Gift, color: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
  'Presentes': { icon: Gift, color: 'text-pink-600 bg-pink-100 border-pink-200' },
  'Vendas': { icon: ShoppingCart, color: 'text-violet-600 bg-violet-100 border-violet-200' },
  'Outros': { icon: HelpCircle, color: 'text-gray-600 bg-gray-100 border-gray-200' },
}

export function CategoryBadge({ 
  category, 
  size = 'md', 
  showIcon = true,
  variant = 'default',
  className 
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Outros']
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <Badge 
      variant={variant}
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all',
        variant === 'default' && config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{category}</span>
    </Badge>
  )
}
