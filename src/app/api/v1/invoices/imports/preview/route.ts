import { mobileInvoiceImportPreviewResponseSchema } from '@contracts'
import { previewInvoiceImport } from '@/application/api-v1/invoices'
import { requireApiUser } from '../../../_lib/auth'
import { contractJson } from '../../../_lib/contracts'
import { problemFromRequestError } from '../../../_lib/problem'

export async function POST(request: Request) {
  const instance = '/api/v1/invoices/imports/preview'

  try {
    const authResult = await requireApiUser(instance)
    if ('response' in authResult) return authResult.response

    const data = await previewInvoiceImport(await request.formData())
    return contractJson(mobileInvoiceImportPreviewResponseSchema, { data })
  } catch (error) {
    return problemFromRequestError(error, instance)
  }
}
