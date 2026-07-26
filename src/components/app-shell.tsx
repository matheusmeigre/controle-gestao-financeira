'use client'

import { Suspense, type ReactNode } from 'react'
import { BottomNavigation } from '@/components/mobile/bottom-navigation'
import { DesktopNavigation } from '@/components/mobile/desktop-navigation'
import { UserHeader } from '@/components/user-header'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#conteudo-principal"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo principal
      </a>
      <UserHeader />
      <Suspense fallback={<div className="hidden h-12 border-b md:block" aria-hidden="true" />}>
        <DesktopNavigation />
      </Suspense>
      <main
        id="conteudo-principal"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
      >
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" role="status" aria-label="Carregando conteúdo" />}>
          {children}
        </Suspense>
      </main>
      <Suspense fallback={<div className="fixed inset-x-0 bottom-0 h-16 border-t bg-card md:hidden" aria-hidden="true" />}>
        <BottomNavigation />
      </Suspense>
    </div>
  )
}
