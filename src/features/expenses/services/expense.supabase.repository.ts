import { SupabaseBaseRepository } from '@/lib/repositories/supabase-base.repository'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Expense } from '@/features/expenses/types'

export class SupabaseExpenseRepository extends SupabaseBaseRepository<Expense> {
  protected tableName = 'expenses'

  protected fromRow(row: Record<string, unknown>): Expense {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      description: row.description as string,
      amount: Number(row.amount),
      category: row.category as string,
      date: row.date as string,
      status: row.status as Expense['status'],
      isRecurring: row.is_recurring as boolean | undefined,
      recurringFrequency: row.recurring_frequency as Expense['recurringFrequency'],
      dueDate: row.due_date as string | undefined,
      isActive: row.is_active as boolean | undefined,
      notes: row.notes as string | undefined,
      cardName: row.card_name as string | undefined,
      personName: row.person_name as string | undefined,
    }
  }

  protected toRow(item: Partial<Expense>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (item.description !== undefined) row.description = item.description
    if (item.amount !== undefined) row.amount = item.amount
    if (item.category !== undefined) row.category = item.category
    if (item.date !== undefined) row.date = item.date
    if (item.status !== undefined) row.status = item.status
    if (item.isRecurring !== undefined) row.is_recurring = item.isRecurring
    if (item.recurringFrequency !== undefined) row.recurring_frequency = item.recurringFrequency
    if (item.dueDate !== undefined) row.due_date = item.dueDate
    if (item.isActive !== undefined) row.is_active = item.isActive
    if (item.notes !== undefined) row.notes = item.notes
    if (item.cardName !== undefined) row.card_name = item.cardName
    if (item.personName !== undefined) row.person_name = item.personName
    return row
  }

  async findByMonth(userId: string, yearMonth: string): Promise<Expense[]> {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${yearMonth}%`)
      .order('date', { ascending: false })
    if (error) throw new Error(`[expenses] findByMonth: ${error.message}`)
    return (data ?? []).map((row: Record<string, unknown>) => this.fromRow(row))
  }
}
