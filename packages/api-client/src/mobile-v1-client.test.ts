import { describe, expect, it, vi } from 'vitest'
import { createMobileApiClient } from './mobile-v1-client'

describe('mobile v1 client coverage', () => {
  it('requests expense detail from the public endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        id: 'expense-1',
        description: 'Internet',
        amount: 120,
        category: 'Casa',
        date: '2026-08-01',
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } }))

    const client = createMobileApiClient({ baseUrl: 'https://example.com/api/v1', fetchImpl })
    const expense = await client.getExpense('expense-1')

    expect(expense.id).toBe('expense-1')
    expect(fetchImpl).toHaveBeenCalledWith('https://example.com/api/v1/expenses/expense-1', expect.any(Object))
  })

  it('requests income detail from the public endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        id: 'income-1',
        description: 'Salario',
        amount: 5000,
        type: 'salary',
        date: '2026-08-01',
        status: 'pending',
        registrationDate: '2026-08-01T00:00:00.000Z',
        receivedDate: null,
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } }))

    const client = createMobileApiClient({ baseUrl: 'https://example.com/api/v1', fetchImpl })
    const income = await client.getIncome('income-1')

    expect(income.id).toBe('income-1')
    expect(fetchImpl).toHaveBeenCalledWith('https://example.com/api/v1/incomes/income-1', expect.any(Object))
  })
})
