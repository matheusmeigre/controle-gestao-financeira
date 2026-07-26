'use client'

import { useEffect } from 'react'
import { CircleAlert, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center" role="alert">
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <CircleAlert aria-hidden="true" />
      </span>
      <h1 className="text-xl font-bold">Não foi possível abrir esta área</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Seus dados permanecem seguros. Tente carregar a página novamente.
      </p>
      <Button onClick={reset} className="mt-6">
        <RotateCcw aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  )
}
