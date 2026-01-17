/**
 * Categories Feature - Types
 * 
 * Fonte única de verdade para todas as categorias do sistema
 */

export type CategoryType = 'expense' | 'income' | 'transaction'

export interface Category {
  id: string
  name: string
  type: CategoryType[]
  icon?: string
  color?: string
  description?: string
}

/**
 * Categorias Financeiras Completas
 * Única fonte de verdade para todo o sistema
 */
export const FINANCIAL_CATEGORIES: Category[] = [
  // Despesas
  { id: 'alimentacao', name: 'Alimentação', type: ['expense', 'transaction'] },
  { id: 'transporte', name: 'Transporte', type: ['expense', 'transaction'] },
  { id: 'saude', name: 'Saúde', type: ['expense', 'transaction'] },
  { id: 'educacao', name: 'Educação', type: ['expense', 'transaction'] },
  { id: 'moradia', name: 'Moradia', type: ['expense', 'transaction'] },
  { id: 'lazer', name: 'Lazer', type: ['expense', 'transaction'] },
  { id: 'vestuario', name: 'Vestuário', type: ['expense', 'transaction'] },
  { id: 'assinaturas', name: 'Assinaturas', type: ['expense', 'transaction'] },
  { id: 'impostos', name: 'Impostos e Taxas', type: ['expense', 'transaction'] },
  { id: 'investimentos', name: 'Investimentos', type: ['expense', 'income', 'transaction'] },
  { id: 'outros', name: 'Outros', type: ['expense', 'transaction'] },
  
  // Rendas
  { id: 'salario', name: 'Salário', type: ['income'] },
  { id: 'freelance', name: 'Freelance', type: ['income'] },
  { id: 'investimentos-renda', name: 'Rendimentos de Investimentos', type: ['income'] },
  { id: 'bonus', name: 'Bônus', type: ['income'] },
  { id: 'presentes', name: 'Presentes', type: ['income'] },
  { id: 'vendas', name: 'Vendas', type: ['income'] },
  { id: 'outros-renda', name: 'Outros', type: ['income'] },
]

// Helper types para retrocompatibilidade
export type ExpenseCategory = string
export type IncomeCategory = string
export type TransactionCategory = string
