import { createMobileApiClient, type MobileApiClientOptions } from '@api-client'

export type MobileEnvironment = {
  apiBaseUrl: string
}

export type MobileAuthSession = {
  accessToken?: string
}

export function resolveMobileApiBaseUrl(environment: MobileEnvironment) {
  return `${environment.apiBaseUrl.replace(/\/$/, '')}/api/v1`
}

export function createMobileAppApiClient(
  environment: MobileEnvironment,
  getSession?: () => Promise<MobileAuthSession | null> | MobileAuthSession | null,
  options: Omit<MobileApiClientOptions, 'baseUrl' | 'getAccessToken'> = {}
) {
  return createMobileApiClient({
    ...options,
    baseUrl: resolveMobileApiBaseUrl(environment),
    getAccessToken: async () => (await getSession?.())?.accessToken,
  })
}
