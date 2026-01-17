'use client'

import { useEffect, useState } from 'react'
import { Receipt, Plus, Filter, Home, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { InvoiceRepository } from '@/features/invoices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const STORAGE_KEY = 'credit_cards'

export default function InvoicesPage() {
  const { user } = useUser()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!user?.id) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Carrega faturas
        const invoiceRepo = new InvoiceRepository()
        const userInvoices = await invoiceRepo.findAll(user.id)
        setInvoices(userInvoices)
        
        // Carrega cartões
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const allCards: CardType[] = JSON.parse(stored)
          const userCards = allCards.filter(c => c.userId === user.id && c.isActive)
          setCards(userCards)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user?.id])
  
  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    return card ? `${card.nickname} (•••• ${card.last4Digits})` : 'Cartão desconhecido'
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando faturas...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Navegação */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </Link>
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Gerenciar Cartões
          </Button>
        </Link>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturas de Cartão</h1>
          <p className="text-muted-foreground">
            Gerencie suas faturas e competências
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Fatura
          </Button>
        </Link>
      </div>
      
      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crie sua primeira fatura ou importe automaticamente de um arquivo.
            </p>
            <Link href="/invoices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Fatura
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map(invoice => {
            const percentage = invoice.totalAmount > 0
              ? (invoice.paidAmount / invoice.totalAmount) * 100
              : 0
            
            return (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {MONTHS[invoice.month - 1]} {invoice.year}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getCardName(invoice.cardId)}
                        </CardDescription>
                      </div>
                      {invoice.isPaid ? (
                        <Badge className="bg-green-500">Paga</Badge>
                      ) : (
                        <Badge variant="outline">Pendente</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-lg">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(invoice.totalAmount)}
                        </span>
                      </div>
                      
                      {invoice.paidAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Pago</span>
                          <span className="text-green-600 font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(invoice.paidAmount)}
                          </span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      {invoice.paidAmount > 0 && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Itens</span>
                        <span className="font-medium">{invoice.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Vencimento</span>
                        <span className="font-medium">
                          {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
