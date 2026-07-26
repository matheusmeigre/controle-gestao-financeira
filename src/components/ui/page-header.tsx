import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  backHref,
  backLabel = 'Voltar',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {backHref && (
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        )}
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
