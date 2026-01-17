import { CreditCard as CreditCardIcon, Plus, Home, Receipt } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CardsList } from '@/features/cards'

export default function CardsPage() {
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
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <Receipt className="mr-2 h-4 w-4" />
            Ver Faturas
          </Button>
        </Link>
      </div>
      
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
      <CardsList />
    </div>
  )
}
