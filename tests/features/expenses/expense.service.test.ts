/**
 * Exemplo de teste para ExpenseService
 * 
 * Para executar testes, configure Vitest:
 * npm install -D vitest @testing-library/react @testing-library/jest-dom
 */

/*
import { describe, it, expect, beforeEach } from 'vitest'
import { ExpenseService } from '@/features/expenses'

describe('ExpenseService', () => {
  let service: ExpenseService
  const mockUserId = 'user_test123'

  beforeEach(() => {
    service = new ExpenseService()
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    } as any
  })

  describe('addExpense', () => {
    it('deve adicionar uma despesa válida', async () => {
      const expenseData = {
        description: 'Supermercado',
        amount: 150.50,
        category: 'Alimentação',
        status: 'paid' as const,
      }

      const result = await service.addExpense(mockUserId, expenseData)

      expect(result).toHaveProperty('id')
      expect(result.description).toBe('Supermercado')
      expect(result.amount).toBe(150.50)
      expect(result.userId).toBe(mockUserId)
    })

    it('deve lançar erro se descrição estiver vazia', async () => {
      const invalidData = {
        description: '',
        amount: 100,
        category: 'Alimentação',
        status: 'paid' as const,
      }

      await expect(
        service.addExpense(mockUserId, invalidData)
      ).rejects.toThrow('Descrição é obrigatória')
    })

    it('deve lançar erro se valor for negativo', async () => {
      const invalidData = {
        description: 'Test',
        amount: -50,
        category: 'Alimentação',
        status: 'paid' as const,
      }

      await expect(
        service.addExpense(mockUserId, invalidData)
      ).rejects.toThrow('Valor deve ser maior que zero')
    })
  })

  describe('getMonthlyTotal', () => {
    it('deve calcular total mensal corretamente', async () => {
      // Mock data
      const mockExpenses = [
        { id: '1', userId: mockUserId, amount: 100, date: '2024-01-15', category: 'Alimentação', description: 'Test' },
        { id: '2', userId: mockUserId, amount: 200, date: '2024-01-20', category: 'Transporte', description: 'Test' },
        { id: '3', userId: mockUserId, amount: 150, date: '2024-02-10', category: 'Lazer', description: 'Test' },
      ]

      // Configure mock
      vi.spyOn(service['repository'], 'findByMonth').mockResolvedValue(
        mockExpenses.filter(e => new Date(e.date).getMonth() === 0)
      )

      const total = await service.getMonthlyTotal(mockUserId, 0, 2024)
      
      expect(total).toBe(300) // 100 + 200
    })
  })
})
*/

// Placeholder para não quebrar o build
export {}
