import type { MobileEnvironment } from './api'

const DEFAULT_DEVELOPMENT_API_BASE_URL = 'http://localhost:3000'

export function resolveExpoPublicApiBaseUrl(value = process.env.EXPO_PUBLIC_API_BASE_URL) {
  const normalizedValue = value?.trim().replace(/\/$/, '')

  if (normalizedValue) {
    return normalizedValue
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_DEVELOPMENT_API_BASE_URL
  }

  throw new Error('EXPO_PUBLIC_API_BASE_URL must be configured for production builds.')
}

export function getMobileEnvironment(): MobileEnvironment {
  return {
    apiBaseUrl: resolveExpoPublicApiBaseUrl(),
  }
}

export function resolveExpoPublicClerkPublishableKey(value = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  const normalizedValue = value?.trim()

  if (normalizedValue) {
    return normalizedValue
  }

  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be configured for the mobile app.')
}
