import { SupabaseBaseRepository } from '@/lib/repositories/supabase-base.repository'
import type { Planning } from '@/features/planning/types'

export class SupabasePlanningRepository extends SupabaseBaseRepository<Planning> {
  protected tableName = 'plannings'

  protected fromRow(row: Record<string, unknown>): Planning {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      name: row.name as string,
      category: row.category as Planning['category'],
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      startDate: row.start_date as string,
      targetDate: row.target_date as string | undefined,
      status: row.status as Planning['status'],
      notes: row.notes as string | undefined,
      linkedExpenseIds: (row.linked_expense_ids as string[]) ?? [],
      categoryData: row.category_data as Planning['categoryData'],
      creationContext: row.creation_context as Planning['creationContext'],
      simulation: row.simulation as Planning['simulation'],
      alerts: (row.alerts as Planning['alerts']) ?? [],
      riskLevel: row.risk_level as Planning['riskLevel'],
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  protected toRow(item: Partial<Planning>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (item.name !== undefined) row.name = item.name
    if (item.category !== undefined) row.category = item.category
    if (item.targetAmount !== undefined) row.target_amount = item.targetAmount
    if (item.currentAmount !== undefined) row.current_amount = item.currentAmount
    if (item.startDate !== undefined) row.start_date = item.startDate
    if (item.targetDate !== undefined) row.target_date = item.targetDate ?? null
    if (item.status !== undefined) row.status = item.status
    if (item.notes !== undefined) row.notes = item.notes ?? null
    if (item.linkedExpenseIds !== undefined) row.linked_expense_ids = item.linkedExpenseIds
    if (item.categoryData !== undefined) row.category_data = item.categoryData ?? null
    if (item.creationContext !== undefined) row.creation_context = item.creationContext ?? null
    if (item.simulation !== undefined) row.simulation = item.simulation ?? null
    if (item.alerts !== undefined) row.alerts = item.alerts
    if (item.riskLevel !== undefined) row.risk_level = item.riskLevel
    return row
  }

  async findByStatus(userId: string, status: Planning['status']): Promise<Planning[]> {
    const supabase = this.client()
    const { data, error } = await supabase
      .from('plannings')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })
    if (error) throw new Error(`[plannings] findByStatus: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }
}
