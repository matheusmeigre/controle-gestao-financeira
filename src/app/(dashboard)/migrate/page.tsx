'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, ArrowRight, Database, Loader2 } from 'lucide-react'
import { UserHeader } from '@/components/user-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { migrateFromLocalStorage } from '@/server/actions/migrate'
import type { MigrationPayload } from '@/server/actions/migrate'
import type { Expense } from '@/features/expenses/types'
import type { Income } from '@/features/incomes/types'
import type { CreditCard } from '@/features/cards/types'
import type { CardBill } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'
import type { Planning } from '@/features/planning/types'

function readLocalStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function MigratePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.replace('/')
    }
  }, [router])

  const [step, setStep] = useState<'idle' | 'scanning' | 'preview' | 'migrating' | 'done' | 'error'>('idle')
  const [preview, setPreview] = useState<MigrationPayload | null>(null)
  const [result, setResult] = useState<Awaited<ReturnType<typeof migrateFromLocalStorage>> | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isLoaded || !user) return null

  const handleScan = () => {
    setStep('scanning')
    try {
      const userId = user.id

      const expenses: Expense[] = readLocalStorage<Expense>(`expenses_${userId}`)
      const incomes: Income[] = readLocalStorage<Income>(`incomes_${userId}`)
      const allCards: CreditCard[] = readLocalStorage<CreditCard>('credit_cards')
      const cards = allCards.filter((c) => c.userId === userId)
      const cardBills: CardBill[] = readLocalStorage<CardBill>(`cardBills_${userId}`)
      const invoices: Invoice[] = readLocalStorage<Invoice>(`invoices_${userId}`)
      const plannings: Planning[] = readLocalStorage<Planning>(`plannings_${userId}`)

      setPreview({ expenses, incomes, cards, cardBills, invoices, plannings })
      setStep('preview')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao ler localStorage')
      setStep('error')
    }
  }

  const handleMigrate = async () => {
    if (!preview) return
    setStep('migrating')
    try {
      const res = await migrateFromLocalStorage(preview)
      setResult(res)
      setStep('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Erro durante migração')
      setStep('error')
    }
  }

  const total = preview
    ? preview.expenses.length + preview.incomes.length + preview.cards.length +
      preview.cardBills.length + preview.invoices.length + preview.plannings.length
    : 0

  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-10 px-4 max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Database className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Migração para a Nuvem</h1>
          <p className="text-sm text-muted-foreground">
            Transfere seus dados do armazenamento local do navegador para o banco de dados seguro em nuvem (Supabase).
          </p>
        </div>

        {/* IDLE */}
        {step === 'idle' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm">
                Clique em <strong>Verificar dados</strong> para ver o que está salvo localmente e pode ser migrado.
              </p>
              <Button onClick={handleScan} className="w-full gap-2">
                <Database className="w-4 h-4" />
                Verificar dados locais
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SCANNING */}
        {step === 'scanning' && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Lendo dados locais...</p>
            </CardContent>
          </Card>
        )}

        {/* PREVIEW */}
        {step === 'preview' && preview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados encontrados</CardTitle>
              <CardDescription>
                {total === 0 ? 'Nenhum dado encontrado para migrar.' : `${total} registros prontos para migrar.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Despesas', count: preview.expenses.length },
                { label: 'Receitas', count: preview.incomes.length },
                { label: 'Cartões', count: preview.cards.length },
                { label: 'Faturas de Cartão (legado)', count: preview.cardBills.length },
                { label: 'Faturas (sistema atual)', count: preview.invoices.length },
                { label: 'Planejamentos', count: preview.plannings.length },
              ].map(({ label, count }) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{count} registros</span>
                </div>
              ))}
              {total === 0 ? (
                <p className="text-sm text-muted-foreground pt-2">
                  Não há dados locais para migrar. Você já pode usar o sistema normalmente.
                </p>
              ) : (
                <Button onClick={handleMigrate} className="w-full gap-2 mt-4">
                  <ArrowRight className="w-4 h-4" />
                  Migrar {total} registros para a nuvem
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                Cancelar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* MIGRATING */}
        {step === 'migrating' && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Migrando dados para o Supabase...</p>
              <p className="text-xs text-muted-foreground">Aguarde, não feche esta página.</p>
            </CardContent>
          </Card>
        )}

        {/* DONE */}
        {step === 'done' && result && (
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Migração concluída com sucesso!</span>
              </div>
              <div className="space-y-1">
                {Object.entries(result.migrated).map(([key, count]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{count} migrados</span>
                  </div>
                ))}
              </div>
              {result.errors.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-400">
                  Alguns itens não puderam ser migrados (possível duplicata ignorada)
                </div>
              )}
              <Button className="w-full" onClick={() => router.push('/')}>
                Ir para o início
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ERROR */}
        {step === 'error' && (
          <Card className="border-destructive">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Erro na migração</span>
              </div>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button variant="outline" className="w-full" onClick={() => setStep('idle')}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
