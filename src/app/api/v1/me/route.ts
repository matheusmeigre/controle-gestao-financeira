import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { mobileMeResponseSchema } from '@contracts'
import { problemFromUnknown, problemJson } from '../_lib/problem'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return problemJson({
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication is required to access this resource.',
        instance: '/api/v1/me',
        code: 'unauthorized',
      })
    }

    const payload = mobileMeResponseSchema.parse({
      data: {
        id: userId,
      },
    })

    return NextResponse.json(payload)
  } catch (error) {
    return problemFromUnknown(error, '/api/v1/me')
  }
}
