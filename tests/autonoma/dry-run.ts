import { randomUUID } from 'node:crypto'
import { signBody } from '@autonoma-ai/sdk'
import { clerkClient } from '@clerk/nextjs/server'
import { beforeAll, describe, expect, it } from 'vitest'
import discover from '../../autonoma/discover.json'
import recipe from '../../autonoma/recipe.json'
import { POST } from '../../src/app/api/autonoma/route'
import { createSupabaseServerClient } from '../../src/lib/supabase/server'

const requiredEnvironment = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLERK_SECRET_KEY',
]

const sharedSecret = 'autonoma-dry-run-shared'
const signingSecret = 'autonoma-dry-run-signing'

function assertSafeEnvironment() {
  const missing = requiredEnvironment.filter((name) => !process.env[name])
  expect(missing, `Missing environment variables: ${missing.join(', ')}`).toEqual([])
  expect(
    process.env.AUTONOMA_DRY_RUN,
    'Set AUTONOMA_DRY_RUN=true only when .env.local points to isolated test services',
  ).toBe('true')
  expect(
    process.env.CLERK_SECRET_KEY?.startsWith('sk_test_'),
    'The dry run refuses to use a Clerk production secret',
  ).toBe(true)
}

async function signedPost(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload)
  return POST(new Request('http://localhost/api/autonoma', {
    method: 'POST',
    body,
    headers: {
      'x-signature': signBody(body, sharedSecret),
    },
  }))
}

describe('Autonoma scenario lifecycle', () => {
  beforeAll(() => {
    process.env.AUTONOMA_ENABLED = 'true'
    process.env.AUTONOMA_SHARED_SECRET = sharedSecret
    process.env.AUTONOMA_SIGNING_SECRET = signingSecret
  })

  it('exposes signed factory discovery', async () => {
    const body = JSON.stringify({ action: 'discover' })

    const unsignedResponse = await POST(new Request('http://localhost/api/autonoma', {
      method: 'POST',
      body,
    }))
    expect(unsignedResponse.status).toBe(401)

    const response = await POST(new Request('http://localhost/api/autonoma', {
      method: 'POST',
      body,
      headers: {
        'x-signature': signBody(body, sharedSecret),
      },
    }))
    const payload = await response.json() as { schema: unknown }

    expect(response.status).toBe(200)
    expect(payload.schema).toEqual(discover)
  })

  it('rejects foreign references and rolls back a partial up', async () => {
    assertSafeEnvironment()
    const testRunId = randomUUID()
    const email = `rollback+clerk_test_${testRunId}@example.com`

    const response = await signedPost({
      action: 'up',
      testRunId,
      create: {
        User: [{ _alias: 'rollback-user', email }],
        Invoice: [{
          userId: { _ref: 'rollback-user' },
          cardId: randomUUID(),
          totalAmount: 10,
        }],
      },
    })

    expect(response.status).toBe(500)
    const client = await clerkClient()
    const users = await client.users.getUserList({ emailAddress: [email] })
    expect(users.totalCount).toBe(0)
  })

  for (const scenario of recipe.recipes) {
    it(`creates and tears down ${scenario.name}`, async () => {
      assertSafeEnvironment()

      const testRunId = randomUUID()
      let refsToken: string | undefined
      let userId: string | undefined
      let invoiceIds: string[] = []

      try {
        const upResponse = await signedPost({
          action: 'up',
          testRunId,
          create: scenario.create,
        })
        const upPayload = await upResponse.json() as {
          auth?: { credentials?: Record<string, string> }
          refs?: Record<string, Array<Record<string, unknown>>>
          refsToken?: string
        }

        refsToken = upPayload.refsToken
        expect(upResponse.status, JSON.stringify(upPayload, null, 2)).toBe(200)
        expect(upPayload.auth?.credentials?.email).toContain('+clerk_test_')
        expect(upPayload.auth?.credentials?.password).toBeTruthy()
        expect(refsToken).toBeTruthy()

        userId = String(upPayload.refs?.User?.[0]?.id)
        invoiceIds = (upPayload.refs?.Invoice ?? []).map((record) => String(record.id))

        if (scenario.name === 'standard') {
          const client = createSupabaseServerClient()
          expect(client).not.toBeNull()
          const { error } = await client!.from('expenses').insert({
            id: randomUUID(),
            user_id: userId,
            description: 'Created outside the factory',
            amount: 1,
            category: 'Outros',
            date: new Date().toISOString().slice(0, 10),
            status: 'pending',
            is_recurring: false,
            recurring_frequency: null,
            due_date: null,
            is_active: true,
            notes: null,
            card_name: null,
            person_name: null,
          })
          expect(error).toBeNull()
        }
      } finally {
        if (refsToken) {
          const downResponse = await signedPost({ action: 'down', refsToken })
          const downPayload = await downResponse.json()
          expect(downResponse.status, JSON.stringify(downPayload, null, 2)).toBe(200)
        }
      }

      if (userId) {
        const client = createSupabaseServerClient()!
        for (const tableName of ['invoices', 'credit_cards', 'card_bills', 'plannings', 'expenses', 'incomes']) {
          const table = client.from(tableName as never) as any
          const { count, error } = await table
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
          expect(error).toBeNull()
          expect(count, `${tableName} leaked rows for ${scenario.name}`).toBe(0)
        }
      }

      if (invoiceIds.length > 0) {
        const client = createSupabaseServerClient()!
        const { count, error } = await client
          .from('invoice_items')
          .select('id', { count: 'exact', head: true })
          .in('invoice_id', invoiceIds)
        expect(error).toBeNull()
        expect(count).toBe(0)
      }
    })
  }
})
