'use client'

/**
 * InvoiceSelectModal
 *
 * Modal minimalista exibido ao clicar em "Fatura" na home, quando já existem faturas criadas.
 * Agrupa as faturas por cartão e permite navegar para a fatura desejada ou criar uma nova.
 */

import { useRouter } from 'next/navigation'
import { CreditCard, Plus, Receipt, CheckCircle2, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from '@/features/invoices/types'
import type { CreditCard as CardType } from '@/features/cards/types'

interface InvoiceSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  cards: CardType[]
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const BANK_COLORS: Record<string, string> = {
  Nubank: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  Inter: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  Itaú: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  Bradesco: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
}

function getCardBadgeColor(card: CardType): string {
  const key = Object.keys(BANK_COLORS).find((k) =>
    card.bankName.toLowerCase().includes(k.toLowerCase()),
  )
  return key ? BANK_COLORS[key] : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function InvoiceSelectModal({
  open,
  onOpenChange,
  invoices,
  cards,
}: InvoiceSelectModalProps) {
  const router = useRouter()

  // Agrupa as faturas por cartão, ordena cada grupo por competência (mais recente primeiro)
  const groupedByCard = cards
    .map((card) => {
      const cardInvoices = invoices
        .filter((inv) => inv.cardId === card.id)
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
      return { card, invoices: cardInvoices }
    })
    .filter((g) => g.invoices.length > 0)
    // Ordena cartões: os que têm faturas pendentes aparecem primeiro
    .sort((a, b) => {
      const aPending = a.invoices.some((i) => !i.isPaid) ? 0 : 1
      const bPending = b.invoices.some((i) => !i.isPaid) ? 0 : 1
      return aPending - bPending
    })

  const handleSelectInvoice = (invoice: Invoice) => {
    onOpenChange(false)
    router.push(`/invoices/${invoice.id}`)
  }

  const handleCreateNew = () => {
    onOpenChange(false)
    router.push('/invoices/new')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" />
            Selecionar Fatura
          </DialogTitle>
          <DialogDescription className="text-xs">
            Escolha a fatura que deseja visualizar ou gerencie uma nova.
          </DialogDescription>
        </DialogHeader>

        {/* Lista de faturas agrupadas por cartão */}
        <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-2">
          {groupedByCard.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma fatura encontrada.
            </div>
          ) : (
            groupedByCard.map(({ card, invoices: cardInvoices }) => (
              <div key={card.id} className="space-y-1.5">
                {/* Header do cartão */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getCardBadgeColor(card)}`}
                >
                  <CreditCard className="h-3 w-3" />
                  <span>{card.nickname}</span>
                  <span className="opacity-60">••••&nbsp;{card.last4Digits}</span>
                </div>

                {/* Faturas do cartão */}
                <div className="space-y-1">
                  {cardInvoices.map((invoice) => (
                    <button
                      key={invoice.id}
                      onClick={() => handleSelectInvoice(invoice)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/40 transition-colors text-left active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        {invoice.isPaid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {MONTHS[invoice.month - 1]}/{invoice.year}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {invoice.items.length}{' '}
                            {invoice.items.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(invoice.totalAmount)}</p>
                        <Badge
                          variant={invoice.isPaid ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 mt-0.5"
                        >
                          {invoice.isPaid ? 'Paga' : 'Pendente'}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="px-5 pt-3 pb-5 border-t mt-2">
          <Button onClick={handleCreateNew} className="w-full gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            Criar Nova Fatura
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
