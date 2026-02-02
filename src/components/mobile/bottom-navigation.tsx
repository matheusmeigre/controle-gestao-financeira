'use client'

/**
 * BottomNavigation Component
 * 
 * Navegação fixa inferior otimizada para mobile (thumb-friendly)
 * Segue padrão Material Design 3 e apps financeiros modernos
 */

import { Home, FileText, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavigationTab = 'home' | 'transactions' | 'reports' | 'profile'

interface BottomNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

const navItems = [
  { id: 'home' as const, label: 'Início', icon: Home },
  { id: 'transactions' as const, label: 'Extrato', icon: FileText },
  { id: 'reports' as const, label: 'Relatórios', icon: BarChart3 },
  { id: 'profile' as const, label: 'Perfil', icon: User },
]

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg md:hidden"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-14 px-2 rounded-xl transition-all duration-200 active:scale-95",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={cn(
                  "text-[10px] font-medium mt-0.5",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
