import { z } from 'zod'

/**
 * Status do planejamento financeiro
 */
export const PLANNING_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
  AT_RISK: 'at_risk',
} as const

export type PlanningStatus = typeof PLANNING_STATUS[keyof typeof PLANNING_STATUS]

/**
 * N\u00edveis de risco financeiro
 */
export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type RiskLevel = typeof RISK_LEVEL[keyof typeof RISK_LEVEL]

/**
 * Categorias de planejamento financeiro
 * Extensíveis e personalizáveis
 */
export const PLANNING_CATEGORIES = {
  TRAVEL: { value: 'travel', label: 'Viagem', icon: '✈️' },
  PURCHASE: { value: 'purchase', label: 'Compra', icon: '🛒' },
  EMERGENCY: { value: 'emergency', label: 'Emergência', icon: '⚠️' },
  EMERGENCY_RESERVE: { value: 'emergency_reserve', label: 'Reserva de Emergência', icon: '⚡' },
  HIGH_VALUE: { value: 'high_value', label: 'Alto Valor', icon: '💎' },
  EXORBITANT_EXPENSE: { value: 'exorbitant_expense', label: 'Despesa Exorbitante', icon: '🎯' },
  EDUCATION: { value: 'education', label: 'Educação', icon: '🎓' },
  HEALTH: { value: 'health', label: 'Saúde', icon: '❤️' },
  HOUSING: { value: 'housing', label: 'Moradia', icon: '🏠' },
  UNPLANNED: { value: 'unplanned', label: 'Imprevisto', icon: '🚨' },
  CUSTOM: { value: 'custom', label: 'Personalizado', icon: '🎯' },
} as const

export type PlanningCategoryValue = typeof PLANNING_CATEGORIES[keyof typeof PLANNING_CATEGORIES]['value']
export type PlanningCategory = PlanningCategoryValue // Alias for backwards compatibility

/**
 * ============================================================================
 * DADOS ESPEC\u00cdFICOS POR CATEGORIA
 * ============================================================================
 */

/**
 * Dados específicos para VIAGEM
 */
export interface TravelPlanningData {
  destination: string
  travelType: 'leisure' | 'work' | 'exchange' | 'family' | 'other'
  numberOfPeople: number
  startDate: string
  endDate: string
  departureDate?: string // Alias for startDate
  returnDate?: string // Alias for endDate
  currency?: 'BRL' | 'USD' | 'EUR' | 'GBP' | 'other'
  notes?: string
  estimatedCosts?: {
    transportation?: number
    flights?: number // Alias for transportation
    accommodation?: number
    food?: number
    activities?: number
    other?: number
  }
}

/**
 * Dados específicos para COMPRA / ALTO VALOR
 */
export interface PurchasePlanningData {
  itemType: 'electronics' | 'vehicle' | 'property' | 'furniture' | 'appliance' | 'other'
  itemDescription: string
  store?: string
  paymentMethod: 'cash' | 'installments' | 'mixed'
  installments?: number | {
    numberOfInstallments: number
    interestRate: number
    installmentAmount: number
  }
  interestRate?: number
  downPayment?: number
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  canWait: boolean
  notes?: string
}

/**
 * Dados espec\u00edficos para RESERVA DE EMERG\u00caNCIA
 */
export interface EmergencyReservePlanningData {
  reserveType: 'emergency' | 'maintenance' | 'health' | 'insurance' | 'other'
  monthlyFixedCosts: number
  monthsOfExpenses?: number
  monthlyExpenses?: number
  recommendedAmount?: number
  recommendedMonths: number
  currentSafety: number // Meses de cobertura atual
  minimumRequired: number // Valor mínimo recomendado
  investmentType?: 'savings' | 'cdb' | 'treasury'
}

/**
 * Dados espec\u00edficos para GASTO EXORBITANTE
 */
export interface ExorbitantExpensePlanningData {
  riskClassification: RiskLevel
  description?: string
  justification: string
  incomePercentage: number
  isRecurring: boolean
  hasAlternatives: boolean
  alternatives?: string
  alternativesConsidered?: string
  userConfirmedRisk: boolean
  impactAwareness: boolean
  riskAwareness?: 'low' | 'medium' | 'high'
  backupPlan?: string
  urgencyLevel?: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
}


/**
 * Union type de dados espec\u00edficos
 */
export type CategorySpecificData = 
  | { category: 'travel'; data: TravelPlanningData }
  | { category: 'purchase' | 'high_value'; data: PurchasePlanningData }
  | { category: 'emergency'; data: EmergencyReservePlanningData }
  | { category: 'unplanned'; data: ExorbitantExpensePlanningData }
  | { category: 'custom'; data: Record<string, any> }

/**
 * ============================================================================
 * CONTEXTO FINANCEIRO DO USU\u00c1RIO
 * ============================================================================
 */

/**
 * Contexto financeiro completo do usu\u00e1rio
 */
export interface FinancialContext {
  // Renda
  monthlyIncome: number
  averageIncome: number // M\u00e9dia dos \u00faltimos 3 meses
  
  // Gastos
  monthlyFixedExpenses: number
  monthlyVariableExpenses: number
  
  // Planejamentos
  activePlanningsCount: number
  monthlyCommittedAmount: number // Soma de todos os planejamentos ativos
  
  // Dispon\u00edvel
  freeIncome: number // monthlyIncome - fixedExpenses - committedAmount
  freeIncomePercentage: number
  
  // Status
  isHealthy: boolean
  riskLevel: RiskLevel
}

/**
 * ============================================================================
 * SIMULA\u00c7\u00d5ES E C\u00c1LCULOS
 * ============================================================================
 */

/**
 * Simula\u00e7\u00e3o de planejamento
 */
