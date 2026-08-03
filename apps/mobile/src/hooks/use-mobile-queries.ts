import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  AddMobileInvoiceItem,
  CreateMobileCard,
  CreateMobileExpense,
  CreateMobileIncome,
  CreateMobileInvoice,
  CreateMobilePlanning,
  CreateMobilePlanningContribution,
  ReceiveMobileIncome,
  UpdateMobileCard,
  UpdateMobileExpense,
  UpdateMobileIncome,
  UpdateMobileInvoicePayment,
  UpdateMobilePlanning,
} from '@contracts'
import { mobileQueryKeys } from '../data/query-keys'
import { useMobileApi } from './use-mobile-api'
import { useMobileQueryClient } from './use-mobile-query-client'

export function useBootstrapQuery() {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.bootstrap,
    queryFn: () => api.bootstrapSession(),
  })
}

export function useExpensesQuery(yearMonth?: string) {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.expenses(yearMonth),
    queryFn: () => api.listExpenses({ yearMonth }),
  })
}

export function useIncomesQuery(yearMonth?: string) {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.incomes(yearMonth),
    queryFn: () => api.listIncomes({ yearMonth }),
  })
}

export function useCardsQuery(includeInactive?: boolean) {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.cards(includeInactive),
    queryFn: () => api.listCards({ includeInactive }),
  })
}

export function useInvoicesQuery(filters?: { cardId?: string; month?: number; year?: number }) {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.invoices(filters),
    queryFn: () => api.listInvoices(filters),
  })
}

export function usePlanningsQuery() {
  const api = useMobileApi()

  return useQuery({
    queryKey: mobileQueryKeys.plannings,
    queryFn: () => api.listPlannings(),
  })
}

export function useExpenseMutations() {
  const api = useMobileApi()
  const { invalidateBootstrap, invalidateExpenses } = useMobileQueryClient()

  return {
    createExpense: useMutation({
      mutationFn: (input: CreateMobileExpense) => api.createExpense(input),
      onSuccess: async () => {
        await invalidateExpenses()
        await invalidateBootstrap()
      },
    }),
    updateExpense: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateMobileExpense }) => api.updateExpense(id, input),
      onSuccess: async () => {
        await invalidateExpenses()
        await invalidateBootstrap()
      },
    }),
    deleteExpense: useMutation({
      mutationFn: (id: string) => api.deleteExpense(id),
      onSuccess: async () => {
        await invalidateExpenses()
        await invalidateBootstrap()
      },
    }),
  }
}

export function useIncomeMutations() {
  const api = useMobileApi()
  const { invalidateBootstrap, invalidateIncomes } = useMobileQueryClient()

  return {
    createIncome: useMutation({
      mutationFn: (input: CreateMobileIncome) => api.createIncome(input),
      onSuccess: async () => {
        await invalidateIncomes()
        await invalidateBootstrap()
      },
    }),
    updateIncome: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateMobileIncome }) => api.updateIncome(id, input),
      onSuccess: async () => {
        await invalidateIncomes()
        await invalidateBootstrap()
      },
    }),
    deleteIncome: useMutation({
      mutationFn: (id: string) => api.deleteIncome(id),
      onSuccess: async () => {
        await invalidateIncomes()
        await invalidateBootstrap()
      },
    }),
    receiveIncome: useMutation({
      mutationFn: ({ id, input }: { id: string; input?: ReceiveMobileIncome }) => api.receiveIncome(id, input),
      onSuccess: async () => {
        await invalidateIncomes()
        await invalidateBootstrap()
      },
    }),
  }
}

export function useCardMutations() {
  const api = useMobileApi()
  const { invalidateBootstrap, invalidateCards } = useMobileQueryClient()

  return {
    createCard: useMutation({
      mutationFn: (input: CreateMobileCard) => api.createCard(input),
      onSuccess: async () => {
        await invalidateCards()
        await invalidateBootstrap()
      },
    }),
    updateCard: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateMobileCard }) => api.updateCard(id, input),
      onSuccess: async () => {
        await invalidateCards()
        await invalidateBootstrap()
      },
    }),
    deleteCard: useMutation({
      mutationFn: (id: string) => api.deleteCard(id),
      onSuccess: async () => {
        await invalidateCards()
        await invalidateBootstrap()
      },
    }),
  }
}

export function useInvoiceMutations() {
  const api = useMobileApi()
  const { invalidateBootstrap, invalidateInvoices } = useMobileQueryClient()

  return {
    createInvoice: useMutation({
      mutationFn: (input: CreateMobileInvoice) => api.createInvoice(input),
      onSuccess: async () => {
        await invalidateInvoices()
        await invalidateBootstrap()
      },
    }),
    deleteInvoice: useMutation({
      mutationFn: (id: string) => api.deleteInvoice(id),
      onSuccess: async () => {
        await invalidateInvoices()
        await invalidateBootstrap()
      },
    }),
    payInvoice: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateMobileInvoicePayment }) => api.payInvoice(id, input),
      onSuccess: async () => {
        await invalidateInvoices()
        await invalidateBootstrap()
      },
    }),
    addInvoiceItem: useMutation({
      mutationFn: ({ id, input }: { id: string; input: AddMobileInvoiceItem }) => api.addInvoiceItem(id, input),
      onSuccess: async () => {
        await invalidateInvoices()
        await invalidateBootstrap()
      },
    }),
    removeInvoiceItem: useMutation({
      mutationFn: ({ id, itemId }: { id: string; itemId: string }) => api.removeInvoiceItem(id, itemId),
      onSuccess: async () => {
        await invalidateInvoices()
        await invalidateBootstrap()
      },
    }),
  }
}

export function usePlanningMutations() {
  const api = useMobileApi()
  const { invalidateBootstrap, invalidatePlannings } = useMobileQueryClient()

  return {
    createPlanning: useMutation({
      mutationFn: (input: CreateMobilePlanning) => api.createPlanning(input),
      onSuccess: async () => {
        await invalidatePlannings()
        await invalidateBootstrap()
      },
    }),
    updatePlanning: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateMobilePlanning }) => api.updatePlanning(id, input),
      onSuccess: async () => {
        await invalidatePlannings()
        await invalidateBootstrap()
      },
    }),
    deletePlanning: useMutation({
      mutationFn: (id: string) => api.deletePlanning(id),
      onSuccess: async () => {
        await invalidatePlannings()
        await invalidateBootstrap()
      },
    }),
    contributePlanning: useMutation({
      mutationFn: ({ id, input }: { id: string; input: CreateMobilePlanningContribution }) => api.contributeToPlanning(id, input),
      onSuccess: async () => {
        await invalidatePlannings()
        await invalidateBootstrap()
      },
    }),
  }
}
