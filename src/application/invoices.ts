import { parseInvoiceFile } from '@/features/invoices/parsers'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import type {
  AddInvoiceItemInput,
  CreateInvoiceInput,
  Invoice,
  InvoiceItem,
  InvoiceUploadResult,
} from '@/features/invoices/types'
import { assertLocalDate, ensureNonNegativeAmount, toLocalDateString } from './api-v1/shared'

const repository = new SupabaseInvoiceRepository()

function normalizeInvoiceItem(item: InvoiceItem, invoiceId: string): InvoiceItem {
  return {
    ...item,
    id: item.id ?? crypto.randomUUID(),
    invoiceId,
    category: item.category ?? 'Outros',
    createdAt: item.createdAt ?? new Date(),
  }
}

function toDateOnly(value: Date): Date {
  return new Date(`${toLocalDateString(value)}T00:00:00.000Z`)
}

function calculateInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

export async function listInvoicesApplication(
  userId: string,
  filters?: { cardId?: string; month?: number; year?: number }
): Promise<Invoice[]> {
  let invoices = await repository.findAll(userId)
  if (filters?.cardId) invoices = invoices.filter((invoice) => invoice.cardId === filters.cardId)
  if (filters?.month) invoices = invoices.filter((invoice) => invoice.month === filters.month)
  if (filters?.year) invoices = invoices.filter((invoice) => invoice.year === filters.year)
  return invoices
}

export async function getInvoiceApplication(userId: string, invoiceId: string): Promise<Invoice | null> {
  return repository.findById(userId, invoiceId)
}

export async function createInvoiceApplication(userId: string, input: CreateInvoiceInput): Promise<Invoice> {
  const existing = await repository.findByCardAndPeriod(userId, input.cardId, input.month, input.year)
  if (existing) {
    throw new Error('Já existe uma fatura para este cartão nesta competência')
  }

  const invoiceId = crypto.randomUUID()
  const items = (input.items ?? []).map((item) => normalizeInvoiceItem(item, invoiceId))
  const totalAmount = calculateInvoiceTotal(items)

  return repository.create(userId, {
    id: invoiceId,
    userId,
    cardId: input.cardId,
    month: input.month,
    year: input.year,
    closingDate: toDateOnly(input.closingDate),
    dueDate: toDateOnly(input.dueDate),
    totalAmount,
    paidAmount: 0,
    isPaid: false,
    items,
  })
}

export async function addInvoiceItemApplication(userId: string, input: AddInvoiceItemInput): Promise<InvoiceItem | null> {
  const invoice = await repository.findById(userId, input.invoiceId)
  if (!invoice) return null

  const newItem = normalizeInvoiceItem(
    {
      ...input.item,
      date: toDateOnly(input.item.date),
    },
    input.invoiceId
  )

  const updatedItems = [...invoice.items, newItem]
  await repository.update(userId, input.invoiceId, {
    items: updatedItems,
    totalAmount: calculateInvoiceTotal(updatedItems),
    updatedAt: new Date(),
  })

  return newItem
}

export async function removeInvoiceItemApplication(userId: string, invoiceId: string, itemId: string): Promise<boolean> {
  const invoice = await repository.findById(userId, invoiceId)
  if (!invoice) return false

  const updatedItems = invoice.items.filter((item) => item.id !== itemId)
  if (updatedItems.length === invoice.items.length) return false

  await repository.update(userId, invoiceId, {
    items: updatedItems,
    totalAmount: calculateInvoiceTotal(updatedItems),
    updatedAt: new Date(),
  })

  return true
}

export async function payInvoiceApplication(userId: string, invoiceId: string, paidAmount: number): Promise<Invoice | null> {
  ensureNonNegativeAmount(paidAmount, 'Valor pago não pode ser negativo')

  const invoice = await repository.findById(userId, invoiceId)
  if (!invoice) return null

  if (paidAmount > invoice.totalAmount) {
    throw new Error('Valor pago não pode exceder o valor total da fatura')
  }

  return repository.update(userId, invoiceId, {
    paidAmount,
    isPaid: paidAmount >= invoice.totalAmount,
    updatedAt: new Date(),
  })
}

