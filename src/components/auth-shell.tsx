import type { ReactNode } from 'react'
import Link from 'next/link'
import { BarChart3, Landmark, LockKeyhole, Sparkles } from 'lucide-react'

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.8fr)]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full border border-white/15" />
        <div className="absolute -bottom-40 -left-20 size-[32rem] rounded-full bg-white/8 blur-2xl" />
        <Link href="/" className="relative flex items-center gap-3 font-bold">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Landmark aria-hidden="true" />
          </span>
          Minha Gestão Financeira
        </Link>

        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            Clareza para decidir melhor
          </p>
          <h2 className="text-balance text-4xl font-bold leading-tight xl:text-5xl">
            Sua vida financeira organizada em um único lugar.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BarChart3, text: 'Visão mensal objetiva' },
              { icon: Sparkles, text: 'Planejamento prático' },
              { icon: LockKeyhole, text: 'Dados privados por conta' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Icon className="mb-3 size-5" aria-hidden="true" />
                <p className="text-sm font-medium leading-5">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/65">Controle pessoal, simples e acessível em qualquer dispositivo.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center lg:text-left">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 font-bold lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Landmark className="size-5" aria-hidden="true" />
              </span>
              Minha Gestão
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
