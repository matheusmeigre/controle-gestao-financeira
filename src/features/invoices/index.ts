// Components (Client Components - use in client-side only)
export { InvoiceImporter } from './components/InvoiceImporter'
export { MonthYearPicker } from './components/MonthYearPicker'
export { InvoiceDatesDisplay } from './components/InvoiceDatesDisplay'

// Hooks (Client-side only - do NOT import in Server Actions)
export { useInvoiceCreation } from './hooks/useInvoiceCreation'

// Utils (Can be used in both Server and Client)
export { InvoiceDateCalculator } from './utils/invoice-dates.utils'
export type { InvoiceCompetency, CardDates, CalculatedDates } from './utils/invoice-dates.utils'

// Services (Server-side safe)
export { InvoiceService } from './services/invoice.service'
export { InvoiceRepository } from './services/invoice.repository'

// Parsers (Server-side safe)
export { parseInvoiceFile } from './parsers'
export * from './parsers/types'

// Types
export type {
  Invoice,
  InvoiceItem,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  AddInvoiceItemInput,
  InvoiceUploadMetadata,
  InvoiceUploadResult
} from './types'
export {
  invoiceSchema,
  invoiceItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  addInvoiceItemSchema
} from './types'