export async function updateInvoiceApplication(userId: string, invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const current = await repository.findById(userId, invoiceId)
  if (!current) return null

  const normalizedUpdates: Partial<Invoice> = { ...updates }

  if (updates.closingDate) {
    assertLocalDate(toLocalDateString(updates.closingDate), 'Data de fechamento')
    normalizedUpdates.closingDate = toDateOnly(updates.closingDate)
  }

  if (updates.dueDate) {
    assertLocalDate(toLocalDateString(updates.dueDate), 'Data de vencimento')
    normalizedUpdates.dueDate = toDateOnly(updates.dueDate)
  }

  if (updates.items) {
    const normalizedItems = updates.items.map((item) =>
      normalizeInvoiceItem({
        ...item,
        date: toDateOnly(item.date),
      }, invoiceId)
    )
    normalizedUpdates.items = normalizedItems
    normalizedUpdates.totalAmount = calculateInvoiceTotal(normalizedItems)

    if (normalizedUpdates.paidAmount === undefined && current.paidAmount > normalizedUpdates.totalAmount) {
      throw new Error('Valor pago não pode exceder o valor total da fatura')
    }
  }

  if (normalizedUpdates.paidAmount !== undefined) {
    ensureNonNegativeAmount(normalizedUpdates.paidAmount, 'Valor pago não pode ser negativo')
    const totalAmount = normalizedUpdates.totalAmount ?? current.totalAmount
    if (normalizedUpdates.paidAmount > totalAmount) {
      throw new Error('Valor pago não pode exceder o valor total da fatura')
    }
    normalizedUpdates.isPaid = normalizedUpdates.paidAmount >= totalAmount
  }

  normalizedUpdates.updatedAt = new Date()
  return repository.update(userId, invoiceId, normalizedUpdates)
}

export async function deleteInvoiceApplication(userId: string, invoiceId: string): Promise<boolean> {
  return repository.delete(userId, invoiceId)
}

export async function processInvoiceUploadApplication(formData: FormData): Promise<InvoiceUploadResult> {
  const startTime = Date.now()

  try {
    const file = formData.get('file') as File
    const cardId = formData.get('cardId') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)

    if (!file) {
      return {
        success: false,
        error: 'Nenhum arquivo fornecido. Faça upload de um arquivo PDF, CSV, OFX ou QFX.',
      }
    }

    if (!cardId || !month || !year) {
      return {
        success: false,
        error: 'Cartão e competência (mês/ano) são obrigatórios.',
        details: [
          !cardId ? 'Cartão não especificado' : '',
          !month ? 'Mês não especificado' : '',
          !year ? 'Ano não especificado' : '',
        ].filter(Boolean),
      }
    }

    if (month < 1 || month > 12) {
      return { success: false, error: 'Mês inválido. Deve estar entre 1 e 12.' }
    }

    if (year < 2020 || year > 2100) {
      return { success: false, error: 'Ano inválido. Deve estar entre 2020 e 2100.' }
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['pdf', 'csv', 'ofx', 'qfx']
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        success: false,
        error: `Tipo de arquivo não suportado: .${fileExtension ?? 'desconhecido'}. Use PDF, CSV, OFX ou QFX.`,
      }
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(cardId)) {
      return { success: false, error: 'ID do cartão inválido.' }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[processInvoiceUpload] arquivo=${file.name} ext=${fileExtension} card=${cardId} ${month}/${year}`)
    }

    const parseResult = await parseInvoiceFile(file)
    if (!parseResult.success) {
      return {
        success: false,
        error: 'Não foi possível processar o arquivo',
        details: parseResult.errors,
      }
    }

    if (!parseResult.transactions || parseResult.transactions.length === 0) {
      return {
        success: false,
        error: 'Nenhuma transação encontrada no arquivo',
        details: [
          'O arquivo pode estar vazio ou em formato não suportado',
          'Verifique se o arquivo é uma fatura válida',
          ...parseResult.errors,
        ],
      }
    }

    const items: InvoiceItem[] = parseResult.transactions.map((transaction) => ({
      id: crypto.randomUUID(),
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category || 'Outros',
      installment: transaction.installment,
      notes: transaction.rawData ? JSON.stringify(transaction.rawData) : undefined,
      createdAt: new Date(),
    }))

    const metadata = {
      ...parseResult.metadata,
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension,
      processedAt: new Date().toISOString(),
      itemCount: items.length,
      cardId,
      month,
      year,
      hasExtractedDates: !!(parseResult.metadata?.closingDate && parseResult.metadata?.dueDate),
    }

    if (process.env.NODE_ENV === 'development') {
      const processingTime = Date.now() - startTime
      console.log(`[processInvoiceUpload] ✅ ${items.length} transações em ${processingTime}ms`)
    }

    return {
      success: true,
      data: {
        items,
        metadata,
        warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined,
      },
    }
  } catch (error) {
    console.error('[processInvoiceUpload] 💥 Erro inesperado:', error)

    return {
      success: false,
      error: 'Erro inesperado ao processar arquivo de fatura',
      details: [
        error instanceof Error ? error.message : String(error),
        'Entre em contato com o suporte se o problema persistir',
      ],
    }
  }
}
