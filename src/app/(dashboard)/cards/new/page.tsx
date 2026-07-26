'use client'

import { useRouter } from 'next/navigation'
import { CardForm } from '@/features/cards'
import { PageHeader } from '@/components/ui/page-header'

export default function NewCardPage() {
  const router = useRouter()
  
  const handleSuccess = () => {
    router.push('/cards')
  }
  
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        backHref="/cards"
        backLabel="Voltar para cartões"
        eyebrow="Carteira"
        title="Novo cartão"
        description="Cadastre os dados essenciais para organizar suas próximas faturas."
      />
      <CardForm onSuccess={handleSuccess} />
    </div>
  )
}
