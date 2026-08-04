/**
 * Invoice Split Utilities
 *
 * Funções para extrair e calcular a divisão de faturas por pessoa.
 * A divisão é armazenada no campo `item.notes` no formato:
 *   "Pessoa: <nome>\n<notas adicionais opcionais>"
 */

import {
  getMyPortion,
  getPersonDivisions,
  getPersonFromNotes,
  hasPersonSplit,
  MY_PERSON_NAME,
} from '@domain/invoice-split'
import type { InvoiceItem } from '../types'

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
 * Retorna a cor CSS correspondente a uma pessoa.
 * Usa a cor de "Outro" como fallback.
 */
export function getPersonColor(personName: string): string {
  return PERSON_COLORS[personName] ?? PERSON_COLORS['Outro']
}

/**
 * Retorna os itens de uma fatura atribuídos a uma pessoa específica.
 */
export function getItemsByPerson(items: InvoiceItem[], personName: string): InvoiceItem[] {
  return items.filter((item) => getPersonFromNotes(item.notes) === personName)
}

export { getMyPortion, getPersonDivisions, getPersonFromNotes, hasPersonSplit, MY_PERSON_NAME }
