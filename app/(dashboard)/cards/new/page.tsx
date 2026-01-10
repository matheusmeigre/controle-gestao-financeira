'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CardForm } from '@/components/cards/CardForm'
import { Button } from '@/components/ui/button'

export default function NewCardPage() {
  const router = useRouter()
  
  const handleSuccess = () => {
    router.push('/cards')
  }
  
  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      {/* Back Button */}
      <Link href="/cards">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Cartões
        </Button>
      </Link>
      
      {/* Form */}
      <CardForm onSuccess={handleSuccess} />
    </div>
  )
}
