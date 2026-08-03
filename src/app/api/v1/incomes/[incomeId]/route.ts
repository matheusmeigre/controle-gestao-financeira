import { mobileIncomeResponseSchema, resourceIdSchema, updateMobileIncomeSchema } from '@contracts'
import { deleteIncome, updateIncome } from '@/application/api-v1/incomes'
import { requireApiUser } from '../../_lib/auth'
import { contractJson } from '../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../_lib/problem'

type RouteContext = {
  params: Promise<{ incomeId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { incomeId } = await context.params
  const instance = `/api/v1/incomes/${incomeId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const id = resourceIdSchema.parse(incomeId)
    const body = updateMobileIncomeSchema.parse(await request.json())
    const data = await updateIncome(authResult.userId, id, body)

    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Income not found.', instance, code: 'income_not_found' })
    }

    return contractJson(mobileIncomeResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { incomeId } = await context.params
  const instance = `/api/v1/incomes/${incomeId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const id = resourceIdSchema.parse(incomeId)
    const deleted = await deleteIncome(authResult.userId, id)

    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Income not found.', instance, code: 'income_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
