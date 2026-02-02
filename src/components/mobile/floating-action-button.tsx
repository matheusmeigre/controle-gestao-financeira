'use client'

/**
 * FloatingActionButton Component
 * 
 * Botão de ação principal flutuante (FAB) para adicionar transações rapidamente
 * Posicionado na área de alcance do polegar (Mobile-First Design)
 */

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function FloatingActionButton({ 
  onClick, 
  label = 'Nova transação',
  className 
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles - Material Design 3 FAB
        "fixed z-40 flex items-center justify-center",
        "bg-primary text-primary-foreground",
        "rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-200 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        
        // Mobile-first positioning (thumb zone)
        "bottom-20 right-4 w-14 h-14",
        
        // Tablet/Desktop - optional repositioning
        "md:bottom-6 md:right-6 md:w-16 md:h-16",
        
        className
      )}
      aria-label={label}
    >
      <Plus className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
    </button>
  )
}

/**
 * Extended FAB with label (Material Design 3)
 * Usado quando há espaço suficiente
 */
interface ExtendedFABProps {
  onClick: () => void
  label: string
  icon?: React.ReactNode
}

export function ExtendedFAB({ onClick, label, icon }: ExtendedFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40 flex items-center gap-2 px-4",
        "bg-primary text-primary-foreground",
        "rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-200 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "bottom-20 right-4 h-14",
        "md:bottom-6 md:right-6 md:h-16"
      )}
      aria-label={label}
    >
      {icon || <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />}
      <span className="font-semibold text-sm md:text-base">
        {label}
      </span>
    </button>
  )
}
