import { useMutation } from '@tanstack/react-query'
import { useMobileApi } from './use-mobile-api'

export function useInvoiceImportPreviewMutation() {
  const api = useMobileApi()

  return useMutation({
    mutationFn: (input: { file: File; cardId: string; month: number; year: number }) => api.previewInvoiceImport(input),
  })
}
