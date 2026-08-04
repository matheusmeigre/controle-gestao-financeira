import { QueryClient } from '@tanstack/react-query'

const MOBILE_QUERY_STALE_TIME = 1000 * 60
const MOBILE_QUERY_GC_TIME = 1000 * 60 * 60 * 12

export function createMobileQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: MOBILE_QUERY_STALE_TIME,
        gcTime: MOBILE_QUERY_GC_TIME,
        retry(failureCount, error) {
          if (failureCount >= 2) {
            return false
          }

          if (error instanceof Error && /timeout|offline|network/i.test(error.message)) {
            return true
          }

          return failureCount < 1
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
