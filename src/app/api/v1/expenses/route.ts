import { createMobileExpenseSchema, mobileExpensesListResponseSchema, mobileExpenseResponseSchema, yearMonthSchema } from '@contracts'
import { createExpense, listExpenses } from '@/application/api-v1/expenses'
import { requireApiUser } from '../_lib/auth'
import { contractJson } from '../_lib/contracts'
import { problemFromRequestError, problemFromUnknown } from '../_lib/problem'

export async function GET(request: Request) {
  const instance = '/api/v1/expenses'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const { searchParams } = new URL(request.url)
    const yearMonthParam = searchParams.get('yearMonth') ?? undefined
    const yearMonth = yearMonthParam ? yearMonthSchema.parse(yearMonthParam) : undefined
    const data = await listExpenses(authResult.userId, yearMonth)
    return contractJson(mobileExpensesListResponseSchema, { data })
  } catch (error) {
    return yearMonthSchema.safeParse(new URL(request.url).searchParams.get('yearMonth') ?? undefined).success
      ? problemFromUnknown(error, instance)
      : problemFromRequestError(error, instance)
  }
}

export async function POST(request: Request) {
  const instance = '/api/v1/expenses'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobileExpenseSchema.parse(await request.json())
    const data = await createExpense(authResult.userId, body)
    return contractJson(mobileExpenseResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return error instanceof SyntaxError || error instanceof Error && 'issues' in error
      ? problemFromRequestError(error, instance)
      : problemFromUnknown(error, instance)
  }
}
