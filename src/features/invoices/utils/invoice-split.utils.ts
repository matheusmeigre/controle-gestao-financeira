/**
 * Invoice Split Utilities
 *
 * Funções para extrair e calcular a divisão de faturas por pessoa.
 * A divisão é armazenada no campo `item.notes` no formato:
 *   "Pessoa: <nome>\n<notas adicionais opcionais>"
 */

import type { Invoice, InvoiceItem } from '../types'

/** Nome da pessoa padrão (o usuário logado) */
export const MY_PERSON_NAME = 'Eu'

/** Cores por pessoa — mesmas usadas no InvoiceEditModal */
export const PERSON_COLORS: Record<string, string> = {
  Eu: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  Mãe: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  Irmão:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  Outro:
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800',
}

/**
 * Extrai o nome da pessoa a partir do campo `notes` de um item.
 * Retorna "Eu" se nenhuma pessoa estiver registrada.
 */
export function getPersonFromNotes(notes?: string): string {
  if (!notes) return MY_PERSON_NAME
  const match = notes.match(/^Pessoa: (.+)/m)
  return match?.[1]?.trim() || MY_PERSON_NAME
}

/**
 * Retorna a cor CSS correspondente a uma pessoa.
 * Usa a cor de "Outro" como fallback.
 */
export function getPersonColor(personName: string): string {
  return PERSON_COLORS[personName] ?? PERSON_COLORS['Outro']
}

/**
 * Verifica se a fatura possui divisão real entre mais de uma pessoa.
 * Retorna `false` se todos os itens pertencem a "Eu" (ou se não há itens).
 */
export function hasPersonSplit(invoice: Invoice): boolean {
  if (!invoice.items || invoice.items.length === 0) return false
  const persons = new Set(invoice.items.map((item) => getPersonFromNotes(item.notes)))
  return persons.size > 1
}

/**
 * Calcula o total atribuído a cada pessoa na fatura.
 * Retorna um Record: { "Eu": 1125.59, "Mãe": 322.80, "Irmão": 116.67 }
 */
export function getPersonDivisions(invoice: Invoice): Record<string, number> {
  const divisions: Record<string, number> = {}
  for (const item of invoice.items) {
    const person = getPersonFromNotes(item.notes)
    divisions[person] = (divisions[person] ?? 0) + item.amount
  }
  return divisions
}

/**
 * Retorna o total dos itens atribuídos a `myPersonName` (padrão: "Eu").
 *
 * - Se a fatura não tem divisão (apenas "Eu" ou sem tags), retorna `totalAmount`.
 * - Se há divisão, retorna apenas a soma dos itens do usuário.
 */
export function getMyPortion(invoice: Invoice, myPersonName: string = MY_PERSON_NAME): number {
  if (!hasPersonSplit(invoice)) return invoice.totalAmount

  return invoice.items
    .filter((item) => getPersonFromNotes(item.notes) === myPersonName)
    .reduce((sum, item) => sum + item.amount, 0)
}

/**
 * Retorna os itens de uma fatura atribuídos a uma pessoa específica.
 */
export function getItemsByPerson(items: InvoiceItem[], personName: string): InvoiceItem[] {
  return items.filter((item) => getPersonFromNotes(item.notes) === personName)
}
