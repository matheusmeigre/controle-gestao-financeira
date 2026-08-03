import { useQuery } from '@tanstack/react-query'
import { mobileQueryKeys } from '../data/query-keys'
import { useMobileApi } from './use-mobile-api'

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
