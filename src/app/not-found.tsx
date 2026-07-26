import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <SearchX className="mx-auto mb-4 size-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-semibold text-primary">Erro 404</p>
        <h1 className="mt-1 text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          O endereço pode ter mudado ou não está mais disponível.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Voltar ao resumo
          </Link>
        </Button>
      </div>
    </main>
  )
}
