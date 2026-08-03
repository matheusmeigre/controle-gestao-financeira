import type {
  CreateMobilePlanning,
  CreateMobilePlanningContribution,
  MobilePlanning,
  UpdateMobilePlanning,
} from '@contracts'
import { SupabaseExpenseRepository } from '@/features/expenses/services/expense.supabase.repository'
import { SupabaseIncomeRepository } from '@/features/incomes/services/income.supabase.repository'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'
import {
  generateFinancialAlerts,
  generateSimulation,
  hasBlockingAlerts,
  evaluateRiskLevel,
} from '@/features/planning/rules'
import type { FinancialContext, Planning } from '@/features/planning/types'
import {
  assertLocalDate,
  ensureNonNegativeAmount,
  ensurePositiveAmount,
  toIsoDateTimeString,
} from './shared'

const expenseRepository = new SupabaseExpenseRepository()
const incomeRepository = new SupabaseIncomeRepository()
const repository = new SupabasePlanningRepository()

function toIsoDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function getMonthsDiff(startDate: string, targetDate?: string) {
  if (!targetDate) return 12

  const start = new Date(startDate)
  const end = new Date(targetDate)
  const today = new Date()
  const effectiveStart = today > start ? today : start
  const monthsDiff = (end.getFullYear() - effectiveStart.getFullYear()) * 12 + (end.getMonth() - effectiveStart.getMonth())
  return Math.max(monthsDiff, 1)
}

