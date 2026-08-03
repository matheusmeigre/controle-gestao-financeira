import { useAuth } from '@clerk/clerk-expo'
import { useMemo } from 'react'
import { createMobileAppApiClient } from '../lib/api'
import { getMobileEnvironment } from '../lib/env'

export function useMobileApi() {
  const { getToken, signOut } = useAuth()

  return useMemo(() => {
    const environment = getMobileEnvironment()

    return createMobileAppApiClient(environment, async () => {
      const accessToken = await getToken()

      return { accessToken: accessToken ?? undefined }
    }, {
      fetchImpl: async (input, init) => {
        const response = await fetch(input, init)

        if (response.status === 401) {
          await signOut()
        }

        return response
      },
    })
  }, [getToken, signOut])
}
