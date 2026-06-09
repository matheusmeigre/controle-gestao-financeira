/**
 * Supabase Server Client
 *
 * Usa a SERVICE_ROLE key — deve ser usado APENAS em Server Actions ('use server').
 * Nunca expor esta chave no client-side.
 *
 * O userId é sempre passado explicitamente em todas as queries (.eq('user_id', userId))
 * garantindo isolamento de dados sem depender do RLS via auth.uid().
 *
 * Otimizações de performance:
 * - Cache do cliente por request (module-level — seguro pois cada request serverless
 *   roda em isolation)
 * - Timeout de 10s via AbortController para evitar hanging em conexões lentas
 * - Conexão HTTP reutilizada entre chamadas dentro da mesma server action
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

let cachedClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Cria ou retorna o cliente Supabase cacheado com service role key.
 * Cache por request (module-level em serverless é seguro pois cada request roda em isolamento).
 * Timeout de 10s via AbortController.
 * Retorna null se as env vars não estiverem configuradas.
 */
export function createSupabaseServerClient() {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Supabase] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    return null
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (url: URL | RequestInfo, options?: RequestInit) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        try {
          const res = await fetch(url, { ...options, signal: controller.signal })
          clearTimeout(timeout)
          return res
        } catch (e) {
          clearTimeout(timeout)
          throw e
        }
      },
    },
  })

  return cachedClient
}
