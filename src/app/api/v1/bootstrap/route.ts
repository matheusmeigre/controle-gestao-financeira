import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { buildMobileBootstrap } from '../_lib/bootstrap'
import { problemFromUnknown, problemJson } from '../_lib/problem'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return problemJson({
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication is required to access this resource.',
        instance: '/api/v1/bootstrap',
        code: 'unauthorized',
      })
    }

    const payload = await buildMobileBootstrap(userId)
    return NextResponse.json(payload)
  } catch (error) {
    return problemFromUnknown(error, '/api/v1/bootstrap')
  }
}
