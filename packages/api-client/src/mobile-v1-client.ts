import {
  addMobileInvoiceItemSchema,
  createMobileCardSchema,
  createMobileExpenseSchema,
  createMobileIncomeSchema,
  createMobilePlanningContributionSchema,
  createMobilePlanningSchema,
  mobileBootstrapResponseSchema,
  mobileCardResponseSchema,
  mobileCardsListResponseSchema,
  mobileExpenseResponseSchema,
  mobileExpensesListResponseSchema,
  mobileIncomeResponseSchema,
  mobileIncomesListResponseSchema,
  mobileInvoiceImportPreviewResponseSchema,
  mobileInvoiceItemResponseSchema,
  mobileInvoiceResponseSchema,
  mobileInvoicesListResponseSchema,
  mobileMeResponseSchema,
  mobilePlanningResponseSchema,
  mobilePlanningsListResponseSchema,
  receiveMobileIncomeSchema,
  updateMobileCardSchema,
  updateMobileExpenseSchema,
  updateMobileIncomeSchema,
  updateMobileInvoicePaymentSchema,
  updateMobilePlanningSchema,
  type CreateMobileExpense,
  type CreateMobileIncome,
  type CreateMobilePlanning,
  type CreateMobilePlanningContribution,
  type MobileBootstrap,
  type MobileBootstrapResponse,
  type AddMobileInvoiceItem,
  type MobileCard,
  type MobileCardResponse,
  type MobileCardsListResponse,
  type CreateMobileCard,
  type MobileExpense,
  type MobileExpenseResponse,
  type MobileExpensesListResponse,
  type MobileIncome,
  type MobileIncomeResponse,
  type MobileIncomesListResponse,
  type MobileInvoice,
  type MobileInvoiceImportPreview,
  type MobileInvoiceImportPreviewResponse,
  type MobileInvoiceItem,
  type MobileInvoiceItemResponse,
  type MobileInvoiceResponse,
  type MobileInvoicesListResponse,
  type MobileMe,
  type MobileMeResponse,
  type MobilePlanning,
  type MobilePlanningResponse,
  type MobilePlanningsListResponse,
  type ReceiveMobileIncome,
  type UpdateMobileCard,
  type UpdateMobileExpense,
  type UpdateMobileIncome,
  type UpdateMobileInvoicePayment,
  type UpdateMobilePlanning,
} from '@contracts'
import { createHttpClient, type HttpClientOptions } from './http'

type YearMonthFilter = { yearMonth?: string }
type CardsFilter = { includeInactive?: boolean }
type InvoicesFilter = { cardId?: string; month?: number; year?: number }
type BootstrapSessionOptions = {
  yearMonth?: string
  includeInactiveCards?: boolean
  invoices?: InvoicesFilter
}

export type MobileBootstrapSession = {
  me: MobileMe
  bootstrap: MobileBootstrap
  expenses: MobileExpense[]
  incomes: MobileIncome[]
  cards: MobileCard[]
  plannings: MobilePlanning[]
  invoices: MobileInvoice[]
}

export type MobileApiClientOptions = HttpClientOptions

