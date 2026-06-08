'use client'

import { useState, useEffect, useTransition } from 'react'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '../types'
import { getCards, createCard, updateCard, deleteCard } from '@/server/actions/cards'

export function useCards() {
  const { user } = useUser()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    getCards()
      .then((res) => {
        if (res.success) setCards(res.data as CreditCard[])
      })
      .catch((err) => console.error('Error loading cards:', err))
      .finally(() => setIsLoading(false))
  }, [user])

  return {
    cards,
    isLoading,
    setCards,
  }
}
