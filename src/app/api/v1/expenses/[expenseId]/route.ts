import { mobileExpenseResponseSchema, resourceIdSchema, updateMobileExpenseSchema } from '@contracts'
import { deleteExpense, getExpense, updateExpense } from '@/application/api-v1/expenses'
import { requireApiUser } from '../../_lib/auth'
import { contractJson } from '../../_lib/contracts'
import { problemFromRequestError, problemFromUnknown, problemJson } from '../../_lib/problem'

type RouteContext = {
  params: Promise<{ expenseId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const { expenseId } = await context.params
  const instance = `/api/v1/expenses/${expenseId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const id = resourceIdSchema.parse(expenseId)
    const body = updateMobileExpenseSchema.parse(await request.json())
    const data = await updateExpense(authResult.userId, id, body)

    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Expense not found.', instance, code: 'expense_not_found' })
    }

    return contractJson(mobileExpenseResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function GET(_: Request, context: RouteContext) {
  const { expenseId } = await context.params
  const instance = `/api/v1/expenses/${expenseId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await getExpense(authResult.userId, resourceIdSchema.parse(expenseId))

    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Expense not found.', instance, code: 'expense_not_found' })
    }

    return contractJson(mobileExpenseResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { expenseId } = await context.params
  const instance = `/api/v1/expenses/${expenseId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const id = resourceIdSchema.parse(expenseId)
    const deleted = await deleteExpense(authResult.userId, id)

    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Expense not found.', instance, code: 'expense_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromUnknown(error, instance)
  }
}
