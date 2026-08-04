export const mobileQueryKeys = {
  bootstrap: ['mobile', 'bootstrap'] as const,
  expenses: (yearMonth?: string) => ['mobile', 'expenses', { yearMonth }] as const,
  incomes: (yearMonth?: string) => ['mobile', 'incomes', { yearMonth }] as const,
  cards: (includeInactive?: boolean) => ['mobile', 'cards', { includeInactive }] as const,
  invoices: (filters?: { cardId?: string; month?: number; year?: number }) => ['mobile', 'invoices', filters ?? {}] as const,
  plannings: ['mobile', 'plannings'] as const,
}

export const mobileQueryRoots = {
  bootstrap: ['mobile', 'bootstrap'] as const,
  expenses: ['mobile', 'expenses'] as const,
  incomes: ['mobile', 'incomes'] as const,
  cards: ['mobile', 'cards'] as const,
  invoices: ['mobile', 'invoices'] as const,
  plannings: ['mobile', 'plannings'] as const,
}
