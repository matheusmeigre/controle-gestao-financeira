'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Card>
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
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2"> Seu Contexto Financeiro</h3>
            <p className="text-sm text-muted-foreground">
              Entenda sua situação atual antes de planejar
            </p>
          </div>
          <FinancialContextDisplay context={context} />
        </div>
      )}

      {/* BLOCO 3: Dados Básicos do Planejamento */}
      {category && (
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Dados do Planejamento</h3>
            <p className="text-sm text-muted-foreground">
              Defina os parâmetros do seu objetivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do Planejamento *</Label>
              <Input
                id="name"
                placeholder="Ex: Viagem para Paris em Julho"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor Total Necessário *</Label>
              <CurrencyInput
                id="targetAmount"
                placeholder="0,00"
                value={targetAmount}
                onChange={setTargetAmount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Quanto já tem guardado?</Label>
              <CurrencyInput
                id="currentAmount"
                placeholder="0,00"
                value={currentAmount}
                onChange={setCurrentAmount}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <DatePicker
                id="startDate"
                value={startDate}
                onChange={setStartDate}
                placeholder="Quando vai começar?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Data Objetivo *</Label>
              <DatePicker
                id="targetDate"
                value={targetDate}
                onChange={setTargetDate}
                placeholder="Quando precisa alcançar?"
                minDate={startDate}
              />
            </div>
          </div>
        </Card>
      )}

      {/* BLOCO 3.5: Campos Dinâmicos por Categoria */}
      {category && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {category === 'travel' && 'Detalhes da Viagem'}
              {category === 'purchase' && 'Detalhes da Compra'}
              {category === 'emergency_reserve' && 'Configuração da Reserva'}
              {category === 'exorbitant_expense' && 'Justificativa e Planejamento'}
              {!['travel', 'purchase', 'emergency_reserve', 'exorbitant_expense'].includes(category) && 'Detalhes'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Informações específicas desta categoria
            </p>
          </div>
          <DynamicCategoryFields
            category={category}
            data={categoryData}
            onChange={setCategoryData}
          />
        </div>
      )}

      {/* BLOCO 4: Simulação em Tempo Real */}
      {simulation && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Simulação Financeira</h3>
            <p className="text-sm text-muted-foreground">
              Cálculos em tempo real
            </p>
          </div>
          <PlanningSimulationDisplay
            simulation={simulation}
            targetAmount={targetAmount}
            currentAmount={currentAmount}
          />
        </div>
      )}

      {/* BLOCO 5: Impacto no Orçamento */}
      {simulation && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Impacto no Orçamento</h3>
            <p className="text-sm text-muted-foreground">
              Comparação da sua situação atual e futura
            </p>
          </div>
          <BudgetImpactDisplay
            currentContext={context}
            monthlyRequired={simulation.monthlyRequired}
            planningName={name || 'este planejamento'}
          />
        </div>
      )}

      {/* BLOCO 6: Alertas Inteligentes */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Alertas e Recomendações</h3>
            <p className="text-sm text-muted-foreground">
              Análise inteligente do planejamento
            </p>
          </div>
          <IntelligentAlertsDisplay alerts={alerts} />
        </div>
      )}

      {/* BLOCO 7: Confirmação Consciente */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Confirmação</h3>
            <p className="text-sm text-muted-foreground">
              Resumo do planejamento
            </p>
          </div>

          {/* Resumo */}
          {simulation && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Valor Mensal</span>
                <Badge variant="outline">
                  {simulation.monthlyRequired.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Impacto na Renda</span>
                <Badge variant="outline">{simulation.incomePercentage.toFixed(0)}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Viabilidade</span>
                <Badge className={simulation.isViable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {simulation.isViable ? '✓ Viável' : '✗ Inviável'}
                </Badge>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Atualizar Planejamento' : 'Criar Planejamento'}
                </>
              )}
            </Button>
          </div>

          {!canSubmit && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {!name && <p>Preencha o nome do planejamento</p>}
                {!category && <p>Selecione uma categoria</p>}
                {!targetAmount && <p>Informe o valor total necessário</p>}
                {!targetDate && <p>Defina a data objetivo</p>}
                {hasBlockingAlerts(alerts) && <p>Resolva os alertas críticos antes de continuar</p>}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
