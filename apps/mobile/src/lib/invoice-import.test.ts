import { describe, expect, it } from 'vitest'
import { validateInvoiceImportFile } from './invoice-import'

describe('invoice import validation', () => {
  it('accepts supported extensions', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.pdf', size: 1024, mimeType: 'application/pdf' })).toBeNull()
  })

  it('rejects unsupported extensions', () => {
    expect(validateInvoiceImportFile({ name: 'fatura.exe', size: 1024, mimeType: 'application/octet-stream' })).toBe('Extensao invalida. Use PDF, CSV, OFX ou QFX.')
  })
})
