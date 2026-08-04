import { useAuth } from '@clerk/clerk-expo'
import { useMemo } from 'react'
import { createMobileAppApiClient } from '../lib/api'
import { getMobileEnvironment } from '../lib/env'
import { getCurrentConnectivity } from './use-connectivity'
import { captureMobileApiFailure, trackMobilePerformance } from '../lib/observability'
import { tokenCache } from '../lib/auth/token-cache'

const MOBILE_REQUEST_TIMEOUT_MS = 10000

export function useMobileApi() {
  const { getToken, signOut } = useAuth()

  return useMemo(() => {
    const environment = getMobileEnvironment()

    return createMobileAppApiClient(environment, async () => {
      const accessToken = await getToken()

      return { accessToken: accessToken ?? undefined }
    }, {
      fetchImpl: async (input, init) => {
        const startedAt = Date.now()
        const isOnline = await getCurrentConnectivity()

        if (!isOnline) {
          const offlineError = new Error('Device is offline.')
          captureMobileApiFailure(offlineError, { endpoint: String(input), reason: 'offline' })
          throw offlineError
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), MOBILE_REQUEST_TIMEOUT_MS)

        let response: Response

        try {
          response = await fetch(input, {
            ...init,
            signal: controller.signal,
          })
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            const timeoutError = new Error('Request timeout reached before the server responded.')
            captureMobileApiFailure(timeoutError, { endpoint: String(input), reason: 'timeout' })
            throw timeoutError
          }

          captureMobileApiFailure(error, { endpoint: String(input), reason: 'network' })
          throw error
        } finally {
          clearTimeout(timeout)
        }

        trackMobilePerformance('api_request', Date.now() - startedAt, {
          endpoint: String(input),
          method: init?.method ?? 'GET',
          status: response.status,
        })

        if (response.status === 401) {
          await tokenCache.clearToken('session')
          await signOut()
        }

        return response
      },
    })
  }, [getToken, signOut])
}
