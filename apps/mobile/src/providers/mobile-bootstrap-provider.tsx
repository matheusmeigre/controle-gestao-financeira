import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { MobileApiClientError, type MobileBootstrapSession } from '@api-client'
import { FullScreenState } from './app-provider'
import { useBootstrapQuery } from '../hooks/use-mobile-queries'
import { captureMobileException, trackMobilePerformance } from '../lib/observability'

type MobileBootstrapState = {
  data?: MobileBootstrapSession
  error?: string
  loading: boolean
}

type MobileBootstrapContextValue = {
  state: MobileBootstrapState
  retry: () => Promise<void>
}

const MobileBootstrapContext = createContext<MobileBootstrapContextValue | null>(null)

export function MobileBootstrapProvider({ children }: PropsWithChildren) {
  const query = useBootstrapQuery()

  const retry = useCallback(async () => {
    const startedAt = Date.now()
    await query.refetch()
    trackMobilePerformance('bootstrap_retry', Date.now() - startedAt, {
      success: !query.error,
    })
  }, [query])

  const state = useMemo<MobileBootstrapState>(() => {
    const error = query.error instanceof MobileApiClientError
      ? query.error.problem?.detail ?? query.error.message
      : query.error instanceof Error
        ? query.error.message
        : undefined

    return {
      data: query.data,
      error,
      loading: query.isLoading || query.isFetching,
    }
  }, [query.data, query.error, query.isFetching, query.isLoading])

  if (query.error) {
    captureMobileException(query.error, { source: 'bootstrap-query' })
  }

  const value = useMemo(() => ({ state, retry }), [retry, state])

  if (state.loading && !state.data) {
    return <FullScreenState title="Preparando aplicativo" description="Carregando sessoes, resumo inicial e areas navegaveis." />
  }

  return <MobileBootstrapContext.Provider value={value}>{children}</MobileBootstrapContext.Provider>
}

export function useMobileBootstrap() {
  const context = useContext(MobileBootstrapContext)

  if (!context) {
    throw new Error('useMobileBootstrap must be used within MobileBootstrapProvider.')
  }

  return context
}
