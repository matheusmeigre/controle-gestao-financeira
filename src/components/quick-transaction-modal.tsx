'use client'

/**
 * QuickTransactionModal Component
 * 
 * Bottom sheet otimizado para adicionar transações rapidamente em mobile
 * - 50% da altura da tela
 * - Thumb-friendly (campos acessíveis com o polegar)
 * - Fluxo simplificado em steps
 * - Evita keyboard overlap
 */

import { useState, useEffect } from 'react'
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingDown, TrendingUp, CreditCard, X } from 'lucide-react'
import { CATEGORIES, INCOME_CATEGORIES } from '@/types/expense'
import type { Expense, Income } from '@/types/expense'
import { CurrencyInput } from '@/components/ui/currency-input'

type TransactionType = 'expense' | 'income' | 'card'

interface QuickTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddExpense?: (expense: Omit<Expense, 'id' | 'userId'>) => void
  onAddIncome?: (income: Omit<Income, 'id' | 'userId'>) => void
  onAddCardBill?: (cardBill: any) => void
}

export function QuickTransactionModal({
  open,
  onOpenChange,
  onAddExpense,
  onAddIncome,
  onAddCardBill,
}: QuickTransactionModalProps) {
  
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  
  // Expense Form
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'paid' | 'pending',
  })
  
  // Income Form
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'extra' as 'salary' | 'extra',
    status: 'pending' as 'pending' | 'received',
    salaryMonth: '', // Mês do salário (format: YYYY-MM)
    salaryPeriod: '', // Período opcional (ex: "01/02 - 28/02")
  })
  
  // Reset forms when modal opens
  useEffect(() => {
    if (open) {
      resetForms()
    }
  }, [open])
  
  const resetForms = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    })
    
    setIncomeForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'extra',
      status: 'pending',
      salaryMonth: '',
      salaryPeriod: '',
    })
  }
  
  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    onAddExpense?.({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      status: expenseForm.status,
    })
    
    onOpenChange(false)
  }
  
  const handleAddIncome = () => {
    // Validação especial para salário
    if (incomeForm.type === 'salary') {
      if (!incomeForm.amount || !incomeForm.salaryMonth) {
        alert('Preencha o valor e o mês do salário')
        return
      }
    } else {
      if (!incomeForm.description || !incomeForm.amount) {
        alert('Preencha todos os campos obrigatórios')
        return
      }
    }
    
    const now = new Date().toISOString()
    
    // Gera descrição automática para salário
    let description = incomeForm.description
    if (incomeForm.type === 'salary') {
      const [year, month] = incomeForm.salaryMonth.split('-')
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      const monthName = monthNames[parseInt(month) - 1]
      
      description = `Salário - ${monthName}/${year}`
      if (incomeForm.salaryPeriod) {
        description += ` (${incomeForm.salaryPeriod})`
      }
    }
    
    onAddIncome?.({
      description,
      amount: parseFloat(incomeForm.amount),
      type: incomeForm.type,
      category: incomeForm.category || 'Outros',
      date: incomeForm.date,
      status: incomeForm.status,
      registrationDate: now,
      receivedDate: incomeForm.status === 'received' ? now : null,
    })
    
    onOpenChange(false)
  }
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] md:max-h-[90vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-lg">Nova Transação</DrawerTitle>
            <DrawerDescription className="text-sm">
              Adicione uma despesa ou receita rapidamente
            </DrawerDescription>
            
            {/* Close button for better UX */}
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-140px)]">
            <Tabs value={activeType} onValueChange={(v) => setActiveType(v as TransactionType)}>
              {/* Tab Selector */}
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>Despesa</span>
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Receita</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Expense Form */}
              <TabsContent value="expense" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="expense-description">Descrição *</Label>
                  <Input
                    id="expense-description"
                    placeholder="Ex: Almoço no restaurante"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    autoFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Valor (R$) *</Label>
                  <CurrencyInput
                    id="expense-amount"
                    value={parseFloat(expenseForm.amount) || 0}
                    onChange={(value) => setExpenseForm({ ...expenseForm, amount: value.toString() })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Categoria *</Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                  >
                    <SelectTrigger id="expense-category">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Data</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expense-status">Status</Label>
                    <Select
                      value={expenseForm.status}
                      onValueChange={(value: 'paid' | 'pending') => 
                        setExpenseForm({ ...expenseForm, status: value })
                      }
                    >
                      <SelectTrigger id="expense-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              {/* Income Form */}
              <TabsContent value="income" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="income-type">Tipo</Label>
                  <Select
                    value={incomeForm.type}
                    onValueChange={(value: 'salary' | 'extra') => 
                      setIncomeForm({ ...incomeForm, type: value })
                    }
                  >
                    <SelectTrigger id="income-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salário</SelectItem>
                      <SelectItem value="extra">Renda Extra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Campos condicionais para Salário */}
                {incomeForm.type === 'salary' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="salary-month">Mês do Salário *</Label>
                      <Input
                        id="salary-month"
                        type="month"
                        value={incomeForm.salaryMonth}
                        onChange={(e) => setIncomeForm({ ...incomeForm, salaryMonth: e.target.value })}
                        max="9999-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salary-period">Período de Vigência (Opcional)</Label>
                      <Input
                        id="salary-period"
                        placeholder="Ex: 01/02 - 28/02"
                        value={incomeForm.salaryPeriod}
                        onChange={(e) => setIncomeForm({ ...incomeForm, salaryPeriod: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Informe o período da folha de pagamento, se aplicável
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="income-description">Descrição *</Label>
                    <Input
                      id="income-description"
                      placeholder="Ex: Freelance, Aluguel, Venda..."
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="income-amount">Valor (R$) *</Label>
                  <CurrencyInput
                    id="income-amount"
                    value={parseFloat(incomeForm.amount) || 0}
                    onChange={(value) => setIncomeForm({ ...incomeForm, amount: value.toString() })}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-date">Data</Label>
                    <Input
                      id="income-date"
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-status">Status</Label>
                    <Select
                      value={incomeForm.status}
                      onValueChange={(value: 'pending' | 'received') => 
                        setIncomeForm({ ...incomeForm, status: value })
                      }
                    >
                      <SelectTrigger id="income-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="received">Recebido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DrawerFooter className="border-t">
            <Button 
              onClick={activeType === 'expense' ? handleAddExpense : handleAddIncome}
              className="w-full h-12 text-base font-semibold"
            >
              {activeType === 'expense' ? 'Adicionar Despesa' : 'Adicionar Receita'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
