import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Invoice } from '@/features/invoices/types'

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  findAll: vi.fn(),
  findByCardAndPeriod: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/features/invoices/services/invoice.supabase.repository', () => {
  class MockSupabaseInvoiceRepository {
    findAll = mocks.findAll
    findById = mocks.findById
    findByCardAndPeriod = mocks.findByCardAndPeriod
    create = mocks.create
    update = mocks.update
    delete = mocks.delete
  }
  return { SupabaseInvoiceRepository: MockSupabaseInvoiceRepository }
})

vi.mock('@/features/invoices/parsers', () => ({
  parseInvoiceFile: vi.fn(),
}))

import { updateInvoiceApplication } from '@/application/invoices'

function makeItem(id: string, amount: number) {
  return {
    id,
    invoiceId: 'invoice-456',
    date: new Date('2026-07-02T00:00:00.000Z'),
    description: `Compra ${id}`,
    amount,
    category: 'Outros',
  }
}

function makeInvoice(items: Array<{ id: string; amount: number }>, overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'invoice-456',
    userId: 'user-123',
    cardId: 'card-1',
    month: 8,
    year: 2026,
    closingDate: new Date('2026-07-25T00:00:00.000Z'),
    dueDate: new Date('2026-08-10T00:00:00.000Z'),
    totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
    paidAmount: 0,
    isPaid: false,
    items: items.map((item) => makeItem(item.id, item.amount)),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('updateInvoiceApplication', () => {
  beforeEach(() => {
    mocks.findById.mockReset()
    mocks.update.mockReset()
  })

  it('respeita isPaid explícito mesmo quando a soma dos itens é maior que o valor pago', async () => {
    // Fatura cujos itens somam 110, mas o total armazenado é 100
    const current = makeInvoice(
      [{ id: 'item-a', amount: 60 }, { id: 'item-b', amount: 50 }],
      { totalAmount: 100, isPaid: false }
    )
    mocks.findById.mockResolvedValue(current)
    mocks.update.mockResolvedValue({ ...current, isPaid: true, paidAmount: 100 })

    await updateInvoiceApplication('user-123', 'invoice-456', {
      isPaid: true,
      paidAmount: 100,
      items: current.items,
    })

    expect(mocks.update).toHaveBeenCalledTimes(1)
    const [userId, invoiceId, updates] = mocks.update.mock.calls[0]
    expect(userId).toBe('user-123')
    expect(invoiceId).toBe('invoice-456')
    expect(updates.isPaid).toBe(true)
    expect(updates.paidAmount).toBe(100)
  })

  it('deriva isPaid com arredondamento, sem falhar por precisão de ponto flutuante', async () => {
    // 0.1 + 0.1 + 0.1 = 0.30000000000000004 em ponto flutuante
    const current = makeInvoice(
      [{ id: 'item-a', amount: 0.1 }, { id: 'item-b', amount: 0.1 }, { id: 'item-c', amount: 0.1 }],
      { totalAmount: 0.3, isPaid: false }
    )
    mocks.findById.mockResolvedValue(current)
    mocks.update.mockResolvedValue({ ...current, isPaid: true, paidAmount: 0.3 })

    await updateInvoiceApplication('user-123', 'invoice-456', {
      paidAmount: 0.3,
      items: current.items,
    })

    expect(mocks.update).toHaveBeenCalledTimes(1)
    const [, , updates] = mocks.update.mock.calls[0]
    expect(updates.isPaid).toBe(true)
  })

  it('lança erro quando o valor pago excede o total arredondado', async () => {
    const current = makeInvoice(
      [{ id: 'item-a', amount: 50 }],
      { totalAmount: 50, isPaid: false }
    )
    mocks.findById.mockResolvedValue(current)

    await expect(
      updateInvoiceApplication('user-123', 'invoice-456', {
        paidAmount: 50.01,
        items: current.items,
      })
    ).rejects.toThrow('Valor pago não pode exceder o valor total da fatura')
  })
})