export interface PlanningSimulation {
  // Valores calculados
  monthlyRequired: number // Quanto precisa guardar por m\u00eas
  monthsToComplete: number // Tempo estimado para completar
  
  // Impacto
  incomePercentage: number // % da renda comprometida
  freeIncomePercentage: number // % da renda livre comprometida
  
  // Viabilidade
  isViable: boolean
  viabilityReason?: string
  
  // Compara\u00e7\u00f5es
  comparisons?: {
    cashVsInstallments?: {
      cashTotal: number
      installmentsTotal: number
      difference: number
      recommendation: string
    }
    waitVsNow?: {
      impactNow: number
      impactLater: number
      monthsToWait: number
      recommendation: string
    }
  }
}

/**
 * Alerta financeiro
 */
export interface FinancialAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success' | 'risk' | 'recommendation'
  severity: RiskLevel
  title: string
  message: string
  explanation: string
  recommendation?: string
  isBlocker: boolean
}

/**
 * Recomenda\u00e7\u00e3o de ajuste
 */
export interface PlanningRecommendation {
  type: 'increase_deadline' | 'reduce_amount' | 'wait_period' | 'adjust_payment' | 'reconsider'
  title: string
  description: string
  impact: {
    before: number
    after: number
    improvement: number
  }
  actionable: boolean
}

/**
 * Interface principal do planejamento financeiro
 */
export interface Planning {
  id: string
  userId: string
  name: string
  category: PlanningCategoryValue
  targetAmount: number
  currentAmount: number
  startDate: string
  targetDate?: string
  status: PlanningStatus
  notes?: string
  linkedExpenseIds: string[]
  
  // Dados espec\u00edficos por categoria
  categoryData?: TravelPlanningData | PurchasePlanningData | EmergencyReservePlanningData | ExorbitantExpensePlanningData | Record<string, any>
  
  // Contexto no momento da cria\u00e7\u00e3o
  creationContext?: {
    monthlyIncome: number
    freeIncome: number
    activePlannings: number
  }
  
  // Simula\u00e7\u00e3o calculada
  simulation?: PlanningSimulation
  
  // Alertas
  alerts?: FinancialAlert[]
  
  // Risco
  riskLevel: RiskLevel
  
  createdAt: Date
  updatedAt: Date
}

/**
 * Schema de validação com Zod
 */
export const planningSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string(),
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  category: z.enum([
    PLANNING_CATEGORIES.TRAVEL.value,
    PLANNING_CATEGORIES.PURCHASE.value,
    PLANNING_CATEGORIES.EMERGENCY.value,
    PLANNING_CATEGORIES.EMERGENCY_RESERVE.value,
    PLANNING_CATEGORIES.HIGH_VALUE.value,
    PLANNING_CATEGORIES.EXORBITANT_EXPENSE.value,
    PLANNING_CATEGORIES.EDUCATION.value,
    PLANNING_CATEGORIES.HEALTH.value,
    PLANNING_CATEGORIES.HOUSING.value,
    PLANNING_CATEGORIES.UNPLANNED.value,
    PLANNING_CATEGORIES.CUSTOM.value,
  ] as const),
  targetAmount: z.number()
    .positive('Valor deve ser maior que zero')
    .max(9999999999, 'Valor muito alto'),
  currentAmount: z.number()
    .min(0, 'Valor atual não pode ser negativo')
    .max(9999999999, 'Valor muito alto')
    .default(0),
  startDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date))
  }, 'Data de início inválida'),
  targetDate: z.string().refine((date) => {
    if (!date) return true
    return !isNaN(Date.parse(date))
  }, 'Data alvo inválida').optional(),
  status: z.enum([
    PLANNING_STATUS.PLANNED,
    PLANNING_STATUS.IN_PROGRESS,
    PLANNING_STATUS.COMPLETED,
    PLANNING_STATUS.CANCELLED,
  ] as const).default(PLANNING_STATUS.PLANNED),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional(),
  linkedExpenseIds: z.array(z.string()).default([]),
  categoryData: z.any().optional(),
  creationContext: z.any().optional(),
  simulation: z.any().optional(),
  alerts: z.array(z.any()).default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

/**
 * Validação customizada: targetDate deve ser posterior a startDate
 */
export const planningSchemaWithDateValidation = planningSchema.refine(
  (data) => {
    if (!data.targetDate) return true
    return new Date(data.targetDate) > new Date(data.startDate)
  },
  {
    message: 'Data alvo deve ser posterior à data de início',
    path: ['targetDate'],
  }
)

/**
 * Schema para criação (sem id, userId, timestamps)
 */
export const createPlanningSchema = planningSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * Schema para atualização (campos opcionais, exceto id)
 */
export const updatePlanningSchema = planningSchema
  .partial()
  .required({ id: true })
  .omit({ userId: true, createdAt: true })

/**
 * Types inferidos dos schemas
 */
export type CreatePlanningInput = z.infer<typeof createPlanningSchema>
export type UpdatePlanningInput = z.infer<typeof updatePlanningSchema>

/**
 * Indicadores visuais do planejamento
 */
export interface PlanningIndicators {
  progress: number // 0-100
  isOverBudget: boolean // currentAmount > targetAmount
  isDelayed: boolean // today > targetDate
  isCompleted: boolean
  isCancelled: boolean
  daysRemaining?: number
  amountRemaining: number
}

/**
 * Resumo de planejamentos
 */
export interface PlanningSummary {
  total: number
  planned: number
  inProgress: number
  completed: number
  cancelled: number
  totalTargetAmount: number
  totalCurrentAmount: number
  totalProgress: number
}

/**
 * Filtros para listagem de planejamentos
 */
export interface PlanningFilters {
  status?: PlanningStatus
  category?: PlanningCategoryValue
  search?: string
  startDateFrom?: string
  startDateTo?: string
}
