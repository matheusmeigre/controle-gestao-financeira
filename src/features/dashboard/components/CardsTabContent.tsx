/**
 * CardsTabContent Component
 * 
 * Conteúdo da aba de faturas de cartão
 */

/**
 * CardsTabContent Component
 * 
 * Conteúdo da aba de faturas de cartão
 * Exibe tanto CardBills (sistema antigo) quanto Invoices (sistema novo de gerenciamento de cartões)
 */

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { CardBillFormV2 } from '@/components/card-bill-form-v2'
import { CardBillsListV2 } from '@/components/card-bills-list-v2'
import { CardSummary } from '@/components/card-summary'
import { CategoryFilter } from '@/components/category-filter'
import { CATEGORIES } from '@/features/categories'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Receipt, CreditCard, AlertCircle, Filter } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CardBill } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'

type CardsTabContentProps = {
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  currentMonthCardBills: CardBill[]
  filteredCardBills: CardBill[]
  invoices?: Invoice[] // Adicionado suporte para Invoices
  onAddCardBill: (cardBill: Omit<CardBill, 'id' | 'date' | 'userId'>) => void
  onUpdateCardBill: (id: string, updates: Partial<CardBill>) => void
  onDeleteCardBill: (id: string) => void
}

export function CardsTabContent({
  categoryFilter,
  onCategoryFilterChange,
  currentMonthCardBills,
  filteredCardBills,
  invoices = [],
  onAddCardBill,
  onUpdateCardBill,
  onDeleteCardBill,
}: CardsTabContentProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>('all')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Extrai cartões únicos das faturas
  const availableCards = useMemo(() => {
    const cardIds = new Set(invoices.map(inv => inv.cardId))
    return Array.from(cardIds)
  }, [invoices])

  // Filtra faturas por cartão selecionado
  const filteredInvoices = useMemo(() => {
    if (selectedCardId === 'all') return invoices
    return invoices.filter(inv => inv.cardId === selectedCardId)
  }, [invoices, selectedCardId])

  return (
    <div className="space-y-6 sm:space-y-8">
      <CardSummary cardBills={currentMonthCardBills} />

      {/* Faturas do Sistema de Gerenciamento de Cartões */}
      {invoices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Faturas dos Cartões
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredInvoices.length})
              </span>
            </h3>
            
            <div className="flex items-center gap-2">
              {/* Filtro por Cartão */}
              {availableCards.length > 1 && (
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os cartões</SelectItem>
                    {availableCards.map(cardId => (
                      <SelectItem key={cardId} value={cardId}>
                        Cartão {cardId.slice(-4)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Link href="/invoices">
                <Button variant="outline" size="sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerenciar Faturas
                </Button>
              </Link>
            </div>
          </div>

          {filteredInvoices.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvoices.map((invoice) => (
                <Link key={invoice.id} href="/invoices">
                  <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">
                          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][invoice.month - 1]} {invoice.year}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      {invoice.isPaid ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded">
                          ✓ Paga
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-medium rounded">
                          Pendente
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-lg font-bold">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    
                    {invoice.paidAmount > 0 && (
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Pago</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-500">
                          {formatCurrency(invoice.paidAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">
                Nenhuma fatura encontrada para este filtro
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alerta informativo */}
      {invoices.length > 0 && currentMonthCardBills.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Suas faturas de cartão estão sendo gerenciadas no módulo de <Link href="/cards" className="underline font-medium">Cartões</Link>. 
            Clique em "Gerenciar Faturas" acima para editar e dividir os valores entre pessoas.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtro de categoria - apenas se houver CardBills */}
      {currentMonthCardBills.length > 0 && (
        <>
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
        </>
      )}

      {/* Mensagem quando não há faturas */}
      {invoices.length === 0 && currentMonthCardBills.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma fatura de cartão registrada</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Gerencie seus cartões e suas faturas serão exibidas aqui automaticamente
          </p>
          <Link href="/cards">
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Gerenciar Cartões
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
