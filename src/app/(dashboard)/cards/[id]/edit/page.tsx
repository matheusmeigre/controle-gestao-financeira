'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '@/types/card'
import { CardEditForm } from '@/features/cards'
import { getCard } from '@/server/actions/cards'
import { Loader2 } from 'lucide-react'

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

    const loadCard = async () => {
      try {
        const result = await getCard(id as string)

        if (!result.success || !result.data) {
          setError(result.error || 'Cartão não encontrado')
          return
        }

        setCard(result.data)
      } catch (err) {
        setError('Erro ao carregar cartão')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCard()
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
