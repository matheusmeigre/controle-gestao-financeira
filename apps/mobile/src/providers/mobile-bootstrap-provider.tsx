import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MobileApiClientError, type MobileBootstrapSession } from '@api-client'
import { FullScreenState } from './app-provider'
import { useMobileApi } from '../hooks/use-mobile-api'

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
  const api = useMobileApi()
  const [state, setState] = useState<MobileBootstrapState>({ loading: true })

  const retry = useCallback(async () => {
    setState({ loading: true })

    try {
      const data = await api.bootstrapSession()
      setState({ data, loading: false })
    } catch (error: unknown) {
      const message = error instanceof MobileApiClientError
        ? error.problem?.detail ?? error.message
        : 'Nao foi possivel concluir o bootstrap do app.'

      setState({ error: message, loading: false })
    }
  }, [api])

  useEffect(() => {
    void retry()
  }, [retry])

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
