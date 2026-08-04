import { addMobileInvoiceItemSchema, mobileInvoiceItemResponseSchema, resourceIdSchema } from '@contracts'
import { addInvoiceItem } from '@/application/api-v1/invoices'
import { requireApiUser } from '../../../_lib/auth'
import { contractJson } from '../../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../../_lib/problem'

type RouteContext = {
  params: Promise<{ invoiceId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const { invoiceId } = await context.params
  const instance = `/api/v1/invoices/${invoiceId}/items`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = addMobileInvoiceItemSchema.parse(await request.json())
    const data = await addInvoiceItem(authResult.userId, resourceIdSchema.parse(invoiceId), body)
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Invoice not found.', instance, code: 'invoice_not_found' })
    }

    return contractJson(mobileInvoiceItemResponseSchema, { data }, { status: 201 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
