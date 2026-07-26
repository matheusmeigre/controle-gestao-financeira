'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, DollarSign, Receipt, Check, AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getInvoice, updateInvoice } from '@/server/actions/invoices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCard } from '@/server/actions/cards'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { BalanceValue } from '@/components/balance/balance-visibility'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function InvoiceDetailPage({
  params,
}: {
  params: { invoiceId: string }
}) {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [card, setCard] = useState<CardType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paidAmount, setPaidAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  
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
    if (!invoice) return
    
    const amount = parseFloat(paidAmount.replace(/[^\d,]/g, '').replace(',', '.'))
    
    if (isNaN(amount) || amount < 0) {
      setPaymentError('Digite um valor válido para o pagamento.')
      return
    }
    
    if (amount > invoice.totalAmount) {
      setPaymentError('O valor pago não pode ser maior que o total da fatura.')
      return
    }
    
    try {
      setIsSaving(true)
      
      const result = await updateInvoice(invoice.id!, {
        paidAmount: amount,
        isPaid: amount >= invoice.totalAmount,
      })
      
      if (!result.success) throw new Error(result.error)
      setInvoice({ ...invoice, paidAmount: amount, isPaid: amount >= invoice.totalAmount })
      setPaidAmount('')
      setPaymentError(null)
      toast({ title: 'Pagamento atualizado', description: 'O status da fatura foi recalculado.' })
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error)
      setPaymentError('Não foi possível salvar o pagamento. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleMarkAsPaid = async () => {
    if (!invoice) return
    
    try {
      setIsSaving(true)
      
      const result = await updateInvoice(invoice.id!, {
        paidAmount: invoice.totalAmount,
        isPaid: true,
      })
      
      if (!result.success) throw new Error(result.error)
      setInvoice({ ...invoice, paidAmount: invoice.totalAmount, isPaid: true })
      setPaymentError(null)
      toast({ title: 'Fatura paga', description: 'O pagamento total foi registrado.' })
    } catch (error) {
      console.error('Erro ao marcar como paga:', error)
      setPaymentError('Não foi possível marcar a fatura como paga.')
    } finally {
      setIsSaving(false)
    }
  }
  
  useEffect(() => {
    if (!user?.id) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        const result = await getInvoice(params.invoiceId)
        
        if (!result.success || !result.data) {
          router.push('/invoices')
          return
        }
        
        setInvoice(result.data)
        
        const cardResult = await getCard(result.data.cardId)
        if (cardResult.success) {
          setCard(cardResult.data as CardType)
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
      <div className="flex items-center justify-center py-12" role="status" aria-label="Carregando fatura">
          <div className="text-muted-foreground">Carregando fatura...</div>
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
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        backHref="/invoices"
        backLabel="Voltar para faturas"
        eyebrow="Detalhes da fatura"
        title={`${MONTHS[invoice.month - 1]} ${invoice.year}`}
        description={card ? `${card.nickname} | ${card.bankName} | final ${card.last4Digits}` : undefined}
        actions={status === 'Paga' ? (
          <Badge className="bg-success px-4 py-2 text-success-foreground">Paga</Badge>
        ) : status === 'Atrasada' ? (
          <Badge variant="destructive" className="px-4 py-2">Atrasada</Badge>
        ) : (
          <Badge variant="outline" className="px-4 py-2">Pendente</Badge>
        )}
      />
      
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
            <Progress value={percentage} className="h-3" indicatorClassName="bg-success" aria-label="Percentual pago da fatura" />
            <p className="text-sm text-muted-foreground mt-2">
              Restante: <BalanceValue>{new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.totalAmount - invoice.paidAmount)}</BalanceValue>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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

            {paymentError && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {paymentError}
              </div>
            )}
            
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
              <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Fatura em Atraso
                  </p>
                  <p className="text-sm text-muted-foreground">
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
