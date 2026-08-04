export type ObservabilityLevel = 'info' | 'warning' | 'error'

export type ObservabilityEvent = {
  type: string
  level: ObservabilityLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const mobileObservabilityBuffer: ObservabilityEvent[] = []

export function sanitizeObservabilityValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
      .replace(/sk_[A-Za-z0-9_-]+/gi, '[REDACTED_SECRET]')
      .replace(/pk_[A-Za-z0-9_-]+/gi, '[REDACTED_PUBLIC_KEY]')
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObservabilityValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => {
        if (/token|authorization|password|secret|amount|paidAmount|creditLimit|file|uri|cardId/i.test(key)) {
          return [key, '[REDACTED]']
        }

        return [key, sanitizeObservabilityValue(entryValue)]
      })
    )
  }

  return value
}

export function pushObservabilityEvent(event: ObservabilityEvent) {
  mobileObservabilityBuffer.push(event)

  if (mobileObservabilityBuffer.length > 100) {
    mobileObservabilityBuffer.shift()
  }
}

export function getMobileObservabilitySnapshot() {
  return [...mobileObservabilityBuffer]
}
