'use client'

import { useMemo } from 'react'
import { StatCard } from '@/components/ui/stat-card'
import { usePlanningSummary } from '../hooks/use-plannings'
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Loader2 
} from 'lucide-react'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function PlanningSummary() {
  const { summary, loading } = usePlanningSummary()

  const memoizedSummary = useMemo(() => {
    if (!summary) return null
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Planejamentos"
          value={summary.total}
          icon={Target}
        />

        <StatCard
          title="Em Progresso"
          value={summary.inProgress}
          icon={TrendingUp}
          variant="default"
        />

        <StatCard
          title="Completados"
          value={summary.completed}
          icon={CheckCircle2}
          variant="success"
        />

        <StatCard
          title="Meta Total"
          value={formatCurrency(summary.totalTargetAmount)}
          icon={Target}
          variant="default"
        />
      </div>
    )
  }, [summary])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return memoizedSummary
}
