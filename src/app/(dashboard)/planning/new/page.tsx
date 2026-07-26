'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { IntelligentPlanningForm, usePlannings } from '@/features/planning'
import type { Planning } from '@/features/planning'

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
    <div className="mx-auto max-w-5xl space-y-7">
        <PageHeader
          backHref="/planning"
          eyebrow="Novo objetivo"
          title="Criar planejamento"
          description="Defina sua meta e acompanhe a simulação de impacto no orçamento em tempo real."
        />

        {/* Formulário Inteligente */}
        <IntelligentPlanningForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
    </div>
  )
}
