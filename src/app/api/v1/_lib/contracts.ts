import { NextResponse } from 'next/server'
import type { ZodTypeAny } from 'zod'

export function contractJson(schema: ZodTypeAny, payload: unknown, init?: ResponseInit) {
  return NextResponse.json(schema.parse(payload), init)
}
