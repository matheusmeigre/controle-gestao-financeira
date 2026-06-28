'use client'

import { Home, Wallet, Receipt, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavigationTab } from './bottom-navigation'

interface DesktopNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export function DesktopNavigation({ activeTab, onTabChange }: DesktopNavigationProps) {
  const navItems = [
    { id: 'home' as NavigationTab, label: 'Início', icon: Home },
    { id: 'transactions' as NavigationTab, label: 'Transações', icon: Wallet },
    { id: 'invoices' as NavigationTab, label: 'Faturas', icon: Receipt },
    { id: 'profile' as NavigationTab, label: 'Perfil', icon: User },
  ]

  return (
    <nav className="hidden md:flex items-center gap-1 bg-card border rounded-lg p-0.5 mb-6">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
