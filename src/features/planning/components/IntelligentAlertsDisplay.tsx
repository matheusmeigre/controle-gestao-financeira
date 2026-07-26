'use client'

import type { FinancialAlert } from '../types'
import { AlertTriangle, AlertCircle, Info, XCircle, TrendingUp } from 'lucide-react'
import { useBalanceVisibility } from '@/components/balance/balance-visibility'

interface IntelligentAlertsDisplayProps {
  alerts: FinancialAlert[]
  showRecommendations?: boolean
}

export function IntelligentAlertsDisplay({ 
  alerts, 
  showRecommendations = true 
}: IntelligentAlertsDisplayProps) {
  const { balancesVisible } = useBalanceVisibility()
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 bg-background border-l-4 border-green-500 rounded">
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Planejamento saudável</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Este planejamento está financeiramente viável. Você pode prosseguir com confiança.
          </p>
        </div>
      </div>
    )
  }

  const getIcon = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical': return XCircle
      case 'high': return AlertTriangle
      case 'medium': return AlertCircle
      case 'low': return Info
    }
  }

  const getBorderColor = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500'
      case 'high': return 'border-orange-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-blue-500'
    }
  }

  const getIconColor = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-blue-600 dark:text-blue-400'
    }
  }

  const blockers = alerts.filter(alert => alert.isBlocker)
  const nonBlockers = alerts.filter(alert => !alert.isBlocker)

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div>
        <h3 className="text-lg font-semibold">O que considerar</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {blockers.length > 0 
            ? 'Alguns ajustes são necessários antes de continuar'
            : 'Você pode prosseguir, mas considere estas observações'
          }
        </p>
      </div>

      {/* Lista de Alertas Unificada */}
      <div className="space-y-3">
        {[...blockers, ...nonBlockers].map((alert, index) => {
          const Icon = getIcon(alert.severity)
          const borderColor = getBorderColor(alert.severity)
          const iconColor = getIconColor(alert.severity)
          
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 bg-background border-l-4 ${borderColor} rounded transition-all duration-150 hover:bg-muted/50`}
            >
              <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
              
              <div className="flex-1 space-y-2">
                {/* Título */}
                <p className="font-medium">
                  {alert.title}
                  {alert.isBlocker && (
                    <span className="ml-2 text-xs font-normal text-red-600 dark:text-red-400">
                      (bloqueante)
                    </span>
                  )}
                </p>
                
                {/* Mensagem */}
                <p className="text-sm text-foreground/80">
                  {alert.message}
                </p>
                
                {/* Explicação (colapsável visualmente) */}
                {alert.explanation && (
                  <div className="text-sm text-muted-foreground">
                    {!balancesVisible && alert.id === 'unviable'
                      ? 'O valor mensal necessário excede sua renda livre.'
                      : alert.explanation}
                  </div>
                )}
                
                {/* Recomendação */}
                {showRecommendations && alert.recommendation && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-sm">
                      <span className="font-medium text-foreground/90">💡 Recomendação:</span>{' '}
                      <span className="text-foreground/70">{alert.recommendation}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
