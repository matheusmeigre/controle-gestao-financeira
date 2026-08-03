import { describe, expect, it } from 'vitest'
import { mobileQueryKeys } from './query-keys'

describe('mobile query keys', () => {
  it('creates stable keys for invoice filters', () => {
    expect(mobileQueryKeys.invoices({ cardId: 'card-1', month: 8, year: 2026 })).toEqual([
      'mobile',
      'invoices',
      { cardId: 'card-1', month: 8, year: 2026 },
    ])
  })

  it('creates stable keys for expenses filter', () => {
    expect(mobileQueryKeys.expenses('2026-08')).toEqual(['mobile', 'expenses', { yearMonth: '2026-08' }])
  })
})
