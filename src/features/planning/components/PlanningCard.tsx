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
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
          icon: CheckCircle2,
          className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        }
      case PLANNING_STATUS.CANCELLED:
        return {
          label: 'Cancelado',
          icon: XCircle,
          className: 'text-muted-foreground bg-muted border-border',
        }
      case PLANNING_STATUS.IN_PROGRESS:
        return {
          label: 'Em Progresso',
          icon: TrendingUp,
          className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        }
      default:
        return {
          label: 'Planejado',
          icon: Target,
          className: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getProgressColor = () => {
    if (indicators.isCompleted) return 'bg-green-500 dark:bg-green-600'
    if (indicators.isOverBudget) return 'bg-red-500 dark:bg-red-600'
    if (indicators.progress > 75) return 'bg-amber-500 dark:bg-amber-600'
    if (indicators.progress > 50) return 'bg-blue-500 dark:bg-blue-600'
    return 'bg-slate-400 dark:bg-slate-600'
  }

  const formatDaysRemaining = () => {
    if (!indicators.daysRemaining || indicators.daysRemaining === undefined) return null
    if (indicators.daysRemaining < 0) return `${Math.abs(indicators.daysRemaining)}d atrasado`
    if (indicators.daysRemaining === 0) return 'Hoje'
    if (indicators.daysRemaining === 1) return '1 dia'
    return `${indicators.daysRemaining} dias`
  }

  return (
    <Card
      className={cn(
        'group hover:shadow-md hover:border-foreground/10 transition-all duration-150 cursor-pointer overflow-hidden',
        indicators.isCancelled && 'opacity-50'
      )}
      onClick={onClick}
    >
      <div className="p-5 space-y-4">
        {/* Header: Nome + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{category?.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                {planning.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{category?.label}</p>
            </div>
          </div>
          
          <Badge variant="outline" className={cn('text-xs border', statusConfig.className)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className="text-sm font-semibold font-mono">{indicators.progress}%</span>
          </div>
          
          <div className="relative w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getProgressColor())}
              style={{ width: `${Math.min(indicators.progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Valores: Grid 2 colunas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="font-semibold text-sm font-mono">
              {formatCurrency(planning.currentAmount)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="font-semibold text-sm font-mono">
              {formatCurrency(planning.targetAmount)}
            </p>
          </div>
        </div>

        {/* Footer: Tempo restante OU Alertas */}
        {!indicators.isCompleted && !indicators.isCancelled && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            {/* Tempo restante com destaque */}
            {planning.targetDate && indicators.daysRemaining !== undefined && (
              <div className={cn(
                "flex items-center gap-2 text-xs font-medium",
                indicators.isDelayed 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-foreground/70"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDaysRemaining()}</span>
                {indicators.isDelayed && <AlertTriangle className="w-3.5 h-3.5 ml-auto" />}
              </div>
            )}

            {/* Alerta de orçamento estourado */}
            {indicators.isOverBudget && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Orçamento excedido em {formatCurrency(planning.currentAmount - planning.targetAmount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Data alvo para planejamentos completados */}
        {(indicators.isCompleted || indicators.isCancelled) && planning.targetDate && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Alvo: {new Date(planning.targetDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export const PlanningCard = memo(PlanningCardComponent)
