import { describe, expect, it } from 'vitest'
import { assertSecureMobileApiBaseUrl, getMobileEnvironment, resolveExpoPublicApiBaseUrl, resolveExpoPublicClerkPublishableKey } from './env'
import { resolveMobileApiBaseUrl } from './api'

describe('mobile environment', () => {
  it('normalizes the configured base URL', () => {
    expect(resolveExpoPublicApiBaseUrl('https://example.com/')).toBe('https://example.com')
  })

  it('falls back to localhost outside production', () => {
    expect(resolveExpoPublicApiBaseUrl(undefined)).toBe('http://localhost:3000')
  })

  it('resolves the API v1 base URL for the shared client', () => {
    expect(resolveMobileApiBaseUrl(getMobileEnvironment())).toBe('http://localhost:3000/api/v1')
  })

  it('requires a Clerk publishable key', () => {
    expect(resolveExpoPublicClerkPublishableKey('pk_test_123')).toBe('pk_test_123')
  })

  it('keeps https base URLs for secure mobile environments', () => {
    expect(assertSecureMobileApiBaseUrl('https://example.com')).toBe('https://example.com')
  })
})
