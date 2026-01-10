import { Suspense } from 'react'
import { CreditCard as CreditCardIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import { getCards } from '@/server/actions/cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function CardsPage() {
  const result = await getCards()
  const cards = result.success && result.data ? result.data : []
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Cartões</h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões de crédito cadastrados
          </p>
        </div>
        <Link href="/cards/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cartão
          </Button>
        </Link>
      </div>
      
      {/* Cards List */}
      {cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Cadastre seu primeiro cartão de crédito para começar a gerenciar suas faturas.
            </p>
            <Link href="/cards/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Cartão
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(card => (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCardIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.nickname}</CardTitle>
                      <CardDescription>•••• {card.last4Digits}</CardDescription>
                    </div>
                  </div>
                  {card.isActive && (
                    <Badge variant="default" className="bg-green-500">
                      Ativo
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Banco</span>
                  <span className="font-medium">{card.bankName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bandeira</span>
                  <span className="font-medium">{card.brand}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fechamento</span>
                  <span className="font-medium">Dia {card.closingDay}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento</span>
                  <span className="font-medium">Dia {card.dueDay}</span>
                </div>
                {card.creditLimit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Limite</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(card.creditLimit)}
                    </span>
                  </div>
                )}
                
                <div className="pt-4 flex gap-2">
                  <Link href={`/invoices?cardId=${card.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver Faturas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
