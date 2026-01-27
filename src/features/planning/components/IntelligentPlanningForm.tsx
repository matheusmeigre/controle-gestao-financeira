'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { CategorySelector } from './CategorySelector'
import { DynamicCategoryFields } from './DynamicCategoryFields'
import { FinancialContextDisplay } from './FinancialContextDisplay'
import { PlanningSimulationDisplay } from './PlanningSimulationDisplay'
import { BudgetImpactDisplay } from './BudgetImpactDisplay'
import { IntelligentAlertsDisplay } from './IntelligentAlertsDisplay'
import { useFinancialContext } from '../hooks/use-financial-context'
import { generateSimulation } from '../rules/calculations'
import { generateFinancialAlerts, hasBlockingAlerts } from '../rules/alerts'
import { generateRecommendations } from '../rules/recommendations'
import type { PlanningCategory, Planning } from '../types'
import { Save, AlertCircle } from 'lucide-react'

interface IntelligentPlanningFormProps {
  initialData?: Planning
  onSubmit: (data: Partial<Planning>) => Promise<void>
  onCancel: () => void
}

export function IntelligentPlanningForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: IntelligentPlanningFormProps) {
  const isEditing = !!initialData

  // Estado do Formulário
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState<PlanningCategory | null>(
    initialData?.category || null
  )
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount || 0)
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount || 0)
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().split('T')[0]
  )
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '')
  const [categoryData, setCategoryData] = useState<any>(initialData?.categoryData || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Contexto Financeiro
  const context = useFinancialContext()

  // Simulação em Tempo Real
  const simulation = useMemo(() => {
    if (!category || !targetAmount || !targetDate || !context) return null

    return generateSimulation(
      targetAmount,
      currentAmount,
      startDate,
      targetDate,
      context,
      categoryData
    )
  }, [category, targetAmount, currentAmount, startDate, targetDate, context, categoryData])

  // Alertas Inteligentes
  const alerts = useMemo(() => {
    if (!simulation || !context) return []

    return generateFinancialAlerts(
      simulation,
      context,
      targetAmount,
      category!
    )
  }, [simulation, context, targetAmount, category])

  // Recomendações
  const recommendations = useMemo(() => {
    if (!simulation || !targetAmount || !targetDate || !context) return []

    return generateRecommendations(
      targetAmount,
      currentAmount,
      startDate,
      targetDate,
      simulation,
      context
    )
  }, [simulation, targetAmount, currentAmount, startDate, targetDate, context])

  // Validação de Formulário
  const canSubmit = useMemo(() => {
    if (!name || !category || !targetAmount || !targetDate) return false
    if (!simulation) return false
    if (hasBlockingAlerts(alerts)) return false
    return true
  }, [name, category, targetAmount, targetDate, simulation, alerts])

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        category: category!,
        targetAmount,
        currentAmount,
        startDate,
        targetDate,
        categoryData,
        creationContext: context ? {
          monthlyIncome: context.monthlyIncome,
          freeIncome: context.freeIncome,
          activePlannings: context.activePlanningsCount,
        } : undefined,
        simulation: simulation!,
        alerts,
        riskLevel: context?.riskLevel || 'low',
        status: initialData?.status || 'planned',
      })
    } catch (error) {
      console.error('Erro ao salvar planejamento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!context) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* BLOCO 1: Seleção de Categoria */}
      {!isEditing && (
        <CategorySelector
          selectedCategory={category}
          onSelectCategory={setCategory}
        />
      )}

      {/* BLOCO 2: Contexto Financeiro (Read-Only) */}
      {category && (
        <FinancialContextDisplay context={context} />
      )}

      {/* BLOCO 3: Dados Básicos do Planejamento */}
      {category && (
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground">
              O que você está planejando?
            </Label>
            <Input
              id="name"
              placeholder="ex: Reserva de emergência"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl h-14 transition-all duration-150 focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="text-xs uppercase tracking-wide text-muted-foreground">
              Quanto você precisa economizar por mês?
            </Label>
            <CurrencyInput
              id="targetAmount"
              placeholder="0,00"
              value={targetAmount}
              onChange={setTargetAmount}
              className="text-4xl font-mono h-20 transition-all duration-150 focus:ring-2"
            />
            {targetAmount > 0 && simulation && (
              <p className="text-sm text-muted-foreground">
                {simulation.incomePercentage.toFixed(0)}% da sua renda livre
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentAmount" className="text-sm">Quanto já tem guardado?</Label>
              <CurrencyInput
                id="currentAmount"
                placeholder="0,00"
                value={currentAmount}
                onChange={setCurrentAmount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm">Data de Início</Label>
              <DatePicker
                id="startDate"
                value={startDate}
                onChange={setStartDate}
                placeholder="Quando vai começar?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate" className="text-sm">Data Objetivo *</Label>
              <DatePicker
                id="targetDate"
                value={targetDate}
                onChange={setTargetDate}
                placeholder="Quando precisa alcançar?"
                minDate={startDate}
              />
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 3.5: Campos Dinâmicos por Categoria */}
      {category && categoryData && Object.keys(categoryData).length > 0 && (
        <div className="space-y-4 max-w-2xl">
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-semibold mb-4">
              {category === 'travel' && 'Detalhes da Viagem'}
              {category === 'purchase' && 'Detalhes da Compra'}
              {category === 'emergency_reserve' && 'Configuração da Reserva'}
              {category === 'exorbitant_expense' && 'Justificativa e Planejamento'}
              {!['travel', 'purchase', 'emergency_reserve', 'exorbitant_expense'].includes(category) && 'Detalhes'}
            </h4>
            <DynamicCategoryFields
              category={category}
              data={categoryData}
              onChange={setCategoryData}
            />
          </div>
        </div>
      )}

      {/* BLOCO 4: Simulação em Tempo Real */}
      {simulation && (
        <PlanningSimulationDisplay
          simulation={simulation}
          targetAmount={targetAmount}
          currentAmount={currentAmount}
        />
      )}

      {/* BLOCO 5: Impacto no Orçamento */}
      {simulation && (
        <BudgetImpactDisplay
          currentContext={context}
          monthlyRequired={simulation.monthlyRequired}
          planningName={name || 'este planejamento'}
        />
      )}

      {/* BLOCO 6: Alertas Inteligentes */}
      {alerts.length > 0 && (
        <IntelligentAlertsDisplay alerts={alerts} />
      )}

      {/* BLOCO 7: Confirmação (Sticky Footer) */}
      {simulation && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-6 -mx-4 mt-12">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pronto para criar</p>
              <p className="text-lg font-semibold">{name || 'Novo planejamento'}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">
                  {simulation.monthlyRequired.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}/mês
                </span>
                <span>•</span>
                <span>{simulation.incomePercentage.toFixed(0)}% da renda</span>
                <span>•</span>
                <span className={simulation.isViable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {simulation.isViable ? 'Viável' : 'Atenção'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="min-w-[160px] h-12 text-base transition-all duration-150"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Salvando...
                  </div>
                ) : (
                  'Criar Planejamento'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
