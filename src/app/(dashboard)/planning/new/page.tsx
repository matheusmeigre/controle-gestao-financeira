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
      <div className="container mx-auto py-8 space-y-8 px-4">
        {/* Navegação */}
        <Link href="/planning" prefetch={true}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Header Minimalista */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold">Novo Planejamento</h1>
          <p className="text-muted-foreground mt-1">
            Defina seu objetivo e veja simulações em tempo real
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
