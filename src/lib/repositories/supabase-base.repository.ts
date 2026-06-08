/**
 * SupabaseBaseRepository
 *
 * Substitui o BaseRepository (localStorage) por Supabase.
 * Interface idêntica — hooks e services não precisam mudar.
 *
 * Toda operação filtra por user_id explicitamente (isolamento de dados).
 * Deve ser usado APENAS em Server Actions ('use server').
 */

import { createSupabaseServerClient } from '@/lib/supabase/server'

export abstract class SupabaseBaseRepository<T extends { id?: string; userId: string }> {
  protected abstract tableName: string

  /** Converte snake_case do Supabase para camelCase do app */
  protected abstract fromRow(row: Record<string, unknown>): T

  /** Converte camelCase do app para snake_case do Supabase */
  protected abstract toRow(item: Partial<T>): Record<string, unknown>

  async findAll(userId: string): Promise<T[]> {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`[${this.tableName}] findAll: ${error.message}`)
    return (data ?? []).map((row) => this.fromRow(row as Record<string, unknown>))
  }

  async findById(userId: string, id: string): Promise<T | null> {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`[${this.tableName}] findById: ${error.message}`)
    return data ? this.fromRow(data as Record<string, unknown>) : null
  }

  async create(userId: string, item: T): Promise<T> {
    const supabase = createSupabaseServerClient()
    const row = {
      ...this.toRow(item),
      user_id: userId,
      id: item.id ?? crypto.randomUUID(),
    }

    const { data, error } = await (supabase.from(this.tableName) as any)
      .insert(row)
      .select()
      .single()

    if (error) throw new Error(`[${this.tableName}] create: ${error.message}`)
    return this.fromRow(data as Record<string, unknown>)
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<T | null> {
    const supabase = createSupabaseServerClient()
    const row = this.toRow(updates)

    const { data, error } = await (supabase.from(this.tableName) as any)
      .update(row)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`[${this.tableName}] update: ${error.message}`)
    return data ? this.fromRow(data as Record<string, unknown>) : null
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const supabase = createSupabaseServerClient()
    const { error, count } = await supabase
      .from(this.tableName)
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)

    if (error) throw new Error(`[${this.tableName}] delete: ${error.message}`)
    return (count ?? 0) > 0
  }

  async deleteAll(userId: string): Promise<void> {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)

    if (error) throw new Error(`[${this.tableName}] deleteAll: ${error.message}`)
  }
}
