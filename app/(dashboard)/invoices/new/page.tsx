'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CardSelector } from '@/components/cards/CardSelector'
import { MonthYearPicker } from '@/components/invoices/MonthYearPicker'
import { InvoiceImporter } from '@/components/invoices/InvoiceImporter'
import { createInvoice } from '@/server/actions/invoices'
import type { InvoiceItem } from '@/types/invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [cardId, setCardId] = useState('')
  const [competency, setCompetency] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const [closingDate, setClosingDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  
  // Manual item entry
  const [newItem, setNewItem] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Outros',
  })
  
  const handleImportSuccess = (importedItems: InvoiceItem[]) => {
    setItems(prev => [...prev, ...importedItems])
  }
  
  const handleAddManualItem = () => {
    if (!newItem.description || !newItem.amount) {
      return
    }
    
    const item: InvoiceItem = {
      id: crypto.randomUUID(),
      date: new Date(newItem.date),
      description: newItem.description,
      amount: parseFloat(newItem.amount),
      category: newItem.category,
      createdAt: new Date(),
    }
    
    setItems(prev => [...prev, item])
    
    // Reset form
    setNewItem({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'Outros',
    })
  }
  
  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cardId) {
      setError('Selecione um cartão')
      return
    }
    
    if (!closingDate || !dueDate) {
      setError('Preencha as datas de fechamento e vencimento')
      return
    }
    
    if (items.length === 0) {
      setError('Adicione pelo menos um item à fatura')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const result = await createInvoice({
        cardId,
        month: competency.month,
        year: competency.year,
        closingDate: new Date(closingDate),
        dueDate: new Date(dueDate),
        items,
      })
      
      if (!result.success) {
        setError(result.error || 'Erro ao criar fatura')
        return
      }
      
      router.push('/invoices')
    } catch (err) {
      setError('Erro inesperado ao criar fatura')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      {/* Back Button */}
      <Link href="/invoices">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Faturas
        </Button>
      </Link>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Fatura</CardTitle>
            <CardDescription>
              Selecione o cartão e a competência da fatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardSelector
              value={cardId}
              onChange={setCardId}
              disabled={isSubmitting}
            />
            
            <MonthYearPicker
              value={competency}
              onChange={setCompetency}
              disabled={isSubmitting}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closingDate">
                  Data de Fechamento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Data de Vencimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Import */}
        {cardId && (
          <InvoiceImporter
            cardId={cardId}
            month={competency.month}
            year={competency.year}
            onImportSuccess={handleImportSuccess}
          />
        )}
        
        {/* Manual Item Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Item Manualmente</CardTitle>
            <CardDescription>
              Adicione itens individuais à fatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemDate">Data</Label>
                <Input
                  id="itemDate"
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="itemDescription">Descrição</Label>
                <Input
                  id="itemDescription"
                  placeholder="Ex: Compra em loja"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="itemAmount">Valor (R$)</Label>
                <Input
                  id="itemAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.amount}
                  onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddManualItem}
              disabled={!newItem.description || !newItem.amount}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>
        
        {/* Items List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Itens da Fatura ({items.length})</CardTitle>
                <CardDescription>
                  Total: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalAmount)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item adicionado. Importe um arquivo ou adicione manualmente.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('pt-BR')} • {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.amount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Fatura...
              </>
            ) : (
              'Criar Fatura'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
