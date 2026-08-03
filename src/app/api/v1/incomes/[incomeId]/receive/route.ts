import { mobileIncomeResponseSchema, receiveMobileIncomeSchema, resourceIdSchema } from '@contracts'
import { receiveIncome } from '@/application/api-v1/incomes'
import { requireApiUser } from '../../../_lib/auth'
import { contractJson } from '../../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../../_lib/problem'

type RouteContext = {
  params: Promise<{ incomeId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const { incomeId } = await context.params
  const instance = `/api/v1/incomes/${incomeId}/receive`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const id = resourceIdSchema.parse(incomeId)
    const rawBody = request.headers.get('content-length') === '0' ? {} : await request.json().catch(() => ({}))
    const body = receiveMobileIncomeSchema.parse(rawBody)
    const data = await receiveIncome(authResult.userId, id, body)

    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Income not found.', instance, code: 'income_not_found' })
    }

    return contractJson(mobileIncomeResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
