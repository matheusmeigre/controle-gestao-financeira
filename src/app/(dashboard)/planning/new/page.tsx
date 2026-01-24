'use client'

import { useRouter } from 'next/navigation'
import { UserHeader } from '@/components/user-header'
import { Button } from '@/components/ui/button'
import { IntelligentPlanningForm, usePlannings } from '@/features/planning'
import type { Planning } from '@/features/planning'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPlanningPage() {
  const router = useRouter()
  const { createPlanning } = usePlannings()

  const handleSubmit = async (data: Partial<Planning>) => {
    await createPlanning(data as any)
    router.push('/planning')
  }

  const handleCancel = () => {
    router.push('/planning')
  }

  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-8 space-y-6 px-4">
        {/* Navegação */}
        <Link href="/planning" prefetch={true}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Novo Planejamento Financeiro</h1>
          <p className="text-muted-foreground mt-2">
            Sistema inteligente de planejamento com simulações em tempo real e análise contextual
          </p>
        </div>

        {/* Formulário Inteligente */}
        <IntelligentPlanningForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  )
}
