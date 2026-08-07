import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'

const rpcMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    rpc: rpcMock,
  }),
}))

describe('SupabaseInvoiceRepository.update', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('envia o userId para o RPC replace_invoice_items', async () => {
    rpcMock.mockResolvedValueOnce({ error: new Error('forced stop after rpc') })

    const repository = new SupabaseInvoiceRepository()

    await expect(
      repository.update('user-123', 'invoice-456', {
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            invoiceId: 'invoice-456',
            date: new Date('2026-08-03T00:00:00.000Z'),
            description: 'Mercado',
            amount: 10,
            category: 'Alimentacao',
          },
        ],
      })
    ).rejects.toThrow('[invoice_items] replace: forced stop after rpc')

    expect(rpcMock).toHaveBeenCalledWith('replace_invoice_items', {
      p_user_id: 'user-123',
      p_invoice_id: 'invoice-456',
      p_items: expect.any(Array),
    })
  })
})
