import { mobileCardResponseSchema, resourceIdSchema, updateMobileCardSchema } from '@contracts'
import { deleteCard, getCard, updateCard } from '@/application/api-v1/cards'
import { requireApiUser } from '../../_lib/auth'
import { contractJson } from '../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../_lib/problem'

type RouteContext = {
  params: Promise<{ cardId: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { cardId } = await context.params
  const instance = `/api/v1/cards/${cardId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await getCard(authResult.userId, resourceIdSchema.parse(cardId))
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Card not found.', instance, code: 'card_not_found' })
    }

    return contractJson(mobileCardResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { cardId } = await context.params
  const instance = `/api/v1/cards/${cardId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = updateMobileCardSchema.parse(await request.json())
    const data = await updateCard(authResult.userId, resourceIdSchema.parse(cardId), body)
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Card not found.', instance, code: 'card_not_found' })
    }

    return contractJson(mobileCardResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { cardId } = await context.params
  const instance = `/api/v1/cards/${cardId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const deleted = await deleteCard(authResult.userId, resourceIdSchema.parse(cardId))
    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Card not found.', instance, code: 'card_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
