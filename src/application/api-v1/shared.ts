import { isValidDateString } from '@/lib/date-utils'

export function assertLocalDate(value: string, fieldName: string) {
  if (!isValidDateString(value)) {
    throw new Error(`${fieldName} inválida`)
  }
}

export function toLocalDateString(value: Date | string): string {
  if (typeof value === 'string') {
    return value.length >= 10 ? value.slice(0, 10) : value
  }

  return value.toISOString().slice(0, 10)
}

export function toIsoDateTimeString(value: Date | string | null | undefined): string | null | undefined {
  if (value == null) return value
  if (typeof value === 'string') return value
  return value.toISOString()
}

export function ensurePositiveAmount(value: number, message: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message)
  }
}

export function ensureNonNegativeAmount(value: number, message: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message)
  }
}
