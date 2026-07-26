'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { appNavigationItems, isNavigationItemActive } from './navigation-items'

const mobileNavigationItems = appNavigationItems.filter((item) => item.id !== 'cards')

export function BottomNavigation() {
  const pathname = usePathname()
  const view = useSearchParams().get('view')

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/94 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgb(0_0_0/0.04)] backdrop-blur-xl md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon
          const isActive = isNavigationItemActive(item, pathname, view)

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-colors active:bg-accent",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-105"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "mt-0.5 max-w-full truncate text-[10px] font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
