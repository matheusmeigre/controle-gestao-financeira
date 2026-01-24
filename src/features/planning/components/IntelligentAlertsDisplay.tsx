'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FinancialAlert } from '../types'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  XCircle,
  Lightbulb,
  TrendingUp
} from 'lucide-react'

interface IntelligentAlertsDisplayProps {
  alerts: FinancialAlert[]
  showRecommendations?: boolean
}

export function IntelligentAlertsDisplay({ 
  alerts, 
  showRecommendations = true 
}: IntelligentAlertsDisplayProps) {
  if (alerts.length === 0) {
    return (
      <Card className="p-6 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Sem Alertas
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Este planejamento está financeiramente saudável. Você pode prosseguir com confiança.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const getIcon = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return XCircle
      case 'high':
        return AlertTriangle
      case 'medium':
        return AlertCircle
      case 'low':
        return Info
    }
  }

  const getSeverityColor = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-900 dark:text-red-100',
          subtext: 'text-red-700 dark:text-red-300',
          icon: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-900 dark:text-orange-100',
          subtext: 'text-orange-700 dark:text-orange-300',
          icon: 'text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-900 dark:text-yellow-100',
          subtext: 'text-yellow-700 dark:text-yellow-300',
          icon: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }
      case 'low':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-100',
          subtext: 'text-blue-700 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }
    }
  }

  const getSeverityLabel = (severity: FinancialAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'Crítico'
      case 'high':
        return 'Alto'
      case 'medium':
        return 'Médio'
      case 'low':
        return 'Informativo'
    }
  }

  const getTypeEmoji = (type: FinancialAlert['type']) => {
    switch (type) {
      case 'risk':
        return ''
      case 'warning':
        return ''
      case 'info':
        return ''
      case 'recommendation':
        return ''
    }
  }

  const blockers = alerts.filter(alert => alert.isBlocker)
  const nonBlockers = alerts.filter(alert => !alert.isBlocker)

  return (
    <div className="space-y-4">
      {/* Alertas Bloqueadores */}
      {blockers.length > 0 && (
        <Card className="p-6 border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Alertas Críticos ({blockers.length})
              </h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Estes problemas impedem a criação do planejamento. Ajuste os valores antes de prosseguir.
            </p>
            
            <div className="space-y-3">
              {blockers.map((alert, index) => {
                const colors = getSeverityColor(alert.severity)
                const Icon = getIcon(alert.severity)
                
                return (
                  <div
                    key={index}
                    className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-semibold ${colors.text}`}>
                            {getTypeEmoji(alert.type)} {alert.title}
                          </p>
                          <Badge className={colors.badge}>
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                        </div>
                        
                        <p className={`text-sm ${colors.subtext}`}>
                          {alert.message}
                        </p>
                        
                        {alert.explanation && (
                          <div className={`text-xs ${colors.subtext} bg-white dark:bg-gray-900/50 rounded p-2`}>
                            <p className="font-medium mb-1">📊 Por quê?</p>
                            <p>{alert.explanation}</p>
                          </div>
                        )}
                        
                        {showRecommendations && alert.recommendation && (
                          <div className={`text-xs ${colors.subtext} bg-white dark:bg-gray-900/50 rounded p-2 border-l-2 ${colors.border}`}>
                            <p className="font-medium mb-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Recomendação
                            </p>
                            <p>{alert.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Alertas Não-Bloqueadores */}
      {nonBlockers.length > 0 && (
        <Card className="p-6 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Pontos de Atenção ({nonBlockers.length})
              </h3>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Você pode prosseguir, mas considere estas observações para um planejamento mais saudável.
            </p>
            
            <div className="space-y-3">
              {nonBlockers.map((alert, index) => {
                const colors = getSeverityColor(alert.severity)
                const Icon = getIcon(alert.severity)
                
                return (
                  <div
                    key={index}
                    className={`${colors.bg} ${colors.border} border rounded-lg p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-semibold ${colors.text}`}>
                            {getTypeEmoji(alert.type)} {alert.title}
                          </p>
                          <Badge className={colors.badge}>
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                        </div>
                        
                        <p className={`text-sm ${colors.subtext}`}>
                          {alert.message}
                        </p>
                        
                        {alert.explanation && (
                          <div className={`text-xs ${colors.subtext} bg-white dark:bg-gray-900/50 rounded p-2`}>
                            <p className="font-medium mb-1">📊 Por quê?</p>
                            <p>{alert.explanation}</p>
                          </div>
                        )}
                        
                        {showRecommendations && alert.recommendation && (
                          <div className={`text-xs ${colors.subtext} bg-white dark:bg-gray-900/50 rounded p-2 border-l-2 ${colors.border}`}>
                            <p className="font-medium mb-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Recomendação
                            </p>
                            <p>{alert.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