export function createMobileApiClient(options: MobileApiClientOptions = {}) {
  const http = createHttpClient(options)

  const apiClient = {
    async getMe(): Promise<MobileMe> {
      const response = await http.request<MobileMeResponse>('/me', { schema: mobileMeResponseSchema })
      return response.data
    },
    async getBootstrap(): Promise<MobileBootstrap> {
      const response = await http.request<MobileBootstrapResponse>('/bootstrap', { schema: mobileBootstrapResponseSchema })
      return response.data
    },
    async bootstrapSession(options: BootstrapSessionOptions = {}): Promise<MobileBootstrapSession> {
      const [me, bootstrap, expenses, incomes, cards, plannings, invoices] = await Promise.all([
        apiClient.getMe(),
        apiClient.getBootstrap(),
        apiClient.listExpenses({ yearMonth: options.yearMonth }),
        apiClient.listIncomes({ yearMonth: options.yearMonth }),
        apiClient.listCards({ includeInactive: options.includeInactiveCards }),
        apiClient.listPlannings(),
        apiClient.listInvoices(options.invoices),
      ])

      return {
        me,
        bootstrap,
        expenses,
        incomes,
        cards,
        plannings,
        invoices,
      }
    },
    async listExpenses(filters: YearMonthFilter = {}): Promise<MobileExpense[]> {
      const response = await http.request<MobileExpensesListResponse>('/expenses', { query: filters, schema: mobileExpensesListResponseSchema })
      return response.data
    },
    async createExpense(input: CreateMobileExpense): Promise<MobileExpense> {
      const response = await http.request<MobileExpenseResponse>('/expenses', {
        method: 'POST',
        body: createMobileExpenseSchema.parse(input),
        schema: mobileExpenseResponseSchema,
      })
      return response.data
    },
    async updateExpense(id: string, input: UpdateMobileExpense): Promise<MobileExpense> {
      const response = await http.request<MobileExpenseResponse>(`/expenses/${id}`, {
        method: 'PATCH',
        body: updateMobileExpenseSchema.parse(input),
        schema: mobileExpenseResponseSchema,
      })
      return response.data
    },
    async deleteExpense(id: string): Promise<void> {
      await http.request(`/expenses/${id}`, { method: 'DELETE' })
    },
    async listIncomes(filters: YearMonthFilter = {}): Promise<MobileIncome[]> {
      const response = await http.request<MobileIncomesListResponse>('/incomes', { query: filters, schema: mobileIncomesListResponseSchema })
      return response.data
    },
    async createIncome(input: CreateMobileIncome): Promise<MobileIncome> {
      const response = await http.request<MobileIncomeResponse>('/incomes', {
        method: 'POST',
        body: createMobileIncomeSchema.parse(input),
        schema: mobileIncomeResponseSchema,
      })
      return response.data
    },
    async updateIncome(id: string, input: UpdateMobileIncome): Promise<MobileIncome> {
      const response = await http.request<MobileIncomeResponse>(`/incomes/${id}`, {
        method: 'PATCH',
        body: updateMobileIncomeSchema.parse(input),
        schema: mobileIncomeResponseSchema,
      })
      return response.data
    },
    async deleteIncome(id: string): Promise<void> {
      await http.request(`/incomes/${id}`, { method: 'DELETE' })
    },
    async receiveIncome(id: string, input: ReceiveMobileIncome = {}): Promise<MobileIncome> {
      const response = await http.request<MobileIncomeResponse>(`/incomes/${id}/receive`, {
        method: 'POST',
        body: receiveMobileIncomeSchema.parse(input),
        schema: mobileIncomeResponseSchema,
      })
      return response.data
    },
    async listCards(filters: CardsFilter = {}): Promise<MobileCard[]> {
      const response = await http.request<MobileCardsListResponse>('/cards', { query: filters, schema: mobileCardsListResponseSchema })
      return response.data
    },
    async createCard(input: CreateMobileCard): Promise<MobileCard> {
      const response = await http.request<MobileCardResponse>('/cards', {
        method: 'POST',
        body: createMobileCardSchema.parse(input),
        schema: mobileCardResponseSchema,
      })
      return response.data
    },
    async getCard(id: string): Promise<MobileCard> {
      const response = await http.request<MobileCardResponse>(`/cards/${id}`, { schema: mobileCardResponseSchema })
      return response.data
    },
    async updateCard(id: string, input: UpdateMobileCard): Promise<MobileCard> {
      const response = await http.request<MobileCardResponse>(`/cards/${id}`, {
        method: 'PATCH',
        body: updateMobileCardSchema.parse(input),
        schema: mobileCardResponseSchema,
      })
      return response.data
    },
    async deleteCard(id: string): Promise<void> {
      await http.request(`/cards/${id}`, { method: 'DELETE' })
    },
    async listInvoices(filters: InvoicesFilter = {}): Promise<MobileInvoice[]> {
      const response = await http.request<MobileInvoicesListResponse>('/invoices', { query: filters, schema: mobileInvoicesListResponseSchema })
      return response.data
    },
    async getInvoice(id: string): Promise<MobileInvoice> {
      const response = await http.request<MobileInvoiceResponse>(`/invoices/${id}`, { schema: mobileInvoiceResponseSchema })
      return response.data
    },
    async addInvoiceItem(id: string, input: AddMobileInvoiceItem): Promise<MobileInvoiceItem> {
      const response = await http.request<MobileInvoiceItemResponse>(`/invoices/${id}/items`, {
        method: 'POST',
        body: addMobileInvoiceItemSchema.parse(input),
        schema: mobileInvoiceItemResponseSchema,
      })
      return response.data
    },
    async removeInvoiceItem(id: string, itemId: string): Promise<void> {
      await http.request(`/invoices/${id}/items/${itemId}`, { method: 'DELETE' })
    },
    async payInvoice(id: string, input: UpdateMobileInvoicePayment): Promise<MobileInvoice> {
      const response = await http.request<MobileInvoiceResponse>(`/invoices/${id}/payments`, {
        method: 'POST',
        body: updateMobileInvoicePaymentSchema.parse(input),
        schema: mobileInvoiceResponseSchema,
      })
      return response.data
    },
    async previewInvoiceImport(input: {
      file: File
      cardId: string
      month: number
      year: number
    }): Promise<MobileInvoiceImportPreview> {
      const formData = new FormData()
      formData.set('file', input.file)
      formData.set('cardId', input.cardId)
      formData.set('month', String(input.month))
      formData.set('year', String(input.year))

      const response = await http.request<MobileInvoiceImportPreviewResponse>('/invoices/imports/preview', {
        method: 'POST',
        body: formData,
        schema: mobileInvoiceImportPreviewResponseSchema,
      })
      return response.data
    },
    async listPlannings(): Promise<MobilePlanning[]> {
      const response = await http.request<MobilePlanningsListResponse>('/plannings', { schema: mobilePlanningsListResponseSchema })
      return response.data
    },
    async getPlanning(id: string): Promise<MobilePlanning> {
      const response = await http.request<MobilePlanningResponse>(`/plannings/${id}`, { schema: mobilePlanningResponseSchema })
      return response.data
    },
    async createPlanning(input: CreateMobilePlanning): Promise<MobilePlanning> {
      const response = await http.request<MobilePlanningResponse>('/plannings', {
        method: 'POST',
        body: createMobilePlanningSchema.parse(input),
        schema: mobilePlanningResponseSchema,
      })
      return response.data
    },
    async updatePlanning(id: string, input: UpdateMobilePlanning): Promise<MobilePlanning> {
      const response = await http.request<MobilePlanningResponse>(`/plannings/${id}`, {
        method: 'PATCH',
        body: updateMobilePlanningSchema.parse(input),
        schema: mobilePlanningResponseSchema,
      })
      return response.data
    },
    async contributeToPlanning(id: string, input: CreateMobilePlanningContribution): Promise<MobilePlanning> {
      const response = await http.request<MobilePlanningResponse>(`/plannings/${id}/contributions`, {
        method: 'POST',
        body: createMobilePlanningContributionSchema.parse(input),
        schema: mobilePlanningResponseSchema,
      })
      return response.data
    },
    async deletePlanning(id: string): Promise<void> {
      await http.request(`/plannings/${id}`, { method: 'DELETE' })
    },
  }

  return apiClient
}
