/**
 * Supabase Server Client
 *
 * Usa a SERVICE_ROLE key — deve ser usado APENAS em Server Actions ('use server').
 * Nunca expor esta chave no client-side.
 *
 * O userId é sempre passado explicitamente em todas as queries (.eq('user_id', userId))
 * garantindo isolamento de dados sem depender do RLS via auth.uid().
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Supabase environment variables missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
  )
}

/**
 * Cria um cliente Supabase com service role key.
 * Instância nova a cada chamada (seguro para Server Actions em ambiente serverless).
 */
export function createSupabaseServerClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
