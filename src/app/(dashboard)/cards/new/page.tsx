'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { CardForm } from '@/features/cards'
import { Button } from '@/components/ui/button'

export default function NewCardPage() {
  const router = useRouter()
  
  const handleSuccess = () => {
    router.push('/cards')
  }
  
  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      {/* Navegação */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </Link>
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Cartões
          </Button>
        </Link>
      </div>
      
      {/* Form */}
      <CardForm onSuccess={handleSuccess} />
    </div>
  )
}
