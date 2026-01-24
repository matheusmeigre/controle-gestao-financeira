/**
 * Feature: Planejamento Financeiro Inteligente
 * 
 * Módulo completo para criação, acompanhamento e gestão de planejamentos financeiros.
 * Inclui simulações em tempo real, análise contextual e alertas inteligentes.
 */

// Types
export * from './types'

// Services
export { PlanningService } from './services/planning.service'
export { PlanningRepository } from './services/planning.repository'

// Rules Engine
export * from './rules'

// Hooks
export * from './hooks/use-plannings'
export * from './hooks/use-financial-context'

// Components
export { PlanningForm } from './components/PlanningForm'
export { PlanningCard } from './components/PlanningCard'
export { PlanningList } from './components/PlanningList'
export { PlanningSummary } from './components/PlanningSummary'
export { PlanningAlerts } from './components/PlanningAlerts'

// Intelligent Components
export { IntelligentPlanningForm } from './components/IntelligentPlanningForm'
export { CategorySelector } from './components/CategorySelector'
export { DynamicCategoryFields } from './components/DynamicCategoryFields'
export { FinancialContextDisplay } from './components/FinancialContextDisplay'
export { PlanningSimulationDisplay } from './components/PlanningSimulationDisplay'
export { BudgetImpactDisplay } from './components/BudgetImpactDisplay'
export { IntelligentAlertsDisplay } from './components/IntelligentAlertsDisplay'


