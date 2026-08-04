import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SupabasePlanningRepository } from '@/features/planning/services/planning.supabase.repository'

const rpcMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    rpc: rpcMock,
  }),
}))

describe('SupabasePlanningRepository.incrementAmount', () => {
  beforeEach(() => {
    rpcMock.mockReset()
  })

  it('envia o userId para o RPC increment_planning_amount e mapeia o retorno', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        {
          id: 'plan-123',
          user_id: 'user-123',
          name: 'Reserva',
          category: 'emergency_fund',
          target_amount: '1000.00',
          current_amount: '250.00',
          start_date: '2026-08-01',
          target_date: '2026-12-31',
          status: 'in_progress',
          notes: null,
          linked_expense_ids: [],
          category_data: null,
          creation_context: null,
          simulation: null,
          alerts: [],
          risk_level: 'low',
          created_at: '2026-08-01T00:00:00.000Z',
          updated_at: '2026-08-03T00:00:00.000Z',
        },
      ],
      error: null,
    })

    const repository = new SupabasePlanningRepository()
    const planning = await repository.incrementAmount('user-123', 'plan-123', 50)

    expect(rpcMock).toHaveBeenCalledWith('increment_planning_amount', {
      p_user_id: 'user-123',
      p_planning_id: 'plan-123',
      p_amount: 50,
    })
    expect(planning).toMatchObject({
      id: 'plan-123',
      userId: 'user-123',
      currentAmount: 250,
      targetAmount: 1000,
      status: 'in_progress',
    })
  })
})
