'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UserHeader } from '@/components/user-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  usePlanning, 
  usePlannings,
  PLANNING_CATEGORIES
} from '@/features/planning'
import { 
  ArrowLeft, 
  Save, 
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function EditPlanningPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const planningId = params.id as string

  const { planning, loading } = usePlanning(planningId)
  const { updatePlanning } = usePlannings()

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    startDate: '',
    targetDate: '',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (planning) {
      setFormData({
        name: planning.name,
        targetAmount: planning.targetAmount,
        currentAmount: planning.currentAmount,
        startDate: planning.startDate,
        targetDate: planning.targetDate || '',
        notes: planning.notes || '',
      })
    }
  }, [planning])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!planning) return

    // Validações
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do planejamento é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (formData.targetAmount <= 0) {
      toast({
        title: 'Erro',
        description: 'O valor alvo deve ser maior que zero.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.startDate) {
      toast({
        title: 'Erro',
        description: 'A data de início é obrigatória.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      
      await updatePlanning({
        id: planning.id,
        name: formData.name,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        startDate: formData.startDate,
        targetDate: formData.targetDate || undefined,
        notes: formData.notes || undefined,
      })

      toast({
        title: 'Sucesso!',
        description: 'Planejamento atualizado com sucesso.',
      })

      router.push(`/planning/${planning.id}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o planejamento.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <UserHeader />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </>
    )
  }

  if (!planning) {
    return (
      <>
        <UserHeader />
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Planejamento não encontrado.</p>
            <Link href="/planning">
              <Button className="mt-4">Voltar</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const category = Object.values(PLANNING_CATEGORIES).find(
    (cat) => cat.value === planning.category
  )

  return (
    <>
      <UserHeader />
      <div className="container mx-auto py-8 space-y-6 max-w-2xl">
        {/* Navegação */}
        <Link href={`/planning/${planningId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4">
          <span className="text-4xl">{category?.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">Editar Planejamento</h1>
            <p className="text-muted-foreground">{category?.label}</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Planejamento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Viagem para Paris"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Alvo *</Label>
                <CurrencyInput
                  id="targetAmount"
                  value={formData.targetAmount}
                  onChange={(value) => setFormData({ ...formData, targetAmount: value })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual</Label>
                <CurrencyInput
                  id="currentAmount"
                  value={formData.currentAmount}
                  onChange={(value) => setFormData({ ...formData, currentAmount: value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <DatePicker
                  id="startDate"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <DatePicker
                  id="targetDate"
                  value={formData.targetDate}
                  onChange={(date) => setFormData({ ...formData, targetDate: date })}
                  placeholder="Selecione a data"
                  minDate={formData.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Adicione observações sobre este planejamento..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Link href={`/planning/${planningId}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </>
  )
}
