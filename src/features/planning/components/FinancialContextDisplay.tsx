'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FinancialContext, RiskLevel } from '../types'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

interface FinancialContextDisplayProps {
  context: FinancialContext
}

export function FinancialContextDisplay({ context }: FinancialContextDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const calculatePercentage = (value: number, total: number): string => {
    if (!total || total === 0 || !isFinite(value / total)) {
      return '0'
    }
    return ((value / total) * 100).toFixed(0) + '%'
  }

  const getRiskConfig = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return {
          label: 'Baixo',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: CheckCircle,
        }
      case 'medium':
        return {
          label: 'M\u00e9dio',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: AlertCircle,
        }
      case 'high':
        return {
          label: 'Alto',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          icon: AlertCircle,
        }
      case 'critical':
        return {
          label: 'Cr\u00edtico',
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: AlertCircle,
        }
    }
  }

  const riskConfig = getRiskConfig(context.riskLevel)
  const RiskIcon = riskConfig.icon

  return (
    <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Seu Contexto Financeiro
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Visão automática da sua situação atual
            </p>
          </div>
          <Badge className={riskConfig.color}>
            <RiskIcon className="w-3 h-3 mr-1" />
            Risco {riskConfig.label}
          </Badge>
        </div>

        {/* Barra Visual de Renda */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-blue-900 dark:text-blue-100">
            <span>Distribuição da Renda</span>
            <span>{formatCurrency(context.monthlyIncome)}</span>
          </div>

          <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex">
            {/* Gastos Fixos */}
            <div
              className="bg-red-400 dark:bg-red-600 flex items-center justify-center text-xs text-white font-medium"
              style={{
                width: `${calculatePercentage(context.monthlyFixedExpenses, context.monthlyIncome)}`,
              }}
              title={`Gastos Fixos: ${formatCurrency(context.monthlyFixedExpenses)}`}
            >
              {context.monthlyFixedExpenses > 0 && (
                <span className="truncate px-1">Fixos</span>
              )}
            </div>

            {/* Planejamentos */}
            <div
              className="bg-yellow-400 dark:bg-yellow-600 flex items-center justify-center text-xs text-white font-medium"
              style={{
                width: `${calculatePercentage(context.monthlyCommittedAmount, context.monthlyIncome)}%`,
              }}
              title={`Planejamentos: ${formatCurrency(context.monthlyCommittedAmount)}`}
            >
              {context.monthlyCommittedAmount > 0 && (
                <span className="truncate px-1">Planos</span>
              )}
            </div>

            {/* Renda Livre */}
            <div
              className="bg-green-400 dark:bg-green-600 flex items-center justify-center text-xs text-white font-medium"
              style={{
                width: `${calculatePercentage(context.freeIncome, context.monthlyIncome)}%`,
              }}
              title={`Renda Livre: ${formatCurrency(context.freeIncome)}`}
            >
              {context.freeIncome > 0 && (
                <span className="truncate px-1">Livre</span>
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-600"></span>
              Gastos Fixos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-600"></span>
              Planejamentos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-600"></span>
              Renda Livre
            </span>
          </div>
        </div>

        {/* M\u00e9tricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Renda Livre</span>
            </div>
            <p className="font-semibold text-sm">{formatCurrency(context.freeIncome)}</p>
            <p className="text-xs text-muted-foreground">
              {context.freeIncomePercentage.toFixed(0)}% da renda
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingDown className="w-3 h-3" />
              <span>Gastos Fixos</span>
            </div>
            <p className="font-semibold text-sm">{formatCurrency(context.monthlyFixedExpenses)}</p>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(context.monthlyFixedExpenses, context.monthlyIncome)}% da renda
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Planejamentos</span>
            </div>
            <p className="font-semibold text-sm">{context.activePlanningsCount}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(context.monthlyCommittedAmount)}/mês
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              {context.isHealthy ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-600" />
              )}
              <span>Saúde</span>
            </div>
            <p className="font-semibold text-sm">
              {context.isHealthy ? 'Saudável' : 'Atenção'}
            </p>
            <p className="text-xs text-muted-foreground">
              {context.isHealthy ? 'Margem OK' : 'Margem baixa'}
            </p>
          </div>
        </div>

        {/* Dica */}
        <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded p-2">
          <strong>Dica:</strong> {context.isHealthy 
            ? 'Sua situação financeira está saudável. Você pode adicionar novos planejamentos com segurança.'
            : 'Sua margem de segurança está baixa. Considere reduzir compromissos ou aumentar renda antes de novos planejamentos.'
          }
        </div>
      </div>
    </Card>
  )
}
