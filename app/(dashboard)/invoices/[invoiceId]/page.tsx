import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, CreditCard as CreditCardIcon, DollarSign, Receipt, Home } from 'lucide-react'
import Link from 'next/link'
import { getInvoice } from '@/server/actions/invoices'
import { getCard } from '@/server/actions/cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default async function InvoiceDetailPage({
  params,
}: {
  params: { invoiceId: string }
}) {
  const invoiceResult = await getInvoice(params.invoiceId)
  
  if (!invoiceResult.success || !invoiceResult.data) {
    notFound()
  }
  
  const invoice = invoiceResult.data
  const cardResult = await getCard(invoice.cardId)
  const card = cardResult.success ? cardResult.data : null
  
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
        {invoice.isPaid ? (
          <Badge className="bg-green-500 text-lg px-4 py-2">Paga</Badge>
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
            <CardTitle className="text-sm font-medium">Itens</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoice.items.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              transações
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
