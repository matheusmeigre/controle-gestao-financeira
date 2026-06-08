import { SupabaseBaseRepository } from '@/lib/repositories/supabase-base.repository'
import type { CardBill } from '@/types/expense'

export class SupabaseCardBillRepository extends SupabaseBaseRepository<CardBill> {
  protected tableName = 'card_bills'

  protected fromRow(row: Record<string, unknown>): CardBill {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      cardName: row.card_name as string,
      totalAmount: Number(row.total_amount),
      date: row.date as string,
      description: row.description as string,
      divisions: (row.divisions as CardBill['divisions']) ?? [],
      items: (row.items as CardBill['items']) ?? [],
    }
  }

  protected toRow(item: Partial<CardBill>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (item.cardName !== undefined) row.card_name = item.cardName
    if (item.totalAmount !== undefined) row.total_amount = item.totalAmount
    if (item.date !== undefined) row.date = item.date
    if (item.description !== undefined) row.description = item.description
    if (item.divisions !== undefined) row.divisions = item.divisions
    if (item.items !== undefined) row.items = item.items
    return row
  }

  async findByMonth(userId: string, yearMonth: string): Promise<CardBill[]> {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server')
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('card_bills')
      .select('*')
      .eq('user_id', userId)
      .like('date', `${yearMonth}%`)
      .order('date', { ascending: false })
    if (error) throw new Error(`[card_bills] findByMonth: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }
}
