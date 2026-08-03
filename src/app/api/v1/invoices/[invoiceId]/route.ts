import { mobileInvoiceResponseSchema, resourceIdSchema } from '@contracts'
import { deleteInvoice, getInvoice } from '@/application/api-v1/invoices'
import { requireApiUser } from '../../_lib/auth'
import { contractJson } from '../../_lib/contracts'
import { problemFromRequestError, problemJson } from '../../_lib/problem'

type RouteContext = {
  params: Promise<{ invoiceId: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { invoiceId } = await context.params
  const instance = `/api/v1/invoices/${invoiceId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await getInvoice(authResult.userId, resourceIdSchema.parse(invoiceId))
    if (!data) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Invoice not found.', instance, code: 'invoice_not_found' })
    }

    return contractJson(mobileInvoiceResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { invoiceId } = await context.params
  const instance = `/api/v1/invoices/${invoiceId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const deleted = await deleteInvoice(authResult.userId, resourceIdSchema.parse(invoiceId))
    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Invoice not found.', instance, code: 'invoice_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
