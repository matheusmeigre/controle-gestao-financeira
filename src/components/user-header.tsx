"use client"

import Link from 'next/link'
import { UserButton, useUser } from "@clerk/nextjs"
import { Landmark, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BalanceVisibilityToggle } from '@/components/balance/balance-visibility-toggle'
import { Button } from '@/components/ui/button'

export function UserHeader() {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="Minha Gestão Financeira, ir para o resumo">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-[1.03]">
              <Landmark className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold tracking-tight sm:text-base">Minha Gestão</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Controle financeiro pessoal</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/?action=new">
                <Plus aria-hidden="true" />
                Nova transação
              </Link>
            </Button>
            <BalanceVisibilityToggle />
            <ThemeToggle />
            <div className="hidden max-w-36 text-right lg:block">
              <p className="truncate text-sm font-semibold">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || 'Minha conta'}
              </p>
              <p className="truncate text-xs text-muted-foreground">Conta pessoal</p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "size-10",
                  userButtonPopoverCard: "shadow-xl",
                }
              }}
            />
          </div>
      </div>
    </header>
  )
}
