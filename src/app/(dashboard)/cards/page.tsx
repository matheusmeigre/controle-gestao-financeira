import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { CardsList } from '@/features/cards'

export const metadata: Metadata = { title: 'Cartões' }

export default function CardsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Carteira"
        title="Meus cartões"
        description="Gerencie limites, vencimentos e os cartões usados nas suas faturas."
        actions={
          <Button asChild>
            <Link href="/cards/new">
            <Plus className="mr-2 h-4 w-4" />
              Novo cartão
            </Link>
          </Button>
        }
      />
      <CardsList />
    </div>
  )
}
