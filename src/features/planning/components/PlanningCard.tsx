'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANNING_CATEGORIES, PLANNING_STATUS } from '../types'
import type { Planning, PlanningIndicators } from '../types'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Target,
  DollarSign
} from 'lucide-react'

interface PlanningCardProps {
  planning: Planning
  indicators: PlanningIndicators
  onClick?: () => void
}

function PlanningCardComponent({ planning, indicators, onClick }: PlanningCardProps) {
  const category = Object.values(PLANNING_CATEGORIES).find(
    (cat) => cat.value === planning.category
  )

  const getStatusConfig = () => {
    switch (planning.status) {
      case PLANNING_STATUS.COMPLETED:
        return {
          label: 'Completo',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        }
      case PLANNING_STATUS.CANCELLED:
        return {
          label: 'Cancelado',
          variant: 'secondary' as const,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        }
      case PLANNING_STATUS.IN_PROGRESS:
        return {
          label: 'Em Progresso',
          variant: 'default' as const,
          icon: TrendingUp,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        }
      default:
        return {
          label: 'Planejado',
          variant: 'outline' as const,
          icon: Target,
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getProgressColor = () => {
    if (indicators.isCompleted) return 'bg-green-500'
    if (indicators.isOverBudget) return 'bg-red-500'
    if (indicators.progress > 75) return 'bg-yellow-500'
    if (indicators.progress > 50) return 'bg-blue-500'
    return 'bg-gray-400'
  }

  return (
    <Card
      className={`p-5 hover:shadow-lg transition-all cursor-pointer ${
        indicators.isCancelled ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{category?.icon}</span>
            <h3 className="font-semibold text-lg line-clamp-1">{planning.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{category?.label}</p>
        </div>
        
        <Badge className={statusConfig.className}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Progresso */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-semibold">{indicators.progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(indicators.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>Atual</span>
          </div>
          <p className="font-semibold text-sm">
            {formatCurrency(planning.currentAmount)}
          </p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="w-3 h-3" />
            <span>Alvo</span>
          </div>
          <p className="font-semibold text-sm">
            {formatCurrency(planning.targetAmount)}
          </p>
        </div>
      </div>

      {/* Alertas */}
      {(indicators.isOverBudget || indicators.isDelayed) && !indicators.isCompleted && !indicators.isCancelled && (
        <div className="space-y-2 pt-2 border-t">
          {indicators.isOverBudget && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Orçamento estourado em {formatCurrency(planning.currentAmount - planning.targetAmount)}</span>
            </div>
          )}
          
          {indicators.isDelayed && (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
              <Calendar className="w-4 h-4" />
              <span>
                Atrasado {indicators.daysRemaining ? `há ${Math.abs(indicators.daysRemaining)} dias` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data Alvo */}
      {planning.targetDate && !indicators.isCancelled && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t mt-2">
          <Calendar className="w-3 h-3" />
          <span>
            Alvo: {new Date(planning.targetDate).toLocaleDateString('pt-BR')}
            {indicators.daysRemaining !== undefined && indicators.daysRemaining > 0 && (
              <span className="ml-1">({indicators.daysRemaining} dias restantes)</span>
            )}
          </span>
        </div>
      )}
    </Card>
  )
}

export const PlanningCard = memo(PlanningCardComponent)
