import { SupabaseBaseRepository } from '@/lib/repositories/supabase-base.repository'
import type { CreditCard } from '@/features/cards/types'

export class SupabaseCardRepository extends SupabaseBaseRepository<CreditCard> {
  protected tableName = 'credit_cards'

  protected fromRow(row: Record<string, unknown>): CreditCard {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      nickname: row.nickname as string,
      bankName: row.bank_name as string,
      brand: row.brand as CreditCard['brand'],
      last4Digits: row.last4_digits as string,
      closingDay: Number(row.closing_day),
      dueDay: Number(row.due_day),
      creditLimit: row.credit_limit != null ? Number(row.credit_limit) : undefined,
      isActive: row.is_active as boolean,
      createdAt: row.created_at ? new Date(row.created_at as string) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
    }
  }

  protected toRow(item: Partial<CreditCard>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (item.nickname !== undefined) row.nickname = item.nickname
    if (item.bankName !== undefined) row.bank_name = item.bankName
    if (item.brand !== undefined) row.brand = item.brand
    if (item.last4Digits !== undefined) row.last4_digits = item.last4Digits
    if (item.closingDay !== undefined) row.closing_day = item.closingDay
    if (item.dueDay !== undefined) row.due_day = item.dueDay
    if (item.creditLimit !== undefined) row.credit_limit = item.creditLimit
    if (item.isActive !== undefined) row.is_active = item.isActive
    return row
  }

  async findActive(userId: string): Promise<CreditCard[]> {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server')
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`[credit_cards] findActive: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }

  async softDelete(userId: string, id: string): Promise<boolean> {
    const updated = await this.update(userId, id, { isActive: false } as Partial<CreditCard>)
    return updated !== null
  }
}
