'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CreditCard as CreditCardIcon, DollarSign, Receipt, Home, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { InvoiceRepository } from '@/features/invoices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const STORAGE_KEY = 'credit_cards'

export default function InvoiceDetailPage({
  params,
}: {
  params: { invoiceId: string }
}) {
  const { user } = useUser()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [card, setCard] = useState<CardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paidAmount, setPaidAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Calcula o status da fatura
  const getInvoiceStatus = () => {
    if (!invoice) return 'Pendente'
    
    if (invoice.isPaid || invoice.paidAmount >= invoice.totalAmount) {
      return 'Paga'
    }
    
    const dueDate = new Date(invoice.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    if (dueDate < today) {
      return 'Atrasada'
    }
    
    return 'Pendente'
  }
  
  const status = getInvoiceStatus()
  
  const handlePaymentUpdate = async () => {
    if (!user?.id || !invoice) return
    
    const amount = parseFloat(paidAmount.replace(/[^\d,]/g, '').replace(',', '.'))
    
    if (isNaN(amount) || amount < 0) {
      alert('Digite um valor válido')
      return
    }
    
    if (amount > invoice.totalAmount) {
      if (!confirm('O valor informado é maior que o total da fatura. Deseja continuar?')) {
        return
      }
    }
    
    try {
      setIsSaving(true)
      const invoiceRepo = new InvoiceRepository()
      
      const updatedInvoice = {
        ...invoice,
        paidAmount: amount,
        isPaid: amount >= invoice.totalAmount,
        updatedAt: new Date(),
      }
      
      await invoiceRepo.update(user.id, invoice.id, updatedInvoice)
      setInvoice(updatedInvoice)
      setPaidAmount('')
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
      alert('Erro ao salvar pagamento')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleMarkAsPaid = async () => {
    if (!user?.id || !invoice) return
    
    try {
      setIsSaving(true)
      const invoiceRepo = new InvoiceRepository()
      
      const updatedInvoice = {
        ...invoice,
        paidAmount: invoice.totalAmount,
        isPaid: true,
        updatedAt: new Date(),
      }
      
      await invoiceRepo.update(user.id, invoice.id, updatedInvoice)
      setInvoice(updatedInvoice)
    } catch (error) {
      console.error('Erro ao marcar como paga:', error)
      alert('Erro ao marcar fatura como paga')
    } finally {
      setIsSaving(false)
    }
  }
  
  useEffect(() => {
    if (!user?.id) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Carrega a fatura
        const invoiceRepo = new InvoiceRepository()
        const foundInvoice = await invoiceRepo.findById(user.id, params.invoiceId)
        
        if (!foundInvoice) {
          router.push('/invoices')
          return
        }
        
        setInvoice(foundInvoice)
        
        // Carrega o cartão
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const allCards: CardType[] = JSON.parse(stored)
          const foundCard = allCards.find(c => c.id === foundInvoice.cardId && c.userId === user.id)
          setCard(foundCard || null)
        }
      } catch (error) {
        console.error('Erro ao carregar fatura:', error)
        router.push('/invoices')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user?.id, params.invoiceId, router])
  
  if (isLoading || !invoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando fatura...</div>
        </div>
      </div>
    )
  }
  
  const percentage = invoice.totalAmount > 0
    ? (invoice.paidAmount / invoice.totalAmount) * 100
    : 0
  
  // Group items by category
  const itemsByCategory = invoice.items.reduce((acc, item) => {
    const category = item.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, typeof invoice.items>)
  
  const categoryTotals = Object.entries(itemsByCategory).map(([category, items]) => ({
    category,
    total: items.reduce((sum, item) => sum + item.amount, 0),
    count: items.length,
  })).sort((a, b) => b.total - a.total)
  
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      {/* Navegação */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </Link>
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Faturas
          </Button>
        </Link>
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Gerenciar Cartões
          </Button>
        </Link>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {MONTHS[invoice.month - 1]} {invoice.year}
          </h1>
          {card && (
            <p className="text-muted-foreground">
              {card.nickname} • {card.bankName} • •••• {card.last4Digits}
            </p>
          )}
        </div>
        {status === 'Paga' ? (
          <Badge className="bg-green-500 text-lg px-4 py-2">Paga</Badge>
        ) : status === 'Atrasada' ? (
          <Badge className="bg-red-500 text-lg px-4 py-2">Atrasada</Badge>
        ) : (
          <Badge variant="outline" className="text-lg px-4 py-2">Pendente</Badge>
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Fatura</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.totalAmount)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(0)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(invoice.closingDate).getDate()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(invoice.closingDate).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencimento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(invoice.dueDate).getDate()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(invoice.dueDate).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Period Info */}
      <Card>
        <CardHeader>
          <CardTitle>Período da Fatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Período vigente:</span>
            <span className="font-medium">
              {new Date(invoice.closingDate).toLocaleDateString('pt-BR')} até {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Progress */}
      {invoice.paidAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Restante: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.totalAmount - invoice.paidAmount)}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Management */}
      {!invoice.isPaid && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Pagamento</CardTitle>
            <CardDescription>
              Informe o valor pago para atualizar o status da fatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="paidAmount">Valor Pago</Label>
                <Input
                  id="paidAmount"
                  type="text"
                  placeholder="R$ 0,00"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <Button 
                onClick={handlePaymentUpdate}
                disabled={!paidAmount || isSaving}
              >
                {isSaving ? 'Salvando...' : 'Atualizar Pagamento'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleMarkAsPaid}
                disabled={isSaving}
              >
                <Check className="mr-2 h-4 w-4" />
                Marcar como Paga (Valor Total)
              </Button>
            </div>
            
            {status === 'Atrasada' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Fatura em Atraso
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    O vencimento desta fatura já passou. Realize o pagamento o quanto antes para evitar juros e multas.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            Distribuição dos gastos desta fatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryTotals.map(({ category, total, count }) => {
              const categoryPercentage = (total / invoice.totalAmount) * 100
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{count} itens</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(total)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${categoryPercentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
          <CardDescription>
            {invoice.items.length} itens nesta fatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoice.items
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.installment && (
                        <>
                          <span>•</span>
                          <span>{item.installment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-lg">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.amount)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
