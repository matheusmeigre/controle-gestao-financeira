import { describe, expect, it, vi } from 'vitest'
import { createMobileApiClient, MobileApiClientError } from '@api-client'

describe('mobile api client', () => {
  it('builds query strings and unwraps list responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        data: [
          { id: 'expense-1', description: 'Internet', amount: 100, category: 'Contas', date: '2026-08-01' },
        ],
      }),
    })

    const client = createMobileApiClient({ fetchImpl: fetchMock as typeof fetch })
    const data = await client.listExpenses({ yearMonth: '2026-08' })

    expect(data).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/expenses?yearMonth=2026-08', expect.any(Object))
  })

  it('throws problem details errors on failed requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/problem+json' }),
      json: async () => ({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Missing token',
      }),
    })

    const client = createMobileApiClient({ fetchImpl: fetchMock as typeof fetch })

    await expect(client.getMe()).rejects.toMatchObject<Partial<MobileApiClientError>>({
      name: 'MobileApiClientError',
      status: 401,
    })
  })

  it('injects bearer token and orchestrates bootstrap session', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      expect(init?.headers).toBeDefined()
      const headers = new Headers(init?.headers)
      expect(headers.get('authorization')).toBe('Bearer token-123')

      const bodyByPath: Record<string, unknown> = {
        '/api/v1/me': { data: { id: 'user-1' } },
        '/api/v1/bootstrap': {
          data: {
            apiVersion: 'v1',
            serverTime: '2026-08-03T12:00:00.000Z',
            currentPeriod: { year: 2026, month: 8, yearMonth: '2026-08' },
            summary: { expensesCount: 1, incomesCount: 1, invoicesCount: 1, cardsCount: 1, planningsCount: 1 },
            capabilities: { me: '/api/v1/me', bootstrap: '/api/v1/bootstrap' },
          },
        },
        '/api/v1/expenses?yearMonth=2026-08': { data: [] },
        '/api/v1/incomes?yearMonth=2026-08': { data: [] },
        '/api/v1/cards?includeInactive=false': { data: [] },
        '/api/v1/plannings': { data: [] },
        '/api/v1/invoices': { data: [] },
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => bodyByPath[url],
      }
    })

    const client = createMobileApiClient({
      fetchImpl: fetchMock as typeof fetch,
      getAccessToken: async () => 'token-123',
    })

    const session = await client.bootstrapSession({ yearMonth: '2026-08', includeInactiveCards: false })
    expect(session.me.id).toBe('user-1')
    expect(fetchMock).toHaveBeenCalledTimes(7)
  })

  it('supports card/planning detail reads and invoice item/import subflows', async () => {
    const file = new File(['date,description,amount'], 'fatura.csv', { type: 'text/csv' })

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url === '/api/v1/cards/card-1') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: {
              id: 'card-1',
              nickname: 'Nubank',
              bankName: 'Nubank',
              brand: 'Mastercard',
              last4Digits: '1234',
              closingDay: 10,
              dueDay: 20,
              isActive: true,
            },
          }),
        }
      }

      if (url === '/api/v1/plannings/planning-1') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: {
              id: 'planning-1',
              name: 'Reserva',
              category: 'emergency_reserve',
              targetAmount: 1000,
              currentAmount: 100,
              startDate: '2026-08-01',
              status: 'planned',
              linkedExpenseIds: [],
              riskLevel: 'low',
              createdAt: '2026-08-01T00:00:00.000Z',
              updatedAt: '2026-08-02T00:00:00.000Z',
            },
          }),
        }
      }

      if (url === '/api/v1/invoices/invoice-1/items') {
        expect(init?.method).toBe('POST')
        return {
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: {
              id: 'item-1',
              date: '2026-08-03',
              description: 'Mercado',
              amount: 50,
              category: 'Alimentação',
            },
          }),
        }
      }

      if (url === '/api/v1/invoices/imports/preview') {
        expect(init?.method).toBe('POST')
        expect(init?.body).toBeInstanceOf(FormData)
        const body = init?.body as FormData
        expect(body.get('cardId')).toBe('card-1')
        expect(body.get('month')).toBe('8')
        expect(body.get('year')).toBe('2026')
        expect(body.get('file')).toBe(file)

        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: {
              items: [
                {
                  id: 'item-1',
                  date: '2026-08-03',
                  description: 'Mercado',
                  amount: 50,
                  category: 'Alimentação',
                },
              ],
              metadata: {
                fileName: 'fatura.csv',
                fileSize: file.size,
                fileType: 'csv',
                processedAt: '2026-08-03T12:00:00.000Z',
                itemCount: 1,
                cardId: 'card-1',
                month: 8,
                year: 2026,
              },
            },
          }),
        }
      }

      if (url === '/api/v1/invoices/invoice-1/items/item-1') {
        expect(init?.method).toBe('DELETE')
        return {
          ok: true,
          status: 204,
          headers: new Headers(),
        }
      }

      throw new Error(`Unexpected URL: ${url}`)
    })

    const client = createMobileApiClient({ fetchImpl: fetchMock as typeof fetch })

    await expect(client.getCard('card-1')).resolves.toMatchObject({ id: 'card-1' })
    await expect(client.getPlanning('planning-1')).resolves.toMatchObject({ id: 'planning-1' })
    await expect(
      client.addInvoiceItem('invoice-1', {
        item: {
          date: '2026-08-03',
          description: 'Mercado',
          amount: 50,
          category: 'Alimentação',
        },
      })
    ).resolves.toMatchObject({ id: 'item-1' })
    await expect(
      client.previewInvoiceImport({ file, cardId: 'card-1', month: 8, year: 2026 })
    ).resolves.toMatchObject({ metadata: { fileName: 'fatura.csv' } })
    await expect(client.removeInvoiceItem('invoice-1', 'item-1')).resolves.toBeUndefined()
  })
})
