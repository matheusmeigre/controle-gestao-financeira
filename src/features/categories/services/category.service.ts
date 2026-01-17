/**
 * Categories Service
 * 
 * Serviço para gerenciar categorias financeiras
 */

import { FINANCIAL_CATEGORIES, type Category, type CategoryType } from '../types'

export class CategoryService {
  /**
   * Retorna todas as categorias
   */
  static getAllCategories(): Category[] {
    return FINANCIAL_CATEGORIES
  }

  /**
   * Retorna categorias de um tipo específico
   */
  static getCategoriesByType(type: CategoryType): Category[] {
    return FINANCIAL_CATEGORIES.filter(cat => cat.type.includes(type))
  }

  /**
   * Retorna categorias de despesas
   */
  static getExpenseCategories(): Category[] {
    return this.getCategoriesByType('expense')
  }

  /**
   * Retorna categorias de rendas
   */
  static getIncomeCategories(): Category[] {
    return this.getCategoriesByType('income')
  }

  /**
   * Retorna categorias de transações
   */
  static getTransactionCategories(): Category[] {
    return this.getCategoriesByType('transaction')
  }

  /**
   * Busca categoria por nome
   */
  static getCategoryByName(name: string): Category | undefined {
    return FINANCIAL_CATEGORIES.find(cat => cat.name === name)
  }

  /**
   * Busca categoria por ID
   */
  static getCategoryById(id: string): Category | undefined {
    return FINANCIAL_CATEGORIES.find(cat => cat.id === id)
  }

  /**
   * Retorna nomes das categorias de um tipo (para retrocompatibilidade)
   */
  static getCategoryNames(type: CategoryType): string[] {
    return this.getCategoriesByType(type).map(cat => cat.name)
  }

  /**
   * Valida se uma categoria existe
   */
  static isValidCategory(name: string, type?: CategoryType): boolean {
    if (!type) {
      return FINANCIAL_CATEGORIES.some(cat => cat.name === name)
    }
    
    return FINANCIAL_CATEGORIES.some(
      cat => cat.name === name && cat.type.includes(type)
    )
  }

  /**
   * Agrupa categorias por tipo
   */
  static groupCategoriesByType(): Record<CategoryType, Category[]> {
    return {
      expense: this.getExpenseCategories(),
      income: this.getIncomeCategories(),
      transaction: this.getTransactionCategories(),
    }
  }
}

// ==================== ARRAYS DE RETROCOMPATIBILIDADE ====================
// Para não quebrar código existente que importa arrays diretamente

/**
 * @deprecated Use CategoryService.getCategoryNames('expense')
 */
export const CATEGORIES = CategoryService.getCategoryNames('expense')

/**
 * @deprecated Use CategoryService.getCategoryNames('income')
 */
export const INCOME_CATEGORIES = CategoryService.getCategoryNames('income')

/**
 * @deprecated Use CategoryService.getCategoryNames('transaction')
 */
export const TRANSACTION_CATEGORIES = CategoryService.getCategoryNames('transaction')
