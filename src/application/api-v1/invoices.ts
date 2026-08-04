import type {
  AddMobileInvoiceItem,
  CreateMobileInvoice,
  MobileInvoice,
  MobileInvoiceImportPreview,
  MobileInvoiceItem,
  UpdateMobileInvoicePayment,
} from '@contracts'
import type { Invoice, InvoiceItem } from '@/features/invoices/types'
import {
  addInvoiceItemApplication,
  createInvoiceApplication,
  deleteInvoiceApplication,
  getInvoiceApplication,
  listInvoicesApplication,
  payInvoiceApplication,
  processInvoiceUploadApplication,
  removeInvoiceItemApplication,
} from '@/application/invoices'
import { toIsoDateTimeString, toLocalDateString } from './shared'

function toInvoiceItemDto(item: InvoiceItem): MobileInvoiceItem {
  return {
    id: item.id ?? '',
    date: toLocalDateString(item.date),
    description: item.description,
    amount: item.amount,
    category: item.category,
    installment: item.installment,
    notes: item.notes,
    createdAt: toIsoDateTimeString(item.createdAt) ?? undefined,
  }
}

function toInvoiceDto(invoice: Invoice): MobileInvoice {
  return {
    id: invoice.id ?? '',
    cardId: invoice.cardId,
    month: invoice.month,
    year: invoice.year,
    closingDate: toLocalDateString(invoice.closingDate),
    dueDate: toLocalDateString(invoice.dueDate),
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    isPaid: invoice.isPaid,
    items: invoice.items.map(toInvoiceItemDto),
    createdAt: toIsoDateTimeString(invoice.createdAt) ?? undefined,
    updatedAt: toIsoDateTimeString(invoice.updatedAt) ?? undefined,
  }
}

export async function listInvoices(
  userId: string,
  filters?: { cardId?: string; month?: number; year?: number }
): Promise<MobileInvoice[]> {
  const invoices = await listInvoicesApplication(userId, filters)
  return invoices.map(toInvoiceDto)
}

export async function getInvoice(userId: string, id: string): Promise<MobileInvoice | null> {
  const invoice = await getInvoiceApplication(userId, id)
  return invoice ? toInvoiceDto(invoice) : null
}

export async function createInvoice(userId: string, input: CreateMobileInvoice): Promise<MobileInvoice> {
  const created = await createInvoiceApplication(userId, {
    cardId: input.cardId,
    month: input.month,
    year: input.year,
    closingDate: new Date(`${input.closingDate}T00:00:00.000Z`),
    dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
    items: input.items.map((item) => ({
      date: new Date(`${item.date}T00:00:00.000Z`),
      description: item.description,
      amount: item.amount,
      category: item.category,
      installment: item.installment,
      notes: item.notes,
    })),
  })

  return toInvoiceDto(created)
}

export async function payInvoice(userId: string, id: string, input: UpdateMobileInvoicePayment): Promise<MobileInvoice | null> {
  const updated = await payInvoiceApplication(userId, id, input.paidAmount)

  return updated ? toInvoiceDto(updated) : null
}

export async function addInvoiceItem(userId: string, id: string, input: AddMobileInvoiceItem): Promise<MobileInvoiceItem | null> {
  const created = await addInvoiceItemApplication(userId, {
    invoiceId: id,
    item: {
      date: new Date(`${input.item.date}T00:00:00.000Z`),
      description: input.item.description,
      amount: input.item.amount,
      category: input.item.category,
      installment: input.item.installment,
      notes: input.item.notes,
    },
  })

  return created ? toInvoiceItemDto(created) : null
}

export async function removeInvoiceItem(userId: string, invoiceId: string, itemId: string): Promise<boolean> {
  return removeInvoiceItemApplication(userId, invoiceId, itemId)
}

export async function previewInvoiceImport(formData: FormData): Promise<MobileInvoiceImportPreview> {
  const result = await processInvoiceUploadApplication(formData)
  if (!result.success || !result.data) {
    throw new Error(result.error ?? 'Não foi possível processar o arquivo da fatura')
  }

  return {
    items: result.data.items.map(toInvoiceItemDto),
    metadata: result.data.metadata,
    warnings: result.data.warnings,
  }
}

export async function deleteInvoice(userId: string, id: string): Promise<boolean> {
  return deleteInvoiceApplication(userId, id)
}
