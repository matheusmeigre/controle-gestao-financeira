'use client'

import { useState, useEffect } from 'react'
import { X, Users, Plus, Trash2, DollarSign, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CurrencyInput } from '@/components/ui/currency-input'
import type { Invoice, InvoiceItem } from '../types'
import type { CreditCard } from '@/features/cards/types'

interface InvoiceEditModalProps {
  invoice: Invoice
  card?: CreditCard
  onClose: () => void
  onSave: (updates: Partial<Invoice>) => Promise<void>
}

interface PersonDivision {
  personName: string
  amount: number
  items: string[] // IDs dos itens atribuídos a essa pessoa
}

const PERSON_OPTIONS = ['Eu', 'Mãe', 'Irmão', 'Outro'] as const

const PERSON_COLORS: Record<string, string> = {
  'Eu': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'Mãe': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'Irmão': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Outro': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800',
}

export function InvoiceEditModal({ invoice, card, onClose, onSave }: InvoiceEditModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isPaid, setIsPaid] = useState(invoice.isPaid)
  const [paidAmount, setPaidAmount] = useState(invoice.paidAmount)
  const [itemDivisions, setItemDivisions] = useState<Record<string, string>>({})
  const [customPersonName, setCustomPersonName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Inicializa divisões dos itens
  useEffect(() => {
    const initialDivisions: Record<string, string> = {}
    invoice.items.forEach(item => {
      // Tenta extrair pessoa do notes ou usa 'Eu' como padrão
      const personFromNotes = item.notes?.match(/Pessoa: (.+)/)?.[1]
      initialDivisions[item.id!] = personFromNotes || 'Eu'
    })
    setItemDivisions(initialDivisions)
  }, [invoice.items])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcula divisões por pessoa
  const personDivisions: PersonDivision[] = Object.entries(
    invoice.items.reduce((acc, item) => {
      const person = itemDivisions[item.id!] || 'Eu'
      if (!acc[person]) {
        acc[person] = { personName: person, amount: 0, items: [] }
      }
      acc[person].amount += item.amount
      acc[person].items.push(item.id!)
      return acc
    }, {} as Record<string, PersonDivision>)
  ).map(([_, division]) => division)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Atualiza os itens com as informações de pessoa nos notes
      const updatedItems = invoice.items.map(item => ({
        ...item,
        notes: `Pessoa: ${itemDivisions[item.id!] || 'Eu'}${item.notes ? `\n${item.notes.replace(/Pessoa: .+\n?/, '')}` : ''}`,
      }))

      await onSave({
        isPaid,
        paidAmount,
        items: updatedItems,
      })
    } catch (error) {
      console.error('Erro ao salvar fatura:', error)
      alert('Erro ao salvar alterações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCustomPerson = () => {
    if (customPersonName.trim()) {
      // Pode adicionar lógica para salvar nome customizado
      setShowCustomInput(false)
      setCustomPersonName('')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Editar Fatura e Divisão
          </DialogTitle>
          <DialogDescription>
            {card && `${card.nickname} (•••• ${card.last4Digits})`} - Total: {formatCurrency(invoice.totalAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status de pagamento */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Status de Pagamento</Label>
              <Badge variant={isPaid ? 'default' : 'secondary'}>
                {isPaid ? '✓ Paga' : 'Pendente'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={isPaid ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsPaid(true)
                  if (paidAmount === 0) setPaidAmount(invoice.totalAmount)
                }}
              >
                Marcar como Paga
              </Button>
              <Button
                type="button"
                variant={!isPaid ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsPaid(false)
                  setPaidAmount(0)
                }}
              >
                Marcar como Pendente
              </Button>
            </div>

            {isPaid && (
              <div className="space-y-2">
                <Label htmlFor="paidAmount">Valor Pago</Label>
                <CurrencyInput
                  id="paidAmount"
                  value={paidAmount}
                  onChange={(value) => setPaidAmount(value || 0)}
                  placeholder="R$ 0,00"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Divisão por pessoa */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Divisão por Pessoa</h3>
                <p className="text-sm text-muted-foreground">
                  Atribua cada item da fatura a uma pessoa
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomInput(!showCustomInput)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Pessoa customizada
              </Button>
            </div>

            {showCustomInput && (
              <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Nome da pessoa"
                  value={customPersonName}
                  onChange={(e) => setCustomPersonName(e.target.value)}
                />
                <Button onClick={handleAddCustomPerson} size="sm">
                  Adicionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomPersonName('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Resumo da divisão */}
            {personDivisions.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {personDivisions.map(division => (
                  <div
                    key={division.personName}
                    className={`p-4 rounded-lg border-2 ${PERSON_COLORS[division.personName] || PERSON_COLORS['Outro']}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">{division.personName}</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(division.amount)}</p>
                    <p className="text-xs mt-1">
                      {division.items.length} {division.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Lista de itens com seleção de pessoa */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">
              Itens da Fatura ({invoice.items.length})
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {invoice.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      {item.installment && (
                        <>
                          <span>•</span>
                          <span>Parcela {item.installment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bold whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </span>
                    
                    <select
                      value={itemDivisions[item.id!] || 'Eu'}
                      onChange={(e) => {
                        setItemDivisions(prev => ({
                          ...prev,
                          [item.id!]: e.target.value,
                        }))
                      }}
                      className={`px-3 py-1.5 rounded-md border-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary ${
                        PERSON_COLORS[itemDivisions[item.id!] || 'Eu'] || PERSON_COLORS['Outro']
                      }`}
                    >
                      {PERSON_OPTIONS.map(person => (
                        <option key={person} value={person}>
                          {person}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
