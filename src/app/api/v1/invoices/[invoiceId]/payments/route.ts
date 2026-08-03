import { mobileInvoiceResponseSchema, resourceIdSchema, updateMobileInvoicePaymentSchema } from '@contracts'
import { payInvoice } from '@/application/api-v1/invoices'
import { requireApiUser } from '../../../_lib/auth'
import { contractJson } from '../../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../../_lib/problem'

type RouteContext = {
  params: Promise<{ invoiceId: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const { invoiceId } = await context.params
  const instance = `/api/v1/invoices/${invoiceId}/payments`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const body = updateMobileInvoicePaymentSchema.parse(await request.json())
    const data = await payInvoice(authResult.userId, resourceIdSchema.parse(invoiceId), body)
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Invoice not found.', instance, code: 'invoice_not_found' })
    }

    return contractJson(mobileInvoiceResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
