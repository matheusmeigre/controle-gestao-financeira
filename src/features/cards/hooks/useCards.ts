'use client'

import { useState, useEffect, useTransition } from 'react'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '../types'
import { getCards, createCard, updateCard, deleteCard } from '@/server/actions/cards'

export function useCards() {
  const { user } = useUser()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getCards()
      .then((res) => {
        if (res.success) setCards(res.data as CreditCard[])
      })
      .catch((err) => console.error('Error loading cards:', err))
      .finally(() => setIsLoading(false))
  }, [user])

  const saveCards = (updatedCards: CreditCard[]) => {
    setCards(updatedCards)
  }

  return {
    cards,
    isLoading,
    setCards: saveCards,
  }
}
