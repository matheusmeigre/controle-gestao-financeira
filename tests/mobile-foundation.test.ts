import { describe, expect, it, vi } from 'vitest'
import { createMobileAppApiClient, loadMobileBootstrapSession, resolveMobileApiBaseUrl } from '../apps/mobile/src'

describe('mobile app foundation', () => {
  it('resolves the mobile api base url from the environment', () => {
    expect(resolveMobileApiBaseUrl({ apiBaseUrl: 'https://example.com/' })).toBe('https://example.com/api/v1')
  })

  it('creates a client bound to the environment and session token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ data: { id: 'user-1' } }),
    })

    const client = createMobileAppApiClient(
      { apiBaseUrl: 'https://example.com' },
      async () => ({ accessToken: 'token-123' }),
      { fetchImpl: fetchMock as typeof fetch }
    )

    await expect(client.getMe()).resolves.toEqual({ id: 'user-1' })
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/v1/me', expect.any(Object))
  })

  it('loads the bootstrap session through the shared mobile client', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const bodyByPath: Record<string, unknown> = {
        'https://example.com/api/v1/me': { data: { id: 'user-1' } },
        'https://example.com/api/v1/bootstrap': {
          data: {
            apiVersion: 'v1',
            serverTime: '2026-08-03T12:00:00.000Z',
            currentPeriod: { year: 2026, month: 8, yearMonth: '2026-08' },
            summary: { expensesCount: 0, incomesCount: 0, invoicesCount: 0, cardsCount: 0, planningsCount: 0 },
            capabilities: { me: '/api/v1/me', bootstrap: '/api/v1/bootstrap' },
          },
        },
        'https://example.com/api/v1/expenses?yearMonth=2026-08': { data: [] },
        'https://example.com/api/v1/incomes?yearMonth=2026-08': { data: [] },
        'https://example.com/api/v1/cards': { data: [] },
        'https://example.com/api/v1/plannings': { data: [] },
        'https://example.com/api/v1/invoices': { data: [] },
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => bodyByPath[url],
      }
    })

    const session = await loadMobileBootstrapSession({
      environment: { apiBaseUrl: 'https://example.com' },
      getSession: async () => ({ accessToken: 'token-123' }),
      clientOptions: { fetchImpl: fetchMock as typeof fetch },
      yearMonth: '2026-08',
    })

    expect(session.me.id).toBe('user-1')
    expect(fetchMock).toHaveBeenCalledTimes(7)
  })
})
