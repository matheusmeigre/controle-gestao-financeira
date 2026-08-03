export const supportedInvoiceImportExtensions = ['pdf', 'csv', 'ofx', 'qfx'] as const

export const supportedInvoiceImportMimeTypes = [
  'application/pdf',
  'text/csv',
  'application/csv',
  'application/x-ofx',
  'application/ofx',
  'application/vnd.intu.qfx',
  'application/qfx',
] as const

export const maxInvoiceImportFileSizeBytes = 10 * 1024 * 1024

export function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts.at(-1) ?? '' : ''
}

export function validateInvoiceImportFile(file: { name: string; size?: number; mimeType?: string | null }) {
  const extension = getFileExtension(file.name)

  if (!supportedInvoiceImportExtensions.includes(extension as (typeof supportedInvoiceImportExtensions)[number])) {
    return 'Extensao invalida. Use PDF, CSV, OFX ou QFX.'
  }

  if (file.size !== undefined && file.size > maxInvoiceImportFileSizeBytes) {
    return 'Arquivo excede o limite de 10 MB.'
  }

  if (file.mimeType && !supportedInvoiceImportMimeTypes.includes(file.mimeType as (typeof supportedInvoiceImportMimeTypes)[number])) {
    return 'MIME type invalido para importacao de fatura.'
  }

  return null
}
