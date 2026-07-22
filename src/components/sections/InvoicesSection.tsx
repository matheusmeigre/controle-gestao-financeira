'use client'

import Link from 'next/link'
import { Plus, CreditCard, Receipt, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoicesList } from '@/features/invoices'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CreditCardType } from '@/features/cards/types'

interface InvoicesSectionProps {
  invoices: Invoice[]
  cards: CreditCardType[]
}

export function InvoicesSection({ invoices, cards }: InvoicesSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">Faturas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Faturas dos seus cartões de crédito
          </p>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Fatura
          </Button>
        </Link>
      </div>

      {cards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Cadastre seus cartões de crédito para começar a gerenciar suas faturas
          </p>
          <Link href="/cards/new">
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Cadastrar Cartão
            </Button>
          </Link>
        </div>
      )}

      {cards.length > 0 && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma fatura ainda</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Crie sua primeira fatura para controlar os gastos do cartão
          </p>
          <Link href="/invoices/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Fatura
            </Button>
          </Link>
        </div>
      )}

      {invoices.length > 0 && (
        <>
          <InvoicesList
            invoices={invoices}
            cards={cards}
            onUpdateInvoice={async () => {}}
          />
          <div className="mt-4 flex justify-center">
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                Gerenciar todas as faturas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  )
}
