import { useQueryClient } from '@tanstack/react-query'
import { mobileQueryRoots } from '../data/query-keys'

export function useMobileQueryClient() {
  const queryClient = useQueryClient()

  return {
    queryClient,
    invalidateBootstrap: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.bootstrap }),
    invalidateExpenses: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.expenses }),
    invalidateIncomes: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.incomes }),
    invalidateCards: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.cards }),
    invalidateInvoices: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.invoices }),
    invalidatePlannings: () => queryClient.invalidateQueries({ queryKey: mobileQueryRoots.plannings }),
  }
}
