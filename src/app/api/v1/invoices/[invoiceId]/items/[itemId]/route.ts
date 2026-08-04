import { resourceIdSchema } from '@contracts'
import { removeInvoiceItem } from '@/application/api-v1/invoices'
import { requireApiUser } from '../../../../_lib/auth'
import { problemFromRequestError, problemJson } from '../../../../_lib/problem'

type RouteContext = {
  params: Promise<{ invoiceId: string; itemId: string }>
}

export async function DELETE(_: Request, context: RouteContext) {
  const { invoiceId, itemId } = await context.params
  const instance = `/api/v1/invoices/${invoiceId}/items/${itemId}`

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const deleted = await removeInvoiceItem(
      authResult.userId,
      resourceIdSchema.parse(invoiceId),
      resourceIdSchema.parse(itemId)
    )

    if (!deleted) {
      return problemJson({ title: 'Not Found', status: 404, detail: 'Invoice or item not found.', instance, code: 'invoice_item_not_found' })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
