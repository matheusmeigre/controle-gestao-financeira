/**
 * MainNavigation Component
 * 
 * Navegação principal do dashboard (tabs + botão de cartões)
 */

import React from 'react'
import Link from 'next/link'
import { Receipt, CreditCard, DollarSign, Wallet, Target } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

type MainNavigationProps = {
  activeTab: 'expenses' | 'cards' | 'incomes'
  onTabChange: (tab: 'expenses' | 'cards' | 'incomes') => void
}

export function MainNavigation({ activeTab, onTabChange }: MainNavigationProps) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as 'expenses' | 'cards' | 'incomes')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger
            value="expenses"
            className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
          >
            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline">Gastos Gerais</span>
            <span className="xs:hidden">Gastos</span>
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
          >
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline">Faturas de Cartão</span>
            <span className="xs:hidden">Faturas</span>
          </TabsTrigger>
          <TabsTrigger
            value="incomes"
            className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-2 text-xs sm:text-sm"
          >
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span>Rendas</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Botões de Ações Rápidas */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Link href="/planning" className="flex-1 sm:flex-initial">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-10"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Planejamento</span>
            <span className="sm:hidden">Planos</span>
          </Button>
        </Link>

        <Link href="/cards" className="flex-1 sm:flex-initial">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-10"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Gestão de Cartões</span>
            <span className="sm:hidden">Cartões</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
