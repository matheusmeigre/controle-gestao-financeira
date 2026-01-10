'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '@/types/card'
import { CardEditForm } from '@/components/cards/CardEditForm'
import { Loader2 } from 'lucide-react'

const STORAGE_KEY = 'credit_cards'

export default function EditCardPage() {
  const { id } = useParams()
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [card, setCard] = useState<CreditCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    // Buscar cartão do localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setError('Nenhum cartão encontrado')
        setIsLoading(false)
        return
      }

      const allCards: CreditCard[] = JSON.parse(stored)
      const foundCard = allCards.find(
        c => c.id === id && c.userId === user.id && c.isActive
      )

      if (!foundCard) {
        setError('Cartão não encontrado')
        setIsLoading(false)
        return
      }

      setCard(foundCard)
    } catch (err) {
      setError('Erro ao carregar cartão')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [id, user, isLoaded, router])

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error || 'Cartão não encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <CardEditForm
        card={card}
        onSuccess={() => {
          router.push('/cards')
          router.refresh()
        }}
        onCancel={() => router.push('/cards')}
      />
    </div>
  )
}
