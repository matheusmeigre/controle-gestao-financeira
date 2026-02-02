'use client'

/**
 * MobileLayout Component
 * 
 * Layout wrapper que gerencia espaçamento e comportamento mobile-first
 * Garante que conteúdo não seja coberto pela bottom navigation
 */

import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
  hasBottomNav?: boolean
  hasFAB?: boolean
  className?: string
}

export function MobileLayout({ 
  children, 
  hasBottomNav = true,
  hasFAB = true,
  className 
}: MobileLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-background",
        // Adiciona padding bottom para não cobrir conteúdo
        hasBottomNav && "pb-16 md:pb-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * MobileContainer
 * Container otimizado para conteúdo scrollável em mobile
 */
interface MobileContainerProps {
  children: React.ReactNode
  className?: string
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-3 py-4",
        "sm:px-4 sm:py-6",
        "md:px-6 md:py-8",
        "max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * MobileSectionHeader
 * Cabeçalho de seção otimizado para mobile
 */
interface MobileSectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function MobileSectionHeader({ title, subtitle, action }: MobileSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground md:text-xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 md:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
