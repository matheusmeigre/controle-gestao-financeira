import { Suspense } from 'react'
import { Receipt, Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import { getInvoices } from '@/server/actions/invoices'
import { getCards } from '@/server/actions/cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { cardId?: string; month?: string; year?: string }
}) {
  const [invoicesResult, cardsResult] = await Promise.all([
    getInvoices({
      cardId: searchParams.cardId,
      month: searchParams.month ? parseInt(searchParams.month) : undefined,
      year: searchParams.year ? parseInt(searchParams.year) : undefined,
    }),
    getCards(),
  ])
  
  const invoices = invoicesResult.success && invoicesResult.data ? invoicesResult.data : []
  const cards = cardsResult.success && cardsResult.data ? cardsResult.data : []
  
  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    return card ? `${card.nickname} (•••• ${card.last4Digits})` : 'Cartão desconhecido'
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
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
              {searchParams.cardId || searchParams.month || searchParams.year
                ? 'Nenhuma fatura encontrada com os filtros aplicados.'
                : 'Crie sua primeira fatura ou importe automaticamente de um arquivo.'}
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
