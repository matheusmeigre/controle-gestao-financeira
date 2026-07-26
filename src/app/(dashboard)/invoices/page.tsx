'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Receipt, CreditCard, Plus, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { InvoicesList } from '@/features/invoices'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { getAllCards } from '@/server/actions/cards'
import { getInvoices, deleteInvoice as deleteInvoiceAction, updateInvoice as updateInvoiceAction } from '@/server/actions/invoices'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'

export default function InvoicesPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const selectedCardId = searchParams.get('cardId')
  const visibleInvoices = selectedCardId
    ? invoices.filter((invoice) => invoice.cardId === selectedCardId)
    : invoices
  const selectedCard = cards.find((card) => card.id === selectedCardId)
  
  useEffect(() => {
    if (!user?.id) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Carrega faturas do Supabase
        const invoiceResult = await getInvoices()
        if (!invoiceResult.success) throw new Error(invoiceResult.error)
        const userInvoices = invoiceResult.data!
        
        // Ordena por competência (mais recente primeiro)
        const sortedInvoices = userInvoices.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
        
        setInvoices(sortedInvoices)
        
        // Carrega cartões do Supabase
        const cardResult = await getAllCards()
        if (cardResult.success) {
          setCards(cardResult.data as CardType[])
        } else {
          setCardsError('Os cartões não puderam ser carregados. As faturas existentes continuam disponíveis.')
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro ao carregar faturas',
          description: 'Não foi possível carregar as faturas. Tente novamente.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user?.id, toast])
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!user?.id) return

    try {
      const result = await deleteInvoiceAction(invoiceId)
      if (!result.success) throw new Error(result.error)

      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))

      toast({
        title: 'Fatura excluída',
        description: 'A fatura foi removida com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir fatura:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a fatura.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    if (!user?.id) return

    const previous = invoices
    setInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
    )

    try {
      const result = await updateInvoiceAction(invoiceId, updates)
      if (!result.success) throw new Error(result.error)

      const updated = result.data
      if (updated) {
        setInvoices(prev =>
          prev.map(inv => (inv.id === invoiceId ? updated : inv))
        )
      }

      toast({
        title: 'Fatura atualizada',
        description: 'As alterações foram salvas com sucesso.',
      })
    } catch (error) {
      setInvoices(previous)
      console.error('Erro ao atualizar fatura:', error)
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Carregando faturas">
        <Skeleton className="h-20 w-full max-w-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-7">
        <PageHeader
          eyebrow="Crédito"
          title="Faturas de cartão"
          description="Acompanhe vencimentos, pagamentos e a divisão dos gastos de cada fatura."
          actions={
            <Button asChild>
              <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
                Nova fatura
              </Link>
            </Button>
          }
        />

        {cardsError && (
          <Alert>
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Dados de cartões indisponíveis</AlertTitle>
            <AlertDescription>{cardsError}</AlertDescription>
          </Alert>
        )}

        {selectedCardId && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-sm">
            <span>
              Exibindo faturas de <strong>{selectedCard?.nickname ?? 'um cartão selecionado'}</strong>
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/invoices">Limpar filtro</Link>
            </Button>
          </div>
        )}

        {/* Sem cartões — precisa cadastrar antes */}
        {cards.length === 0 && invoices.length === 0 && !cardsError && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Para criar uma fatura é necessário ter pelo menos um cartão cadastrado.
              </p>
              <Button asChild>
                <Link href="/cards/new">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Cadastrar cartão
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tem cartões mas sem faturas */}
        {cards.length > 0 && invoices.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma fatura ainda</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Crie sua primeira fatura para registrar os gastos do cartão.
              </p>
              <Button asChild>
                <Link href="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira fatura
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de faturas */}
        {visibleInvoices.length > 0 && (
          <InvoicesList
            invoices={visibleInvoices}
            cards={cards}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {selectedCardId && invoices.length > 0 && visibleInvoices.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <Receipt className="mx-auto mb-3 size-9 text-muted-foreground" aria-hidden="true" />
              <h2 className="font-semibold">Nenhuma fatura para este cartão</h2>
              <p className="mt-1 text-sm text-muted-foreground">Remova o filtro ou crie uma nova fatura.</p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
