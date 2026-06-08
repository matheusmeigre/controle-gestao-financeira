import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { Invoice, InvoiceItem } from '@/features/invoices/types'

/**
 * SupabaseInvoiceRepository
 *
 * Gerencia `invoices` (tabela principal) + `invoice_items` (tabela filha).
 * Mantém a mesma interface do InvoiceRepository original para
 * compatibilidade total com services e hooks existentes.
 */
export class SupabaseInvoiceRepository {
  private getClient() {
    const supabase = createSupabaseServerClient()
    if (!supabase) throw new Error('[SupabaseInvoiceRepository] Client not initialized — missing environment variables')
    return supabase
  }

  private toInvoiceItem(row: Record<string, unknown>): InvoiceItem {
    return {
      id: row.id as string,
      invoiceId: row.invoice_id as string,
      date: new Date(row.date as string),
      description: row.description as string,
      amount: Number(row.amount),
      category: (row.category as string) ?? 'Outros',
      installment: row.installment as string | undefined,
      notes: row.notes as string | undefined,
      createdAt: row.created_at ? new Date(row.created_at as string) : undefined,
    }
  }

  private toInvoice(row: Record<string, unknown>, items: InvoiceItem[]): Invoice {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      cardId: row.card_id as string,
      month: Number(row.month),
      year: Number(row.year),
      closingDate: new Date(row.closing_date as string),
      dueDate: new Date(row.due_date as string),
      totalAmount: Number(row.total_amount),
      paidAmount: Number(row.paid_amount),
      isPaid: row.is_paid as boolean,
      items,
      createdAt: row.created_at ? new Date(row.created_at as string) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
    }
  }

  async findAll(userId: string): Promise<Invoice[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) throw new Error(`[invoices] findAll: ${error.message}`)

    return (data ?? []).map((row) => {
      const items = ((row as Record<string, unknown>).invoice_items as Record<string, unknown>[] ?? [])
        .map((i) => this.toInvoiceItem(i))
      return this.toInvoice(row as Record<string, unknown>, items)
    })
  }

  async findById(userId: string, id: string): Promise<Invoice | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`[invoices] findById: ${error.message}`)
    if (!data) return null

    const items = ((data as Record<string, unknown>).invoice_items as Record<string, unknown>[] ?? [])
      .map((i) => this.toInvoiceItem(i))
    return this.toInvoice(data as Record<string, unknown>, items)
  }

  async findByCard(userId: string, cardId: string): Promise<Invoice[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) throw new Error(`[invoices] findByCard: ${error.message}`)
    return (data ?? []).map((row) => {
      const items = ((row as Record<string, unknown>).invoice_items as Record<string, unknown>[] ?? [])
        .map((i) => this.toInvoiceItem(i))
      return this.toInvoice(row as Record<string, unknown>, items)
    })
  }

  async findByCardAndPeriod(
    userId: string,
    cardId: string,
    month: number,
    year: number
  ): Promise<Invoice | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (error) throw new Error(`[invoices] findByCardAndPeriod: ${error.message}`)
    if (!data) return null

    const items = ((data as Record<string, unknown>).invoice_items as Record<string, unknown>[] ?? [])
      .map((i) => this.toInvoiceItem(i))
    return this.toInvoice(data as Record<string, unknown>, items)
  }

  async findByPeriod(userId: string, month: number, year: number): Promise<Invoice[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)

    if (error) throw new Error(`[invoices] findByPeriod: ${error.message}`)
    return (data ?? []).map((row) => {
      const items = ((row as Record<string, unknown>).invoice_items as Record<string, unknown>[] ?? [])
        .map((i) => this.toInvoiceItem(i))
      return this.toInvoice(row as Record<string, unknown>, items)
    })
  }

  async create(userId: string, invoice: Invoice): Promise<Invoice> {
    const supabase = this.getClient()
    const invoiceId = invoice.id ?? crypto.randomUUID()

    const { error: invError } = await (supabase.from('invoices') as any).insert({
      id: invoiceId,
      user_id: userId,
      card_id: invoice.cardId,
      month: invoice.month,
      year: invoice.year,
      closing_date: invoice.closingDate instanceof Date
        ? invoice.closingDate.toISOString().split('T')[0]
        : invoice.closingDate,
      due_date: invoice.dueDate instanceof Date
        ? invoice.dueDate.toISOString().split('T')[0]
        : invoice.dueDate,
      total_amount: invoice.totalAmount,
      paid_amount: invoice.paidAmount,
      is_paid: invoice.isPaid,
    })

    if (invError) throw new Error(`[invoices] create: ${invError.message}`)

    // Insere os itens
    if (invoice.items.length > 0) {
      const itemRows = invoice.items.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        invoice_id: invoiceId,
        date: item.date instanceof Date
          ? item.date.toISOString().split('T')[0]
          : item.date,
        description: item.description,
        amount: item.amount,
        category: item.category ?? 'Outros',
        installment: item.installment ?? null,
        notes: item.notes ?? null,
      }))

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemRows as any)
      if (itemsError) throw new Error(`[invoice_items] create: ${itemsError.message}`)
    }

    return { ...invoice, id: invoiceId }
  }

  async update(userId: string, id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const supabase = this.getClient()

    // Monta apenas os campos que foram passados
    const row: Record<string, unknown> = {}
    if (updates.isPaid !== undefined) row.is_paid = updates.isPaid
    if (updates.paidAmount !== undefined) row.paid_amount = updates.paidAmount
    if (updates.totalAmount !== undefined) row.total_amount = updates.totalAmount
    if (updates.closingDate !== undefined)
      row.closing_date = updates.closingDate instanceof Date
        ? updates.closingDate.toISOString().split('T')[0]
        : updates.closingDate
    if (updates.dueDate !== undefined)
      row.due_date = updates.dueDate instanceof Date
        ? updates.dueDate.toISOString().split('T')[0]
        : updates.dueDate

    if (Object.keys(row).length > 0) {
      const { error } = await (supabase.from('invoices') as any)
        .update(row)
        .eq('user_id', userId)
        .eq('id', id)

      if (error) throw new Error(`[invoices] update: ${error.message}`)
    }

    // Se items foram passados — substitui completamente
    if (updates.items !== undefined) {
      // Deleta os itens antigos
      await supabase.from('invoice_items').delete().eq('invoice_id', id)

      if (updates.items.length > 0) {
        const itemRows = updates.items.map((item) => ({
          id: item.id ?? crypto.randomUUID(),
          invoice_id: id,
          date: item.date instanceof Date
            ? item.date.toISOString().split('T')[0]
            : item.date,
          description: item.description,
          amount: item.amount,
          category: item.category ?? 'Outros',
          installment: item.installment ?? null,
          notes: item.notes ?? null,
        }))

      const { error: itemsError } = await (supabase.from('invoice_items') as any).insert(itemRows)
        if (itemsError) throw new Error(`[invoice_items] update: ${itemsError.message}`)
      }
    }

    return this.findById(userId, id)
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const supabase = this.getClient()
    // invoice_items são deletados em cascade pelo banco
    const { error, count } = await supabase
      .from('invoices')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)

    if (error) throw new Error(`[invoices] delete: ${error.message}`)
    return (count ?? 0) > 0
  }
}
