import { describe, expect, it } from 'vitest'
import { validateInvoiceImportFile } from './invoice-import'

describe('invoice import validation', () => {
  it('accepts supported extensions', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.pdf', size: 1024, mimeType: 'application/pdf' })).toBeNull()
  })

  it('rejects unsupported extensions', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.exe', size: 1024, mimeType: 'application/octet-stream' })).toBe('Extensao invalida. Use PDF, CSV, OFX ou QFX.')
  })

  it('rejects files bigger than the configured limit', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.pdf', size: 11 * 1024 * 1024, mimeType: 'application/pdf' })).toBe('Arquivo excede o limite de 10 MB.')
  })

  it('rejects invalid mime types even for supported extensions', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.pdf', size: 1024, mimeType: 'text/plain' })).toBe('MIME type invalido para importacao de fatura.')
  })
})
