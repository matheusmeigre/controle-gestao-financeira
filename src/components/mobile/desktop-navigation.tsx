'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { appNavigationItems, isNavigationItemActive } from './navigation-items'

export function DesktopNavigation() {
  const pathname = usePathname()
  const view = useSearchParams().get('view')

  return (
    <nav className="sticky top-16 z-40 hidden border-b bg-background/92 backdrop-blur-lg md:block" aria-label="Navegacao principal">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-6 lg:px-8">
      {appNavigationItems.map((item) => {
        const Icon = item.icon
        const isActive = isNavigationItemActive(item, pathname, view)

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        )
      })}
      </div>
    </nav>
  )
}
