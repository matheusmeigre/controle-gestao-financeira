'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { AlertCircle, Loader2 } from 'lucide-react'

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
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Contexto Financeiro
  const { context, loading: contextLoading, error: contextError, retry } = useFinancialContext()

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitError(null)
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
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar o planejamento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (contextLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (contextError || !context) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-destructive/25 bg-destructive/10 p-6 text-center" role="alert">
        <AlertCircle className="mx-auto mb-3 size-7 text-destructive" aria-hidden="true" />
        <h2 className="font-semibold">Contexto financeiro indisponível</h2>
        <p className="mt-1 text-sm text-muted-foreground">{contextError ?? 'Tente carregar os dados novamente.'}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={retry}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
      {/* BLOCO 1: Seleção de Categoria */}
      {!isEditing && (
        <CategorySelector
          selectedCategory={category}
          onSelectCategory={(nextCategory) => {
            setCategory(nextCategory)
            setCategoryData({})
          }}
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
              Qual é o valor total da sua meta?
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
      {category && (
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

      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      {/* BLOCO 7: Confirmação (Sticky Footer) */}
      {simulation && (
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-12 border-t border-border bg-background/95 p-4 backdrop-blur-sm md:bottom-0 sm:p-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            
            <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                className="flex-1 sm:min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="h-12 flex-1 text-base transition-all duration-150 sm:min-w-[160px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
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
    </form>
  )
}
