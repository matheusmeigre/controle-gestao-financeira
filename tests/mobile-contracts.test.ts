import {
  addMobileInvoiceItemSchema,
  createMobileExpenseSchema,
  createMobilePlanningContributionSchema,
  mobileBootstrapResponseSchema,
  mobileExpensesListResponseSchema,
  mobileIncomeResponseSchema,
  mobileInvoiceImportPreviewResponseSchema,
  mobileInvoiceItemResponseSchema,
  mobileInvoiceResponseSchema,
  mobileMeResponseSchema,
  mobilePlanningsListResponseSchema,
  problemDetailsSchema,
  receiveMobileIncomeSchema,
  updateMobileInvoicePaymentSchema,
} from '@contracts'

describe('mobile v1 contracts', () => {
  it('accepts the me response contract', () => {
    expect(
      mobileMeResponseSchema.parse({
        data: {
          id: 'user_123',
        },
      })
    ).toEqual({
      data: {
        id: 'user_123',
      },
    })
  })

  it('accepts the bootstrap response contract', () => {
    expect(
      mobileBootstrapResponseSchema.parse({
        data: {
          apiVersion: 'v1',
          serverTime: '2026-08-03T12:00:00.000Z',
          currentPeriod: {
            year: 2026,
            month: 8,
            yearMonth: '2026-08',
          },
          summary: {
            expensesCount: 1,
            incomesCount: 2,
            invoicesCount: 3,
            cardsCount: 4,
            planningsCount: 5,
          },
          capabilities: {
            me: '/api/v1/me',
            bootstrap: '/api/v1/bootstrap',
          },
        },
      })
    ).toBeTruthy()
  })

  it('accepts RFC 7807 style problem details', () => {
    expect(
      problemDetailsSchema.parse({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication is required.',
        code: 'unauthorized',
      })
    ).toBeTruthy()
  })

  it('accepts expense collection and expense creation contracts', () => {
    expect(
      mobileExpensesListResponseSchema.parse({
        data: [
          {
            id: 'expense-123',
            description: 'Internet',
            amount: 129.9,
            category: 'Contas',
            date: '2026-08-03',
            status: 'pending',
          },
        ],
      })
    ).toBeTruthy()

    expect(
      createMobileExpenseSchema.parse({
        description: 'Mercado',
        amount: 250,
        category: 'Alimentação',
        date: '2026-08-05',
      })
    ).toEqual({
      description: 'Mercado',
      amount: 250,
      category: 'Alimentação',
      date: '2026-08-05',
    })
  })

  it('accepts income receive, invoice payment and planning contribution contracts', () => {
    expect(
      receiveMobileIncomeSchema.parse({
        receivedDate: '2026-08-06T12:00:00.000Z',
      })
    ).toEqual({
      receivedDate: '2026-08-06T12:00:00.000Z',
    })

    expect(
      mobileIncomeResponseSchema.parse({
        data: {
          id: 'income-1',
          description: 'Salário',
          amount: 5000,
          type: 'salary',
          date: '2026-08-01',
          status: 'received',
          registrationDate: '2026-08-01T12:00:00.000Z',
          receivedDate: '2026-08-05T12:00:00.000Z',
        },
      })
    ).toBeTruthy()

    expect(
      updateMobileInvoicePaymentSchema.parse({
        paidAmount: 320.5,
      })
    ).toEqual({
      paidAmount: 320.5,
    })

    expect(
      createMobilePlanningContributionSchema.parse({
        amount: 400,
      })
    ).toEqual({
      amount: 400,
    })

    expect(
      addMobileInvoiceItemSchema.parse({
        item: {
          date: '2026-08-03',
          description: 'Mercado',
          amount: 120,
          category: 'Alimentação',
        },
      })
    ).toEqual({
      item: {
        date: '2026-08-03',
        description: 'Mercado',
        amount: 120,
        category: 'Alimentação',
      },
    })

    expect(
      mobileInvoiceItemResponseSchema.parse({
        data: {
          id: 'item-1',
          date: '2026-08-03',
          description: 'Mercado',
          amount: 120,
          category: 'Alimentação',
        },
      })
    ).toBeTruthy()

    expect(
      mobileInvoiceImportPreviewResponseSchema.parse({
        data: {
          items: [
            {
              id: 'item-1',
              date: '2026-08-03',
              description: 'Mercado',
              amount: 120,
              category: 'Alimentação',
            },
          ],
          metadata: {
            fileName: 'fatura.csv',
            fileSize: 120,
            fileType: 'csv',
            processedAt: '2026-08-03T12:00:00.000Z',
            itemCount: 1,
            cardId: 'card-1',
            month: 8,
            year: 2026,
          },
          warnings: ['OCR confidence low'],
        },
      })
    ).toBeTruthy()

    expect(
      mobilePlanningsListResponseSchema.parse({
        data: [
          {
            id: 'planning-1',
            name: 'Reserva',
            category: 'emergency_reserve',
            targetAmount: 10000,
            currentAmount: 2500,
            startDate: '2026-01-01',
            status: 'planned',
            linkedExpenseIds: [],
            riskLevel: 'low',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-08-01T00:00:00.000Z',
          },
        ],
      })
    ).toBeTruthy()

    expect(
      mobileInvoiceResponseSchema.parse({
        data: {
          id: 'invoice-1',
          cardId: 'card-1',
          month: 8,
          year: 2026,
          closingDate: '2026-08-10',
          dueDate: '2026-08-20',
          totalAmount: 420,
          paidAmount: 100,
          isPaid: false,
          items: [
            {
              id: 'item-1',
              date: '2026-08-03',
              description: 'Mercado',
              amount: 120,
              category: 'Alimentação',
              createdAt: '2026-08-03T12:00:00.000Z',
            },
          ],
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-05T00:00:00.000Z',
        },
      })
    ).toBeTruthy()
  })
})
