'use client'

import { useEffect, useState } from 'react'
import { Receipt, Home, CreditCard, Target, Plus } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { InvoiceRepository, InvoicesList } from '@/features/invoices'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserHeader } from '@/components/user-header'
import { useToast } from '@/hooks/use-toast'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'

const STORAGE_KEY = 'credit_cards'

export default function InvoicesPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!user?.id) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Carrega faturas do repositório
        const invoiceRepo = new InvoiceRepository()
        const userInvoices = await invoiceRepo.findAll(user.id)
        
        // Ordena por competência (mais recente primeiro)
        const sortedInvoices = userInvoices.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
        
        setInvoices(sortedInvoices)
        
        // Carrega cartões
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const allCards: CardType[] = JSON.parse(stored)
          const userCards = allCards.filter(c => c.userId === user.id && c.isActive)
          setCards(userCards)
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
  
  const handleUpdateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    if (!user?.id) return
    
    try {
      const invoiceRepo = new InvoiceRepository()
      await invoiceRepo.update(user.id, invoiceId, updates)
      
      // Recarrega as faturas
      const updatedInvoices = await invoiceRepo.findAll(user.id)
      const sortedInvoices = updatedInvoices.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
      setInvoices(sortedInvoices)
      
      toast({
        title: 'Fatura atualizada',
        description: 'As alterações foram salvas com sucesso.',
      })
    } catch (error) {
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
      <>
        <UserHeader />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Carregando faturas...</div>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-8 space-y-6 px-4">
        {/* Navegação */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
          </Link>
          <Link href="/planning">
            <Button variant="ghost" size="sm">
              <Target className="mr-2 h-4 w-4" />
              Planejamento
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
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8" />
              Faturas de Cartão
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as faturas dos seus cartões cadastrados
            </p>
          </div>
          <Link href="/invoices/new">
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Nova Fatura
            </Button>
          </Link>
        </div>

        {/* Sem cartões — precisa cadastrar antes */}
        {cards.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Para criar uma fatura é necessário ter pelo menos um cartão cadastrado.
              </p>
              <Link href="/cards/new">
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Cadastrar Cartão
                </Button>
              </Link>
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
              <Link href="/invoices/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Fatura
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Lista de faturas */}
        {cards.length > 0 && invoices.length > 0 && (
          <InvoicesList
            invoices={invoices}
            cards={cards}
            onUpdateInvoice={handleUpdateInvoice}
          />
        )}
      </div>
    </>
  )
}
