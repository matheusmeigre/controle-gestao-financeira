import { createMobileIncomeSchema, mobileIncomeResponseSchema, mobileIncomesListResponseSchema, yearMonthSchema } from '@contracts'
import { createIncome, listIncomes } from '@/application/api-v1/incomes'
import { requireApiUser } from '../_lib/auth'
import { contractJson } from '../_lib/contracts'
import { problemFromRequestError, problemFromUnknown } from '../_lib/problem'

export async function GET(request: Request) {
  const instance = '/api/v1/incomes'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const yearMonthParam = new URL(request.url).searchParams.get('yearMonth') ?? undefined
    const yearMonth = yearMonthParam ? yearMonthSchema.parse(yearMonthParam) : undefined
    const data = await listIncomes(authResult.userId, yearMonth)
    return contractJson(mobileIncomesListResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function POST(request: Request) {
  const instance = '/api/v1/incomes'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobileIncomeSchema.parse(await request.json())
    const data = await createIncome(authResult.userId, body)
    return contractJson(mobileIncomeResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
