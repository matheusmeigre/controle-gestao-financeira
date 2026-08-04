import { beforeEach, describe, expect, it, vi } from 'vitest'

const planningRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const expenseRepository = {
  findAll: vi.fn(),
}

const incomeRepository = {
  findAll: vi.fn(),
}

vi.mock('@/features/planning/services/planning.supabase.repository', () => ({
  SupabasePlanningRepository: class {
    findAll = planningRepository.findAll
    findById = planningRepository.findById
    create = planningRepository.create
    update = planningRepository.update
    delete = planningRepository.delete
  },
}))

vi.mock('@/features/expenses/services/expense.supabase.repository', () => ({
  SupabaseExpenseRepository: class {
    findAll = expenseRepository.findAll
  },
}))

vi.mock('@/features/incomes/services/income.supabase.repository', () => ({
  SupabaseIncomeRepository: class {
    findAll = incomeRepository.findAll
  },
}))

describe('api v1 plannings application', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    expenseRepository.findAll.mockResolvedValue([])
    incomeRepository.findAll.mockResolvedValue([
      {
        id: 'income-1',
        userId: 'user-1',
        description: 'Salário',
        amount: 5000,
        type: 'salary',
        date: new Date().toISOString().slice(0, 10),
        status: 'received',
        registrationDate: new Date().toISOString(),
        receivedDate: new Date().toISOString(),
      },
    ])
    planningRepository.findAll.mockResolvedValue([])
  })

  it('derives at-risk status, simulation and alerts when planning is not financially viable', async () => {
    const { createPlanning } = await import('@/application/api-v1/plannings')

    planningRepository.create.mockImplementation(async (_userId: string, planning: unknown) => planning)

    const result = await createPlanning('user-1', {
      name: 'Carro',
      category: 'purchase',
      targetAmount: 12000,
      currentAmount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'planned',
      linkedExpenseIds: [],
      alerts: [],
      riskLevel: 'low',
    })

    expect(result.status).toBe('at_risk')
    expect(result.riskLevel).toBe('critical')
    expect(result.simulation?.isViable).toBe(false)
    expect(result.alerts?.length).toBeGreaterThan(0)
  })

  it('derives delayed status for expired targets and completed status when accumulated amount reaches the goal', async () => {
    const { getPlanning } = await import('@/application/api-v1/plannings')

    planningRepository.findById.mockResolvedValueOnce({
      id: 'planning-delayed',
      userId: 'user-1',
      name: 'Viagem',
      category: 'travel',
      targetAmount: 3000,
      currentAmount: 500,
      startDate: '2026-01-01',
      targetDate: '2026-02-01',
      status: 'planned',
      linkedExpenseIds: [],
      riskLevel: 'low',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    planningRepository.findById.mockResolvedValueOnce({
      id: 'planning-complete',
      userId: 'user-1',
      name: 'Reserva',
      category: 'emergency_reserve',
      targetAmount: 2000,
      currentAmount: 2000,
      startDate: '2026-01-01',
      status: 'in_progress',
      linkedExpenseIds: [],
      riskLevel: 'low',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    await expect(getPlanning('user-1', 'planning-delayed')).resolves.toMatchObject({ status: 'delayed' })
    await expect(getPlanning('user-1', 'planning-complete')).resolves.toMatchObject({ status: 'completed' })
  })
})
