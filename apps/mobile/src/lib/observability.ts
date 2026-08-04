import Constants from 'expo-constants'
import * as Device from 'expo-device'
import {
  pushObservabilityEvent,
  sanitizeObservabilityValue,
  type ObservabilityEvent,
  type ObservabilityLevel,
} from './observability-core'

const appStartTime = Date.now()

let coldStartTracked = false

export function getMobileObservabilityContext() {
  return {
    appVersion: Constants.expoConfig?.version ?? 'unknown',
    appOwnership: Constants.appOwnership ?? 'unknown',
    environment: process.env.NODE_ENV ?? 'development',
    deviceName: Device.deviceName ?? 'unknown-device',
    osName: Device.osName ?? 'unknown-os',
    osVersion: Device.osVersion ?? 'unknown-version',
    manufacturer: Device.manufacturer ?? 'unknown-manufacturer',
  }
}

export function trackMobileEvent(type: string, message: string, context?: Record<string, unknown>, level: ObservabilityLevel = 'info') {
  const event: ObservabilityEvent = {
    type,
    level,
    message,
    timestamp: new Date().toISOString(),
    context: sanitizeObservabilityValue({
      ...getMobileObservabilityContext(),
      ...context,
    }) as Record<string, unknown>,
  }

  pushObservabilityEvent(event)

  const logger = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info
  logger('[mobile-observability]', event)
}

export function captureMobileException(error: unknown, context?: Record<string, unknown>) {
  const normalizedError = error instanceof Error ? error : new Error('Unknown mobile exception')

  trackMobileEvent('exception', normalizedError.message, {
    stack: normalizedError.stack,
    ...context,
  }, 'error')
}

export function captureMobileApiFailure(error: unknown, context?: Record<string, unknown>) {
  const normalizedError = error instanceof Error ? error : new Error('Unknown API failure')

  trackMobileEvent('api_failure', normalizedError.message, context, 'warning')
}

export function trackMobilePerformance(metric: string, durationMs: number, context?: Record<string, unknown>) {
  trackMobileEvent('performance', metric, {
    durationMs,
    ...context,
  })
}

export function trackMobileColdStartCompleted() {
  if (coldStartTracked) {
    return
  }

  coldStartTracked = true
  trackMobilePerformance('cold_start_completed', Date.now() - appStartTime)
}

export function registerMobileGlobalErrorHandler() {
  const maybeErrorUtils = (globalThis as typeof globalThis & {
    ErrorUtils?: { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void }
  }).ErrorUtils as
    | { getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void; setGlobalHandler?: (handler: (error: Error, isFatal?: boolean) => void) => void }
    | undefined

  if (!maybeErrorUtils?.setGlobalHandler) {
    return
  }

  const previousHandler = maybeErrorUtils.getGlobalHandler?.()

  maybeErrorUtils.setGlobalHandler((error, isFatal) => {
    captureMobileException(error, { isFatal: Boolean(isFatal), source: 'global-error-handler' })
    previousHandler?.(error, isFatal)
  })
}
