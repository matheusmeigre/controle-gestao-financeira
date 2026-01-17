'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2, Home, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { CardSelector } from '@/features/cards'
import { 
  MonthYearPicker, 
  InvoiceImporter, 
  InvoiceDatesDisplay,
  useInvoiceCreation,
  InvoiceService
} from '@/features/invoices'
import { useUser } from '@clerk/nextjs'
import type { InvoiceItem } from '@/types/invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default function NewInvoicePage() {
  const router = useRouter()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🎣 Hook customizado para gerenciar criação de fatura
  const {
    cardId,
    setCardId,
    competency,
    setCompetency,
    calculatedDates,
    competencyDisplay,
    isReadyToCreate,
  } = useInvoiceCreation()
  
  // Items management
  const [items, setItems] = useState<InvoiceItem[]>([])
  
  // Datas extraídas do arquivo (prioritárias sobre as calculadas)
  const [extractedDates, setExtractedDates] = useState<{
    closingDate: string
    dueDate: string
    referenceMonth?: number
    referenceYear?: number
  } | null>(null)
  
  // Manual item entry
  const [newItem, setNewItem] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Outros',
  })
  
  const handleImportSuccess = (importedItems: InvoiceItem[], metadata?: any) => {
    setItems(prev => [...prev, ...importedItems])
    
    // Se o arquivo contém datas de fechamento e vencimento, usa elas
    if (metadata?.closingDate && metadata?.dueDate) {
      setExtractedDates({
        closingDate: metadata.closingDate,
        dueDate: metadata.dueDate,
        referenceMonth: metadata.referenceMonth,
        referenceYear: metadata.referenceYear,
      })
      
      // Atualiza a competência se disponível
      if (metadata.referenceMonth && metadata.referenceYear) {
        setCompetency({
          month: metadata.referenceMonth,
          year: metadata.referenceYear,
        })
      }
    }
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
    
    // Validações
    if (!user?.id) {
      setError('Usuário não autenticado')
      return
    }
    
    if (!isReadyToCreate) {
      setError('Selecione um cartão válido')
      return
    }
    
    // Usa datas extraídas do arquivo se disponíveis, senão usa as calculadas
    const datesToUse = extractedDates || calculatedDates
    
    if (!datesToUse) {
      setError('Erro ao determinar datas da fatura')
      return
    }
    
    if (items.length === 0) {
      setError('Adicione pelo menos um item à fatura')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Usa InvoiceService diretamente no cliente
      const invoiceService = new InvoiceService()
      
      await invoiceService.createInvoice(user.id, {
        cardId,
        month: extractedDates?.referenceMonth || competency.month,
        year: extractedDates?.referenceYear || competency.year,
        closingDate: datesToUse.closingDate,
        dueDate: datesToUse.dueDate,
        items,
      })
      
      router.push('/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao criar fatura')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  
  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      {/* Navegação */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
        </Link>
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Faturas
          </Button>
        </Link>
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Gerenciar Cartões
          </Button>
        </Link>
      </div>
      
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
          </CardContent>
        </Card>
        
        {/* Datas da Fatura */}
        {(extractedDates || calculatedDates) && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Datas da Fatura
                </CardTitle>
                {extractedDates && (
                  <Badge variant="default" className="bg-green-600">
                    ✓ Extraídas do arquivo
                  </Badge>
                )}
                {!extractedDates && calculatedDates && (
                  <Badge variant="outline">
                    🧮 Calculadas automaticamente
                  </Badge>
                )}
              </div>
              <CardDescription>
                {extractedDates 
                  ? 'Datas identificadas automaticamente na fatura importada'
                  : 'Datas calculadas com base nas configurações do cartão'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceDatesDisplay 
                dates={extractedDates || calculatedDates}
                competencyDisplay={competencyDisplay}
              />
            </CardContent>
          </Card>
        )}
        
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
            disabled={isSubmitting || !isReadyToCreate || items.length === 0}
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
