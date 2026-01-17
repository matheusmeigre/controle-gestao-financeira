'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '../types'

const STORAGE_KEY = 'credit_cards'

export function useCards() {
  const { user } = useUser()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        // Filtrar apenas os cartões do usuário atual
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
  }, [user])

  const saveCards = (updatedCards: CreditCard[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const allCards: CreditCard[] = stored ? JSON.parse(stored) : []
      
      // Remove os cartões antigos do usuário atual e adiciona os novos
      const otherUsersCards = allCards.filter(card => card.userId !== user?.id)
      const newAllCards = [...otherUsersCards, ...updatedCards]
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllCards))
      setCards(updatedCards)
    } catch (error) {
      console.error('Error saving cards:', error)
    }
  }

  return {
    cards,
    isLoading,
    setCards: saveCards,
  }
}
