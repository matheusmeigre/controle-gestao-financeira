import type { MobileBootstrapSession } from '@api-client'
import { createMobileAppApiClient, type MobileAuthSession, type MobileEnvironment } from './api'
import type { MobileApiClientOptions } from '@api-client'

export type LoadMobileSessionInput = {
  environment: MobileEnvironment
  getSession?: () => Promise<MobileAuthSession | null> | MobileAuthSession | null
  clientOptions?: Omit<MobileApiClientOptions, 'baseUrl' | 'getAccessToken'>
  yearMonth?: string
  includeInactiveCards?: boolean
  invoices?: {
    cardId?: string
    month?: number
    year?: number
  }
}

export async function loadMobileBootstrapSession(input: LoadMobileSessionInput): Promise<MobileBootstrapSession> {
  const client = createMobileAppApiClient(input.environment, input.getSession, input.clientOptions)

  return client.bootstrapSession({
    yearMonth: input.yearMonth,
    includeInactiveCards: input.includeInactiveCards,
    invoices: input.invoices,
  })
}
