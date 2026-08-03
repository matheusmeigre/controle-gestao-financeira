import { useAuth } from '@clerk/clerk-expo'
import { useMemo } from 'react'
import { createMobileAppApiClient } from '../lib/api'
import { getMobileEnvironment } from '../lib/env'
import { getCurrentConnectivity } from './use-connectivity'

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
        const isOnline = await getCurrentConnectivity()

        if (!isOnline) {
          throw new Error('Device is offline.')
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
            throw new Error('Request timeout reached before the server responded.')
          }

          throw error
        } finally {
          clearTimeout(timeout)
        }

        if (response.status === 401) {
          await signOut()
        }

        return response
      },
    })
  }, [getToken, signOut])
}
