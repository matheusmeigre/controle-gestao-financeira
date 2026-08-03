import { createMobileCardSchema, mobileCardResponseSchema, mobileCardsListResponseSchema } from '@contracts'
import { createCard, listCards } from '@/application/api-v1/cards'
import { requireApiUser } from '../_lib/auth'
import { contractJson } from '../_lib/contracts'
import { problemFromRequestError } from '../_lib/problem'

export async function GET(request: Request) {
  const instance = '/api/v1/cards'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const includeInactive = new URL(request.url).searchParams.get('includeInactive') === 'true'
    const data = await listCards(authResult.userId, includeInactive)
    return contractJson(mobileCardsListResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function POST(request: Request) {
  const instance = '/api/v1/cards'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobileCardSchema.parse(await request.json())
    const data = await createCard(authResult.userId, body)
    return contractJson(mobileCardResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
