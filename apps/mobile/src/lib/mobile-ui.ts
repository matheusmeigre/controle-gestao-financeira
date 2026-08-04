export function parseCurrencyInput(value: string) {
  return Number(value.replace(',', '.'))
}

export function parseIntegerInput(value: string) {
  return Number.parseInt(value, 10)
}

export function formatMoney(value: number) {
  return `R$ ${value.toFixed(2)}`
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
