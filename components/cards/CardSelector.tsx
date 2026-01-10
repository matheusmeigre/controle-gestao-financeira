'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard as CreditCardIcon, ChevronDown } from 'lucide-react'
import type { CreditCard } from '@/types/card'
import { Label } from '@/components/ui/label'

const STORAGE_KEY = 'credit_cards'

interface CardSelectorProps {
  value?: string
  onChange: (cardId: string) => void
  disabled?: boolean
}

export function CardSelector({ value, onChange, disabled }: CardSelectorProps) {
  const { user } = useUser()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadCards()
  }, [user])
  
  const loadCards = () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const stored = localStorage.getItem(STORAGE_KEY)
      
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        const userCards = allCards.filter(
          card => card.userId === user.id && card.isActive
        )
        setCards(userCards)
      } else {
        setCards([])
      }
    } catch (err) {
      setError('Erro ao carregar cartões')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const selectedCard = cards.find(card => card.id === value)
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Cartão de Crédito</Label>
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-2">
        <Label>Cartão de Crédito</Label>
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      </div>
    )
  }
  
  if (cards.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Cartão de Crédito</Label>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Nenhum cartão cadastrado. 
          <a href="/cards/new" className="ml-1 font-medium underline">
            Cadastre seu primeiro cartão
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor="card-selector">
        Cartão de Crédito <span className="text-red-500">*</span>
      </Label>
      
      <select
        id="card-selector"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Selecione um cartão...</option>
        {cards.map(card => (
          <option key={card.id} value={card.id}>
            {card.nickname} - {card.bankName} (•••• {card.last4Digits})
          </option>
        ))}
      </select>
      
      {/* Card Preview */}
      {selectedCard && (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <CreditCardIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{selectedCard.nickname}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCard.bankName} • {selectedCard.brand} • •••• {selectedCard.last4Digits}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
