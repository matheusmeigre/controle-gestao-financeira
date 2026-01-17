/**
 * 🔧 Utilitários para Gerenciamento de Dados Multi-Tenant
 * 
 * Este arquivo contém funções helpers para manipulação segura de dados
 * com segregação por usuário (userId).
 */

import type { Expense, CardBill, Income } from "@/types/expense"

/**
 * Gera a chave do localStorage específica para o usuário
 */
export function getUserStorageKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`
}

/**
 * Carrega dados do localStorage com filtro de segurança por userId
 */
export function loadUserData<T extends { userId: string }>(
  storageKey: string,
  userId: string
): T[] {
  try {
    const key = getUserStorageKey(storageKey, userId)
    const data = localStorage.getItem(key)
    
    if (!data) return []
    
    const parsed = JSON.parse(data) as T[]
    
    // 🔒 Filtro de segurança: apenas dados do userId atual
    return parsed.filter(item => item.userId === userId)
  } catch (error) {
    console.error(`Erro ao carregar ${storageKey}:`, error)
    return []
  }
}

/**
 * Salva dados no localStorage com chave específica do usuário
 */
export function saveUserData<T>(
  storageKey: string,
  userId: string,
  data: T[]
): void {
  try {
    const key = getUserStorageKey(storageKey, userId)
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Erro ao salvar ${storageKey}:`, error)
  }
}

/**
 * 🔄 MIGRAÇÃO: Converte dados antigos (sem userId) para o novo formato
 * 
 * Uso: Execute esta função UMA VEZ após o primeiro login para migrar
 * dados existentes no localStorage para o formato multi-tenant.
 * 
 * @example
 * // No console do navegador ou em um useEffect:
 * migrateOldDataToUser('user_xxx')
 */
export function migrateOldDataToUser(userId: string): {
  expenses: number
  cardBills: number
  incomes: number
} {
  const migrated = {
    expenses: 0,
    cardBills: 0,
    incomes: 0
  }

  try {
    // Migrar expenses
    const oldExpenses = localStorage.getItem("expenses")
    if (oldExpenses) {
      const parsed = JSON.parse(oldExpenses) as Omit<Expense, "userId">[]
      const migrated_expenses = parsed.map(e => ({ ...e, userId }))
      saveUserData("expenses", userId, migrated_expenses)
      migrated.expenses = migrated_expenses.length
      
      // Opcional: remover dados antigos
      // localStorage.removeItem("expenses")
    }

    // Migrar cardBills
    const oldCardBills = localStorage.getItem("cardBills")
    if (oldCardBills) {
      const parsed = JSON.parse(oldCardBills) as Omit<CardBill, "userId">[]
      const migrated_cardBills = parsed.map(c => ({ ...c, userId }))
      saveUserData("cardBills", userId, migrated_cardBills)
      migrated.cardBills = migrated_cardBills.length
    }

    // Migrar incomes
    const oldIncomes = localStorage.getItem("incomes")
    if (oldIncomes) {
      const parsed = JSON.parse(oldIncomes) as Omit<Income, "userId">[]
      const migrated_incomes = parsed.map(i => ({ ...i, userId }))
      saveUserData("incomes", userId, migrated_incomes)
      migrated.incomes = migrated_incomes.length
    }

    console.log("✅ Migração concluída:", migrated)
    return migrated
  } catch (error) {
    console.error("❌ Erro na migração:", error)
    return migrated
  }
}

/**
 * Limpa todos os dados do usuário atual
 * ⚠️ CUIDADO: Esta ação é irreversível!
 */
export function clearUserData(userId: string): void {
  const confirm = window.confirm(
    "⚠️ ATENÇÃO: Isso irá deletar TODOS os seus dados financeiros. Continuar?"
  )
  
  if (!confirm) return

  const keys = ['expenses', 'cardBills', 'incomes']
  keys.forEach(key => {
    const storageKey = getUserStorageKey(key, userId)
    localStorage.removeItem(storageKey)
  })

  alert("✅ Todos os dados foram removidos. Recarregue a página.")
  window.location.reload()
}
