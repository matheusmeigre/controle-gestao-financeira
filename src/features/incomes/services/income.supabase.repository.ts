import { SupabaseBaseRepository } from '@/lib/repositories/supabase-base.repository'
import type { Income } from '@/features/incomes/types'

export class SupabaseIncomeRepository extends SupabaseBaseRepository<Income> {
  protected tableName = 'incomes'

  protected fromRow(row: Record<string, unknown>): Income {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      description: row.description as string,
      amount: Number(row.amount),
      type: row.type as Income['type'],
      category: row.category as string | undefined,
      date: row.date as string,
      status: row.status as Income['status'],
      registrationDate: row.registration_date as string,
      receivedDate: row.received_date as string | null,
    }
  }

  protected toRow(item: Partial<Income>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (item.description !== undefined) row.description = item.description
    if (item.amount !== undefined) row.amount = item.amount
    if (item.type !== undefined) row.type = item.type
    if (item.category !== undefined) row.category = item.category
    if (item.date !== undefined) row.date = item.date
    if (item.status !== undefined) row.status = item.status
    if (item.registrationDate !== undefined) row.registration_date = item.registrationDate
    if (item.receivedDate !== undefined) row.received_date = item.receivedDate
    return row
  }

  async findAll(userId: string): Promise<Income[]> {
    const supabase = this.client()
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('registration_date', { ascending: false })
    if (error) throw new Error(`[${this.tableName}] findAll: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }

  async markAsReceived(userId: string, id: string): Promise<Income | null> {
    return this.update(userId, id, {
      status: 'received',
      receivedDate: new Date().toISOString(),
    } as Partial<Income>)
  }

  async findByMonth(userId: string, yearMonth: string): Promise<Income[]> {
    const supabase = this.client()
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${yearMonth}%`)
      .order('date', { ascending: false })
    if (error) throw new Error(`[incomes] findByMonth: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }
}
