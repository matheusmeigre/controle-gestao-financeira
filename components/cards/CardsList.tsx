'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard as CreditCardIcon, Plus, Trash2, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import type { CreditCard } from '@/types/card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STORAGE_KEY = 'credit_cards'

// Cores baseadas nos bancos
const BANK_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'Nubank': { bg: 'bg-gradient-to-br from-purple-600 to-purple-800', text: 'text-white', accent: 'bg-purple-500' },
  'Inter': { bg: 'bg-gradient-to-br from-orange-500 to-orange-700', text: 'text-white', accent: 'bg-orange-400' },
  'Itaú': { bg: 'bg-gradient-to-br from-blue-600 to-blue-800', text: 'text-white', accent: 'bg-blue-500' },
  'Bradesco': { bg: 'bg-gradient-to-br from-red-600 to-red-800', text: 'text-white', accent: 'bg-red-500' },
  'Santander': { bg: 'bg-gradient-to-br from-red-500 to-red-700', text: 'text-white', accent: 'bg-red-400' },
  'Banco do Brasil': { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700', text: 'text-gray-900', accent: 'bg-yellow-400' },
  'Caixa': { bg: 'bg-gradient-to-br from-blue-500 to-blue-700', text: 'text-white', accent: 'bg-blue-400' },
  'C6 Bank': { bg: 'bg-gradient-to-br from-gray-800 to-black', text: 'text-white', accent: 'bg-gray-700' },
  'BTG Pactual': { bg: 'bg-gradient-to-br from-blue-900 to-black', text: 'text-white', accent: 'bg-blue-800' },
  'PicPay': { bg: 'bg-gradient-to-br from-green-500 to-green-700', text: 'text-white', accent: 'bg-green-400' },
  'Mercado Pago': { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white', accent: 'bg-blue-300' },
  'default': { bg: 'bg-gradient-to-br from-slate-600 to-slate-800', text: 'text-white', accent: 'bg-slate-500' },
}

// Logos das bandeiras
const BRAND_LOGOS: Record<string, string> = {
  'Visa': '💳',
  'Mastercard': '🔴',
  'Elo': '🟡',
  'American Express': '🔵',
  'Hipercard': '🟠',
  'Outros': '💳',
}

export function CardsList() {
  const { user } = useUser()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [user])

  const loadCards = () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        const userCards = allCards.filter(
          card => card.userId === user.id && card.isActive
        )
        setCards(userCards)
      }
    } catch (error) {
      console.error('Error loading cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCard = (cardId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        const updatedCards = allCards.map(card =>
          card.id === cardId ? { ...card, isActive: false } : card
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards))
        loadCards()
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  const getBankColor = (bankName: string) => {
    // Extrair nome do banco (remover código)
    const bankKey = Object.keys(BANK_COLORS).find(key => 
      bankName.toLowerCase().includes(key.toLowerCase())
    )
    return bankKey ? BANK_COLORS[bankKey] : BANK_COLORS.default
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-12 px-4">
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
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => {
        const colors = getBankColor(card.bankName)
        const brandLogo = BRAND_LOGOS[card.brand] || BRAND_LOGOS['Outros']
        
        return (
          <div
            key={card.id}
            className={`relative rounded-xl p-6 shadow-lg ${colors.bg} ${colors.text} min-h-[220px] flex flex-col justify-between hover:scale-105 transition-transform`}
          >
            {/* Header com logo da bandeira */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm opacity-80 mb-1">{card.bankName.split(' - ')[1] || card.bankName}</p>
                <p className="text-xs opacity-70">{card.nickname}</p>
              </div>
              <div className="text-3xl">{brandLogo}</div>
            </div>

            {/* Número do cartão */}
            <div className="mb-6">
              <p className="text-2xl font-mono tracking-wider">
                •••• •••• •••• {card.last4Digits}
              </p>
            </div>

            {/* Footer com info */}
            <div className="flex items-end justify-between">
              <div className="text-sm">
                <p className="opacity-70 text-xs">Vencimento</p>
                <p className="font-semibold">Dia {card.dueDay}</p>
              </div>
              <div className="text-sm text-right">
                <p className="opacity-70 text-xs">Fechamento</p>
                <p className="font-semibold">Dia {card.closingDay}</p>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Link href={`/cards/${card.id}/edit`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 border-none"
                  title="Editar cartão"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/invoices?cardId=${card.id}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 border-none"
                  title="Ver faturas"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/20 hover:bg-red-500/80 border-none"
                onClick={() => {
                  if (card.id && confirm('Deseja realmente excluir este cartão?')) {
                    deleteCard(card.id)
                  }
                }}
                title="Excluir cartão"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Badge de limite se houver */}
            {card.creditLimit && (
              <div className={`absolute bottom-4 right-4 ${colors.accent} px-2 py-1 rounded text-xs font-semibold`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(card.creditLimit)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
