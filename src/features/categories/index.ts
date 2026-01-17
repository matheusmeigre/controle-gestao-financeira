/**
 * Categories Feature - Barrel Export
 * 
 * Exporta todos os componentes, serviços e tipos de categorias
 */

// Types
export type { Category, CategoryType, ExpenseCategory, IncomeCategory, TransactionCategory } from './types'
export { FINANCIAL_CATEGORIES } from './types'

// Services
export { CategoryService, CATEGORIES, INCOME_CATEGORIES, TRANSACTION_CATEGORIES } from './services/category.service'
