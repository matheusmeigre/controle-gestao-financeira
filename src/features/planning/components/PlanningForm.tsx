'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useToast } from '@/hooks/use-toast'
import { PLANNING_CATEGORIES } from '../types'
import type { CreatePlanningInput } from '../types'
import { Loader2 } from 'lucide-react'

interface PlanningFormProps {
  onSubmit: (data: CreatePlanningInput) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CreatePlanningInput>
  mode?: 'create' | 'edit'
}

export function PlanningForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  mode = 'create' 
}: PlanningFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CreatePlanningInput>>({
    name: initialData?.name || '',
    category: initialData?.category || 'custom',
    targetAmount: initialData?.targetAmount || 0,
    currentAmount: initialData?.currentAmount || 0,
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    targetDate: initialData?.targetDate || '',
    notes: initialData?.notes || '',
    linkedExpenseIds: initialData?.linkedExpenseIds || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do planejamento é obrigatório',
        variant: 'destructive',
      })
      return
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor alvo deve ser maior que zero',
        variant: 'destructive',
      })
      return
    }

    if (formData.targetDate) {
      const start = new Date(formData.startDate!)
      const target = new Date(formData.targetDate)
      
      if (target <= start) {
        toast({
          title: 'Erro',
          description: 'Data alvo deve ser posterior à data de início',
          variant: 'destructive',
        })
        return
      }
    }

    try {
      setLoading(true)
      await onSubmit(formData as CreatePlanningInput)
      
      toast({
        title: mode === 'create' ? 'Planejamento criado!' : 'Planejamento atualizado!',
        description: mode === 'create' 
          ? 'Seu planejamento foi criado com sucesso.'
          : 'Seu planejamento foi atualizado com sucesso.',
      })

      if (mode === 'create') {
        // Limpar formulário após criar
        setFormData({
          name: '',
          category: 'custom',
          targetAmount: 0,
          currentAmount: 0,
          startDate: new Date().toISOString().split('T')[0],
          targetDate: '',
          notes: '',
          linkedExpenseIds: [],
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar planejamento',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Planejamento *</Label>
          <Input
            id="name"
            placeholder="Ex: Viagem para Paris, Notebook Novo..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            maxLength={100}
            required
          />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PLANNING_CATEGORIES).map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor Alvo (R$) *</Label>
            <CurrencyInput
              id="targetAmount"
              value={formData.targetAmount || 0}
              onChange={(value) => setFormData({ ...formData, targetAmount: value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
            <CurrencyInput
              id="currentAmount"
              value={formData.currentAmount || 0}
              onChange={(value) => setFormData({ ...formData, currentAmount: value })}
            />
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Data Alvo</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Opcional - deixe em branco se não houver prazo
            </p>
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Observações sobre este planejamento..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {formData.notes?.length || 0}/500 caracteres
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar Planejamento' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
