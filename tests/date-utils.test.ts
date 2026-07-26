import { describe, expect, it } from 'vitest'
import { isValidDateString } from '@/lib/date-utils'

describe('isValidDateString', () => {
  it('accepts valid calendar dates, including leap years', () => {
    expect(isValidDateString('2026-07-26')).toBe(true)
    expect(isValidDateString('2024-02-29')).toBe(true)
  })

  it('rejects invalid or normalized calendar dates', () => {
    expect(isValidDateString('2026-02-31')).toBe(false)
    expect(isValidDateString('2025-02-29')).toBe(false)
    expect(isValidDateString('2026-13-01')).toBe(false)
    expect(isValidDateString('26-07-26')).toBe(false)
    expect(isValidDateString('')).toBe(false)
  })
})
