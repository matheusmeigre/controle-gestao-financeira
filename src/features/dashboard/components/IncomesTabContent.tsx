/**
 * IncomesTabContent Component
 * 
 * Conteúdo da aba de rendas
 */

import React from 'react'
import { IncomeForm, IncomeList, IncomeSummary } from '@/features/incomes'
import { CategoryFilter } from '@/components/category-filter'
import { INCOME_CATEGORIES } from '@/types/expense'
import type { Income } from '@/types/expense'

type IncomesTabContentProps = {
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  currentMonthIncomes: Income[]
  filteredIncomes: Income[]
  onAddIncome: (income: Omit<Income, 'id' | 'date' | 'userId'>) => void
  onDeleteIncome: (id: string) => void
  onMarkIncomeAsReceived: (id: string) => void
}

export function IncomesTabContent({
  categoryFilter,
  onCategoryFilterChange,
  currentMonthIncomes,
  filteredIncomes,
  onAddIncome,
  onDeleteIncome,
  onMarkIncomeAsReceived,
}: IncomesTabContentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <IncomeSummary incomes={currentMonthIncomes} />

      {/* Filtro de categoria */}
      <div className="flex justify-end">
        <CategoryFilter
          categories={INCOME_CATEGORIES}
          selectedCategory={categoryFilter}
          onCategoryChange={onCategoryFilterChange}
        />
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-1">
          <IncomeForm onAddIncome={onAddIncome} />
        </div>

        <div className="order-2">
          <IncomeList
            incomes={filteredIncomes}
            onDeleteIncome={onDeleteIncome}
            onMarkAsReceived={onMarkIncomeAsReceived}
          />
        </div>
      </div>
    </div>
  )
}
