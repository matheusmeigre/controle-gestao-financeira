'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { useToast } from '@/hooks/use-toast'
import { 
  usePlanning, 
  usePlanningIndicators,
  usePlannings,
  PLANNING_CATEGORIES,
  PLANNING_STATUS
} from '@/features/planning'
import { 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Plus,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Target,
  DollarSign,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function PlanningDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const planningId = params.id as string

  const { planning, loading, refresh } = usePlanning(planningId)
  const indicators = usePlanningIndicators(planning)
  const { 
    deletePlanning, 
    markAsCompleted, 
    markAsCancelled,
    addAmount 
  } = usePlannings()

  const [amountToAdd, setAmountToAdd] = useState(0)
  const [isAddingAmount, setIsAddingAmount] = useState(false)

  const handleDelete = async () => {
    if (!planning) return

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este planejamento?'
    )

    if (!confirmed) return

    try {
      await deletePlanning(planning.id)
      toast({
        title: 'Planejamento excluído',
        description: 'O planejamento foi removido com sucesso.',
      })
      router.push('/planning')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o planejamento.',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsCompleted = async () => {
    if (!planning) return

    try {
      await markAsCompleted(planning.id)
      await refresh()
      toast({
        title: 'Parabéns! 🎉',
        description: 'Planejamento marcado como completo!',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o planejamento.',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsCancelled = async () => {
    if (!planning) return

    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar este planejamento?'
    )

    if (!confirmed) return

    try {
      await markAsCancelled(planning.id)
      await refresh()
      toast({
        title: 'Planejamento cancelado',
        description: 'O planejamento foi marcado como cancelado.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o planejamento.',
        variant: 'destructive',
      })
    }
  }

  const handleAddAmount = async () => {
    if (!planning || amountToAdd <= 0) {
      toast({
        title: 'Erro',
        description: 'Digite um valor válido.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsAddingAmount(true)
      await addAmount(planning.id, amountToAdd)
      await refresh()
      setAmountToAdd(0)
      toast({
        title: 'Valor adicionado!',
        description: `R$ ${amountToAdd.toFixed(2)} foi adicionado ao planejamento.`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o valor.',
        variant: 'destructive',
      })
    } finally {
      setIsAddingAmount(false)
    }
  }

  if (loading) {
    return (
          <div className="flex items-center justify-center py-12" role="status" aria-label="Carregando planejamento">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
    )
  }

  if (!planning || !indicators) {
    return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Planejamento não encontrado.</p>
            <Button asChild className="mt-4"><Link href="/planning">Voltar</Link></Button>
          </div>
    )
  }

  const category = Object.values(PLANNING_CATEGORIES).find(
    (cat) => cat.value === planning.category
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusConfig = () => {
    switch (planning.status) {
      case PLANNING_STATUS.COMPLETED:
        return {
          label: 'Completo',
          className: 'bg-success/10 text-success border-success/20',
          icon: CheckCircle2,
        }
      case PLANNING_STATUS.CANCELLED:
        return {
          label: 'Cancelado',
          className: 'bg-muted text-muted-foreground',
          icon: XCircle,
        }
      case PLANNING_STATUS.IN_PROGRESS:
        return {
          label: 'Em Progresso',
          className: 'bg-primary/10 text-primary border-primary/20',
          icon: TrendingUp,
        }
      default:
        return {
          label: 'Planejado',
          className: 'bg-primary/10 text-primary border-primary/20',
          icon: Target,
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const isActive = planning.status !== PLANNING_STATUS.COMPLETED && 
                   planning.status !== PLANNING_STATUS.CANCELLED

  return (
    <div className="mx-auto max-w-4xl space-y-7">
        <PageHeader
          backHref="/planning"
          eyebrow={category?.label}
          title={planning.name}
          description="Acompanhe o progresso, atualize valores e revise as datas deste objetivo."
          actions={<Badge className={statusConfig.className}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {statusConfig.label}
          </Badge>}
        />

        {/* Alertas */}
        {isActive && (indicators.isOverBudget || indicators.isDelayed) && (
          <div className="space-y-2">
            {indicators.isOverBudget && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      Orçamento Estourado
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Você já gastou {formatCurrency(planning.currentAmount - planning.targetAmount)} a 
                      mais do que o planejado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {indicators.isDelayed && (
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      Planejamento Atrasado
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Este planejamento está atrasado 
                      {indicators.daysRemaining && ` há ${Math.abs(indicators.daysRemaining)} dias`}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card de Progresso */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Progresso</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Progresso atual</span>
                <span className="text-2xl font-bold">{indicators.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    indicators.isCompleted
                      ? 'bg-green-500'
                      : indicators.isOverBudget
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(indicators.progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Valor Atual</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(planning.currentAmount)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>Valor Alvo</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(planning.targetAmount)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Restante</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(indicators.amountRemaining)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card de Informações */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Informações</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data de Início</p>
              <p className="font-medium">{formatDate(planning.startDate)}</p>
            </div>

            {planning.targetDate && (
              <div>
                <p className="text-sm text-muted-foreground">Data Alvo</p>
                <p className="font-medium">
                  {formatDate(planning.targetDate)}
                  {indicators.daysRemaining !== undefined && indicators.daysRemaining > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({indicators.daysRemaining} dias restantes)
                    </span>
                  )}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="font-medium">{formatDate(planning.createdAt.toString())}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Atualizado em</p>
              <p className="font-medium">{formatDate(planning.updatedAt.toString())}</p>
            </div>
          </div>

          {planning.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notas</p>
              <p className="text-sm bg-muted p-3 rounded-md">{planning.notes}</p>
            </div>
          )}
        </Card>

        {/* Card de Ações */}
        {isActive && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Adicionar Valor</h2>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="amount">Valor (R$)</Label>
                <CurrencyInput
                  id="amount"
                  value={amountToAdd}
                  onChange={setAmountToAdd}
                  placeholder="Digite o valor"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddAmount}
                  disabled={isAddingAmount || amountToAdd <= 0}
                >
                  {isAddingAmount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Ações */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            {isActive && (
              <>
                <Button
                  variant="default"
                  onClick={handleMarkAsCompleted}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Completo
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMarkAsCancelled}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/planning/${planning.id}/edit`)}
              disabled={planning.status === PLANNING_STATUS.CANCELLED}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
    </div>
  )
}
