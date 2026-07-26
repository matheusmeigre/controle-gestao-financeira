import type { Invoice, InvoiceItem } from '../types'

/**
 * @deprecated Use server actions (@/server/actions/invoices) directly instead.
 * Mantido apenas para compatibilidade durante migração.
 */
export class InvoiceService {
  /**
   * Calcula total de uma lista de itens.
   */
  calculateTotal(items: InvoiceItem[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  /**
   * Filtra faturas pendentes a partir de dados já carregados.
   */
  getPendingInvoices(invoices: Invoice[]): Invoice[] {
    return invoices.filter(i => !i.isPaid)
  }

  /**
   * Filtra faturas com vencimento próximo a partir de dados já carregados.
   */
  getInvoicesDueSoon(invoices: Invoice[], days: number = 7): Invoice[] {
    const today = new Date()
    const limit = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    return invoices.filter(i => {
      if (i.isPaid) return false
      const dueDate = new Date(i.dueDate)
      return dueDate >= today && dueDate <= limit
    })
  }
}
