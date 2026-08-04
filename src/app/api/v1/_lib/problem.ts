import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { problemDetailsSchema, type ProblemDetails } from '@contracts'

type ProblemInput = Omit<ProblemDetails, 'status' | 'title' | 'type'> & {
  status: number
  title: string
  type?: string
}

export function problemJson(input: ProblemInput) {
  const body = problemDetailsSchema.parse({
    type: input.type ?? 'about:blank',
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    errors: input.errors,
  })

  return NextResponse.json(body, {
    status: input.status,
    headers: {
      'content-type': 'application/problem+json',
    },
  })
}

export function problemFromUnknown(error: unknown, instance: string) {
  if (error instanceof ZodError) {
    const flattenedErrors = Object.fromEntries(
      Object.entries(error.flatten().fieldErrors).filter(([, value]) => Array.isArray(value))
    ) as Record<string, string[]>

    return problemJson({
      type: 'https://datatracker.ietf.org/doc/html/rfc7807#section-3.1',
      title: 'Invalid response payload',
      status: 500,
      detail: 'The server generated a payload that does not match the declared contract.',
      instance,
      code: 'contract_violation',
      errors: flattenedErrors,
    })
  }

  return problemJson({
    title: 'Internal Server Error',
    status: 500,
    detail: error instanceof Error ? error.message : 'Unexpected error',
    instance,
    code: 'internal_error',
  })
}

export function problemFromRequestError(error: unknown, instance: string) {
  if (error instanceof ZodError) {
    const flattenedErrors = Object.fromEntries(
      Object.entries(error.flatten().fieldErrors).filter(([, value]) => Array.isArray(value))
    ) as Record<string, string[]>

    return problemJson({
      type: 'https://datatracker.ietf.org/doc/html/rfc7807#section-3.1',
      title: 'Invalid request payload',
      status: 400,
      detail: 'The request body does not match the declared contract.',
      instance,
      code: 'invalid_request',
      errors: flattenedErrors,
    })
  }

  if (error instanceof SyntaxError) {
    return problemJson({
      title: 'Invalid JSON body',
      status: 400,
      detail: error.message,
      instance,
      code: 'invalid_json',
    })
  }

  return problemJson({
    title: 'Bad Request',
    status: 400,
    detail: error instanceof Error ? error.message : 'Invalid request',
    instance,
    code: 'bad_request',
  })
}
