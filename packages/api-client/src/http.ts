import { ZodTypeAny } from 'zod'
import type { ProblemDetails } from '@contracts'

export class MobileApiClientError extends Error {
  status: number
  problem?: ProblemDetails

  constructor(message: string, status: number, problem?: ProblemDetails) {
    super(message)
    this.name = 'MobileApiClientError'
    this.status = status
    this.problem = problem
  }
}

export type AuthHeadersResolver =
  | (() => HeadersInit | undefined | Promise<HeadersInit | undefined>)
  | undefined

export type RequestOptions = {
  method?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  schema?: ZodTypeAny
}

export type HttpClientOptions = {
  baseUrl?: string
  fetchImpl?: typeof fetch
  getAuthHeaders?: AuthHeadersResolver
  getAccessToken?: () => string | undefined | Promise<string | undefined>
  validateResponses?: boolean
}

export function createHttpClient(options: HttpClientOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const baseUrl = (options.baseUrl ?? '/api/v1').replace(/\/$/, '')
  const validateResponses = options.validateResponses ?? true
  const usesAbsoluteBaseUrl = /^https?:\/\//.test(baseUrl)

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const headers = new Headers({ Accept: 'application/json' })
    const authHeaders = await options.getAuthHeaders?.()
    if (authHeaders) {
      new Headers(authHeaders).forEach((value, key) => headers.set(key, value))
    }
    if (!headers.has('authorization')) {
      const accessToken = await options.getAccessToken?.()
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
    }

    const url = new URL(`${baseUrl}${path}`, 'http://localhost')
    for (const [key, value] of Object.entries(requestOptions.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }

    const init: RequestInit = {
      method: requestOptions.method ?? 'GET',
      headers,
    }

    if (requestOptions.body !== undefined) {
      if (requestOptions.body instanceof FormData) {
        init.body = requestOptions.body
      } else {
        headers.set('content-type', 'application/json')
        init.body = JSON.stringify(requestOptions.body)
      }
    }

    const response = await fetchImpl(usesAbsoluteBaseUrl ? url.toString() : url.pathname + url.search, init)

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json') || contentType.includes('application/problem+json')
      ? await response.json()
      : undefined

    if (!response.ok) {
      throw new MobileApiClientError(
        (payload as ProblemDetails | undefined)?.detail ?? `HTTP ${response.status}`,
        response.status,
        payload as ProblemDetails | undefined
      )
    }

    if (!requestOptions.schema || !validateResponses) {
      return payload as T
    }

    return requestOptions.schema.parse(payload) as T
  }

  return { request }
}
