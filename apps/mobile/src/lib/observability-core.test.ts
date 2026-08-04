import { describe, expect, it } from 'vitest'
import { getMobileObservabilitySnapshot, pushObservabilityEvent, sanitizeObservabilityValue } from './observability-core'

describe('mobile observability core', () => {
  it('redacts sensitive values from tracked context', () => {
    const sanitized = sanitizeObservabilityValue({
      authorization: 'Bearer secret-token-value',
      paidAmount: 100,
      cardId: 'card-1',
      file: 'statement.pdf',
      nested: { token: 'another-secret', uri: 'file://private/path' },
    })

    expect(sanitized).toEqual({
      authorization: '[REDACTED]',
      paidAmount: '[REDACTED]',
      cardId: '[REDACTED]',
      file: '[REDACTED]',
      nested: { token: '[REDACTED]', uri: '[REDACTED]' },
    })
  })

  it('stores events in the snapshot buffer', () => {
    pushObservabilityEvent({
      type: 'test',
      level: 'info',
      message: 'ok',
      timestamp: new Date().toISOString(),
    })

    expect(getMobileObservabilitySnapshot().at(-1)?.type).toBe('test')
  })
})
