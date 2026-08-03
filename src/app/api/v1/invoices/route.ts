import { createMobileInvoiceSchema, mobileInvoiceResponseSchema, mobileInvoicesListResponseSchema, resourceIdSchema } from '@contracts'
import { createInvoice, listInvoices } from '@/application/api-v1/invoices'
import { requireApiUser } from '../_lib/auth'
import { contractJson } from '../_lib/contracts'
import { problemFromRequestError } from '../_lib/problem'

export async function GET(request: Request) {
  const instance = '/api/v1/invoices'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const searchParams = new URL(request.url).searchParams
    const cardId = searchParams.get('cardId') ? resourceIdSchema.parse(searchParams.get('cardId')) : undefined
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined
    const data = await listInvoices(authResult.userId, { cardId, month, year })
    return contractJson(mobileInvoicesListResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function POST(request: Request) {
  const instance = '/api/v1/invoices'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = createMobileInvoiceSchema.parse(await request.json())
    const data = await createInvoice(authResult.userId, body)
    return contractJson(mobileInvoiceResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
