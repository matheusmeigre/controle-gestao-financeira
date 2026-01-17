/**
 * Dashboard Feature - Barrel Export
 * 
 * Exporta todos os componentes, hooks e serviços do dashboard
 */

// Components
export { DashboardHeader } from './components/DashboardHeader'
export { MainNavigation } from './components/MainNavigation'
export { ExpensesTabContent } from './components/ExpensesTabContent'
export { CardsTabContent } from './components/CardsTabContent'
export { IncomesTabContent } from './components/IncomesTabContent'

// Hooks
export { useDashboardData } from './hooks/useDashboardData'
export { useWelcomeFlow } from './hooks/useWelcomeFlow'

// Services
export * as DashboardService from './services/dashboard.service'

// Types (re-export do hook)
export type { DashboardFilters, DashboardTabs } from './hooks/useDashboardData'