async function buildFinancialContext(userId: string, excludedPlanningId?: string): Promise<FinancialContext> {
  const [expenses, incomes, plannings] = await Promise.all([
    expenseRepository.findAll(userId),
    incomeRepository.findAll(userId),
    repository.findAll(userId),
  ])

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthIncomes = incomes.filter((income) => {
    const date = new Date(income.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const monthlyIncome = currentMonthIncomes.reduce((sum, income) => sum + income.amount, 0)

  const last3MonthsIncomes = incomes.filter((income) => {
    const date = new Date(income.date)
    const diff = (currentYear - date.getFullYear()) * 12 + (currentMonth - date.getMonth())
    return diff >= 0 && diff < 3
  })

  const averageIncome = last3MonthsIncomes.length > 0
    ? last3MonthsIncomes.reduce((sum, income) => sum + income.amount, 0) / 3
    : monthlyIncome

  const monthlyFixedExpenses = expenses
    .filter((expense) => expense.isRecurring || expense.category === 'Assinaturas')
    .reduce((sum, expense) => sum + expense.amount, 0)

  const monthlyVariableExpenses = expenses
    .filter((expense) => {
      const date = new Date(expense.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear && !expense.isRecurring
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const activePlannings = plannings.filter((planning) => {
    if (planning.id === excludedPlanningId) return false
    return planning.status !== 'completed' && planning.status !== 'cancelled'
  })

  const monthlyCommittedAmount = activePlannings.reduce((sum, planning) => {
    const remaining = Math.max(0, planning.targetAmount - planning.currentAmount)
    return sum + remaining / getMonthsDiff(planning.startDate, planning.targetDate)
  }, 0)

  const freeIncome = monthlyIncome - monthlyFixedExpenses - monthlyCommittedAmount
  const freeIncomePercentage = monthlyIncome > 0 ? (freeIncome / monthlyIncome) * 100 : 0
  const isHealthy = freeIncome > monthlyIncome * 0.2

  return {
    monthlyIncome,
    averageIncome,
    monthlyFixedExpenses,
    monthlyVariableExpenses,
    activePlanningsCount: activePlannings.length,
    monthlyCommittedAmount,
    freeIncome,
    freeIncomePercentage,
    isHealthy,
    riskLevel: evaluateRiskLevel(monthlyCommittedAmount, { monthlyIncome, freeIncome } as FinancialContext, monthlyCommittedAmount * 12),
  }
}

function normalizeCategoryForRules(category: string) {
  return category === 'emergency_reserve' ? 'emergency' : category
}

function safelyGenerateSimulation(planning: Planning, context: FinancialContext) {
  try {
    return generateSimulation(
      planning.targetAmount,
      planning.currentAmount,
      planning.startDate,
      planning.targetDate,
      context,
      planning.categoryData
    )
  } catch {
    return generateSimulation(
      planning.targetAmount,
      planning.currentAmount,
      planning.startDate,
      planning.targetDate,
      context
    )
  }
}

function derivePlanningStatus(planning: Planning, riskLevel: Planning['riskLevel'], hasBlockingRisk: boolean): Planning['status'] {
  if (planning.status === 'cancelled') return 'cancelled'
  if (planning.currentAmount >= planning.targetAmount) return 'completed'

  const today = toIsoDateOnly(new Date())
  if (planning.targetDate && planning.targetDate < today) return 'delayed'
  if (hasBlockingRisk || riskLevel === 'critical') return 'at_risk'
  if (planning.currentAmount > 0 || planning.linkedExpenseIds.length > 0) return 'in_progress'

  return 'planned'
}

async function enrichPlanning(userId: string, planning: Planning, excludedPlanningId?: string): Promise<Planning> {
  const context = await buildFinancialContext(userId, excludedPlanningId ?? planning.id)
  const simulation = safelyGenerateSimulation(planning, context)
  const alerts = generateFinancialAlerts(simulation, context, planning.targetAmount, normalizeCategoryForRules(planning.category))
  const riskLevel = evaluateRiskLevel(simulation.monthlyRequired, context, planning.targetAmount)
  const status = derivePlanningStatus(planning, riskLevel, hasBlockingAlerts(alerts))

  return {
    ...planning,
    simulation,
    alerts,
    riskLevel,
    status,
  }
}

function toPlanningDto(planning: Planning): MobilePlanning {
  return {
    id: planning.id,
    name: planning.name,
    category: planning.category,
    targetAmount: planning.targetAmount,
    currentAmount: planning.currentAmount,
    startDate: planning.startDate,
    targetDate: planning.targetDate,
    status: planning.status,
    notes: planning.notes,
    linkedExpenseIds: planning.linkedExpenseIds,
    categoryData: planning.categoryData,
    creationContext: planning.creationContext,
    simulation: planning.simulation,
    alerts: planning.alerts,
    riskLevel: planning.riskLevel,
    createdAt: toIsoDateTimeString(planning.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDateTimeString(planning.updatedAt) ?? new Date().toISOString(),
  }
}

function validatePlanningDates(startDate?: string, targetDate?: string) {
  if (startDate) {
    assertLocalDate(startDate, 'Data de início')
  }

  if (targetDate) {
    assertLocalDate(targetDate, 'Data alvo')
    if (startDate && targetDate <= startDate) {
      throw new Error('Data alvo deve ser posterior à data de início')
    }
  }
}

export async function listPlannings(userId: string): Promise<MobilePlanning[]> {
  const plannings = await repository.findAll(userId)
  const enriched = await Promise.all(plannings.map((planning) => enrichPlanning(userId, planning)))
  return enriched.map(toPlanningDto)
}

export async function getPlanning(userId: string, id: string): Promise<MobilePlanning | null> {
  const planning = await repository.findById(userId, id)
  return planning ? toPlanningDto(await enrichPlanning(userId, planning)) : null
}

export async function createPlanning(userId: string, input: CreateMobilePlanning): Promise<MobilePlanning> {
  if (!input.name.trim()) {
    throw new Error('Nome é obrigatório')
  }

  ensurePositiveAmount(input.targetAmount, 'Valor alvo deve ser maior que zero')
  ensureNonNegativeAmount(input.currentAmount, 'Valor atual não pode ser negativo')
  validatePlanningDates(input.startDate, input.targetDate)

  const draft: Planning = {
    id: crypto.randomUUID(),
    userId,
    name: input.name.trim(),
    category: input.category as Planning['category'],
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount,
    startDate: input.startDate,
    targetDate: input.targetDate,
    status: input.status as Planning['status'],
    notes: input.notes?.trim(),
    linkedExpenseIds: input.linkedExpenseIds,
    categoryData: input.categoryData as Planning['categoryData'],
    creationContext: input.creationContext as Planning['creationContext'],
    simulation: input.simulation as Planning['simulation'],
    alerts: input.alerts as Planning['alerts'],
    riskLevel: input.riskLevel,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const enriched = await enrichPlanning(userId, draft)
  const created = await repository.create(userId, enriched)

  return toPlanningDto(created)
}

export async function updatePlanning(userId: string, id: string, input: UpdateMobilePlanning): Promise<MobilePlanning | null> {
  if (input.name !== undefined && !input.name.trim()) {
    throw new Error('Nome não pode ser vazio')
  }

  if (input.targetAmount !== undefined) {
    ensurePositiveAmount(input.targetAmount, 'Valor alvo deve ser maior que zero')
  }

  if (input.currentAmount !== undefined) {
    ensureNonNegativeAmount(input.currentAmount, 'Valor atual não pode ser negativo')
  }

  const current = await repository.findById(userId, id)
  if (!current) return null

  validatePlanningDates(input.startDate ?? current.startDate, input.targetDate ?? current.targetDate)

  const draft: Planning = {
    ...current,
    name: input.name?.trim() ?? current.name,
    category: (input.category as Planning['category']) ?? current.category,
    targetAmount: input.targetAmount ?? current.targetAmount,
    currentAmount: input.currentAmount ?? current.currentAmount,
    startDate: input.startDate ?? current.startDate,
    targetDate: input.targetDate ?? current.targetDate,
    status: (input.status as Planning['status']) ?? current.status,
    notes: input.notes?.trim() ?? current.notes,
    linkedExpenseIds: input.linkedExpenseIds ?? current.linkedExpenseIds,
    categoryData: input.categoryData as Planning['categoryData'] ?? current.categoryData,
    creationContext: input.creationContext as Planning['creationContext'] ?? current.creationContext,
    simulation: input.simulation as Planning['simulation'] ?? current.simulation,
    alerts: input.alerts as Planning['alerts'] ?? current.alerts,
    riskLevel: input.riskLevel ?? current.riskLevel,
    updatedAt: new Date(),
  }

  const enriched = await enrichPlanning(userId, draft, id)
  const updated = await repository.update(userId, id, enriched as Partial<Planning>)

  return updated ? toPlanningDto(updated) : null
}

export async function contributeToPlanning(
  userId: string,
  id: string,
  input: CreateMobilePlanningContribution
): Promise<MobilePlanning | null> {
  ensurePositiveAmount(input.amount, 'Valor deve ser maior que zero')
  const current = await repository.findById(userId, id)
  if (!current) return null

  const draft: Planning = {
    ...current,
    currentAmount: current.currentAmount + input.amount,
    updatedAt: new Date(),
  }

  const enriched = await enrichPlanning(userId, draft, id)
  const updated = await repository.update(userId, id, enriched as Partial<Planning>)
  return updated ? toPlanningDto(updated) : null
}

export async function deletePlanning(userId: string, id: string): Promise<boolean> {
  return repository.delete(userId, id)
}
