/**
 * CardsTabContent Component
 * 
 * Conteúdo da aba de faturas de cartão
 */

import React from 'react'
import { CardBillFormV2 } from '@/components/card-bill-form-v2'
import { CardBillsListV2 } from '@/components/card-bills-list-v2'
import { CardSummary } from '@/components/card-summary'
import { CategoryFilter } from '@/components/category-filter'
import { CATEGORIES } from '@/features/categories'
import type { CardBill } from '@/types/expense'

type CardsTabContentProps = {
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  currentMonthCardBills: CardBill[]
  filteredCardBills: CardBill[]
  onAddCardBill: (cardBill: Omit<CardBill, 'id' | 'date' | 'userId'>) => void
  onUpdateCardBill: (id: string, updates: Partial<CardBill>) => void
  onDeleteCardBill: (id: string) => void
}

export function CardsTabContent({
  categoryFilter,
  onCategoryFilterChange,
  currentMonthCardBills,
  filteredCardBills,
  onAddCardBill,
  onUpdateCardBill,
  onDeleteCardBill,
}: CardsTabContentProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <CardSummary cardBills={currentMonthCardBills} />

      {/* Filtro de categoria */}
      <div className="flex justify-end">
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={categoryFilter}
          onCategoryChange={onCategoryFilterChange}
        />
      </div>
      
      <div className="bg-muted/50 border border-dashed rounded-lg p-4 text-sm text-muted-foreground">
        💡 <strong>Dica:</strong> Use o botão <strong>+</strong> no canto inferior direito para adicionar novas faturas de cartão.
      </div>

      <CardBillsListV2
        cardBills={filteredCardBills}
        onDeleteCardBill={onDeleteCardBill}
        onUpdateCardBill={onUpdateCardBill}
      />
    </div>
  )
}
