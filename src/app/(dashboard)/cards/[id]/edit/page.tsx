'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '@/types/card'
import { CardEditForm } from '@/features/cards'
import { getCard } from '@/server/actions/cards'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
      <div className="flex items-center justify-center py-16" role="status" aria-label="Carregando cartão">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert variant="destructive">
          <AlertTitle>Cartão indisponível</AlertTitle>
          <AlertDescription>{error || 'Cartão não encontrado'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        backHref="/cards"
        backLabel="Voltar para cartões"
        eyebrow="Carteira"
        title="Editar cartão"
        description="Atualize apelido, vencimento, fechamento e limite do cartão."
      />
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
