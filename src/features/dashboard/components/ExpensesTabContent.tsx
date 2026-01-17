/**
 * ExpensesTabContent Component
 * 
 * Conteúdo da aba de despesas (gastos gerais + assinaturas)
 */

import React from 'react'
import { Receipt, RefreshCw } from 'lucide-react'
import { ExpenseForm, ExpenseList, ExpenseSummary } from '@/features/expenses'
import { SubscriptionForm, SubscriptionList, SubscriptionSummary } from '@/features/subscriptions'
import { CategoryFilter } from '@/components/category-filter'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CATEGORIES } from '@/features/categories'
import type { Expense } from '@/types/expense'

type ExpensesTabContentProps = {
  subTab: 'general' | 'subscriptions'
  onSubTabChange: (tab: 'general' | 'subscriptions') => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  currentMonthExpenses: Expense[]
  filteredGeneralExpenses: Expense[]
  filteredSubscriptions: Expense[]
  onAddExpense: (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => void
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void
  onDeleteExpense: (id: string) => void
}

export function ExpensesTabContent({
  subTab,
  onSubTabChange,
  categoryFilter,
  onCategoryFilterChange,
  currentMonthExpenses,
  filteredGeneralExpenses,
  filteredSubscriptions,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}: ExpensesTabContentProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <ExpenseSummary
        expenses={currentMonthExpenses.filter((e) => e.category !== 'Assinaturas')}
      />

      {/* Sub-abas para Gastos Gerais e Assinaturas */}
      <div className="flex items-center justify-between">
        <Tabs
          value={subTab}
          onValueChange={(v) => onSubTabChange(v as 'general' | 'subscriptions')}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1">
            <TabsTrigger
              value="general"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Gastos Gerais</span>
              <span className="xs:hidden">Gerais</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Assinaturas</span>
              <span className="xs:hidden">Assinat.</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filtro de categoria */}
      <div className="flex justify-end">
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={categoryFilter}
          onCategoryChange={onCategoryFilterChange}
        />
      </div>

      {subTab === 'general' ? (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-1">
            <ExpenseForm onAddExpense={onAddExpense} />
          </div>

          <div className="order-2">
            <ExpenseList
              expenses={filteredGeneralExpenses}
              onUpdateExpense={onUpdateExpense}
              onDeleteExpense={onDeleteExpense}
            />
          </div>
        </div>
      ) : (
        <>
          <SubscriptionSummary subscriptions={filteredSubscriptions} />

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="order-1">
              <SubscriptionForm onAddSubscription={onAddExpense} />
            </div>

            <div className="order-2">
              <SubscriptionList
                subscriptions={filteredSubscriptions}
                onUpdateSubscription={onUpdateExpense}
                onDeleteSubscription={onDeleteExpense}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
