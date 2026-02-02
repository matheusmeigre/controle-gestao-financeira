'use client'

import { useState } from 'react'
import { Receipt, ChevronDown, ChevronUp, Edit2, Users, Calendar, CreditCard as CreditCardIcon, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from '../types'
import type { CreditCard } from '@/features/cards/types'
import { InvoiceEditModal } from './InvoiceEditModal'

interface InvoicesListProps {
  invoices: Invoice[]
  cards: CreditCard[]
  onUpdateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function InvoicesList({ invoices, cards, onUpdateInvoice }: InvoicesListProps) {
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set())
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  const toggleExpanded = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices)
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId)
    } else {
      newExpanded.add(invoiceId)
    }
    setExpandedInvoices(newExpanded)
  }

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    return card ? `${card.nickname} (•••• ${card.last4Digits})` : 'Cartão desconhecido'
  }

  const getCardColor = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    // Cores baseadas no banco
    const bankColors: Record<string, string> = {
      'Nubank': 'bg-purple-100 text-purple-800 border-purple-200',
      'Inter': 'bg-orange-100 text-orange-800 border-orange-200',
      'Itaú': 'bg-blue-100 text-blue-800 border-blue-200',
      'Bradesco': 'bg-red-100 text-red-800 border-red-200',
      'C6 Bank': 'bg-gray-100 text-gray-800 border-gray-200',
      'BTG Pactual': 'bg-blue-100 text-blue-800 border-blue-200',
      'PicPay': 'bg-green-100 text-green-800 border-green-200',
    }

    const colorKey = Object.keys(bankColors).find(key => 
      card.bankName.toLowerCase().includes(key.toLowerCase())
    )

    return colorKey ? bankColors[colorKey] : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  // Agrupa faturas por competência (Ano/Mês)
  const groupedInvoices = invoices.reduce((acc, invoice) => {
    const key = `${invoice.year}-${invoice.month}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(invoice)
    return acc
  }, {} as Record<string, Invoice[]>)

  // Ordena as competências (mais recente primeiro)
  const sortedKeys = Object.keys(groupedInvoices).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number)
    const [yearB, monthB] = b.split('-').map(Number)
    if (yearA !== yearB) return yearB - yearA
    return monthB - monthA
  })

  if (invoices.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</h3>
          <p className="text-muted-foreground text-center max-w-md">
            As faturas dos seus cartões aparecerão aqui automaticamente quando você registrar compras no gerenciamento de cartões.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {sortedKeys.map(key => {
          const [year, month] = key.split('-').map(Number)
          const monthInvoices = groupedInvoices[key]
          const totalAmount = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
          
          return (
            <div key={key} className="space-y-3">
              {/* Header da competência */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {MONTHS[month - 1]} {year}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {monthInvoices.length} {monthInvoices.length === 1 ? 'fatura' : 'faturas'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              {/* Lista de faturas */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {monthInvoices.map(invoice => {
                  const isExpanded = expandedInvoices.has(invoice.id!)
                  const card = cards.find(c => c.id === invoice.cardId)
                  
                  return (
                    <Card 
                      key={invoice.id} 
                      className={`transition-all ${invoice.isPaid ? 'border-green-200 dark:border-green-800' : ''}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border mb-2 ${getCardColor(invoice.cardId)}`}>
                              <CreditCardIcon className="h-3 w-3" />
                              <span className="truncate">{getCardName(invoice.cardId)}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={invoice.isPaid ? 'default' : 'secondary'} className="text-xs">
                                {invoice.isPaid ? '✓ Paga' : 'Pendente'}
                              </Badge>
                              {invoice.items.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Informações principais */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Total
                            </span>
                            <span className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</span>
                          </div>
                          
                          {invoice.paidAmount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Pago</span>
                              <span className="font-semibold text-green-600 dark:text-green-500">
                                {formatCurrency(invoice.paidAmount)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimento
                            </span>
                            <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => toggleExpanded(invoice.id!)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Ver itens
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setEditingInvoice(invoice)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>

                        {/* Itens expandidos */}
                        {isExpanded && invoice.items.length > 0 && (
                          <div className="pt-3 border-t space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              Itens da fatura
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {invoice.items.map(item => (
                                <div 
                                  key={item.id} 
                                  className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.description}</p>
                                    <p className="text-muted-foreground text-[10px]">
                                      {formatDate(item.date)} • {item.category}
                                    </p>
                                    {item.installment && (
                                      <p className="text-muted-foreground text-[10px]">
                                        Parcela {item.installment}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-semibold whitespace-nowrap">
                                    {formatCurrency(item.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de edição */}
      {editingInvoice && (
        <InvoiceEditModal
          invoice={editingInvoice}
          card={cards.find(c => c.id === editingInvoice.cardId)}
          onClose={() => setEditingInvoice(null)}
          onSave={async (updates: Partial<Invoice>) => {
            await onUpdateInvoice(editingInvoice.id!, updates)
            setEditingInvoice(null)
          }}
        />
      )}
    </>
  )
}
