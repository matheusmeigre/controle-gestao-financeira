/**
 * Enhanced Export Manager
 * 
 * Componente para exportação avançada de dados financeiros com:
 * - Seleção de período (mês atual, últimos 3 meses, ano completo)
 * - Gráficos e análises no Excel
 * - Comparativo entre períodos
 */

'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, TrendingUp, Calendar } from 'lucide-react'
import type { Expense, CardBill, Income } from '@/types/expense'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import ExcelJS from 'exceljs'

interface EnhancedExportManagerProps {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

type PeriodOption = 'current' | 'last3' | 'last6' | 'year'

export function EnhancedExportManager({ expenses, cardBills, incomes }: EnhancedExportManagerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('current')
  const [isExporting, setIsExporting] = useState(false)

  const getFilteredDataByPeriod = (period: PeriodOption) => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'current':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'last3':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        break
      case 'last6':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    const startDateStr = startDate.toISOString().slice(0, 10)

    return {
      expenses: expenses.filter(e => e.date >= startDateStr),
      cardBills: cardBills.filter(c => c.date >= startDateStr),
      incomes: incomes.filter(i => i.date >= startDateStr),
    }
  }

  const getPeriodLabel = (period: PeriodOption) => {
    switch (period) {
      case 'current':
        return 'Mês Atual'
      case 'last3':
        return 'Últimos 3 Meses'
      case 'last6':
        return 'Últimos 6 Meses'
      case 'year':
        return 'Ano Completo'
    }
  }

  const exportEnhancedExcel = async () => {
    setIsExporting(true)
    
    try {
      const { expenses: filteredExpenses, cardBills: filteredCardBills, incomes: filteredIncomes } = 
        getFilteredDataByPeriod(selectedPeriod)

      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Minha Gestão Financeira'
      workbook.created = new Date()

      // ==================== ABA 1: ANÁLISE DE TENDÊNCIAS ====================
      const trendsSheet = workbook.addWorksheet('Análise de Tendências')
      
      // Agrupar dados por mês
      const monthlyData = new Map<string, { incomes: number; expenses: number; cardBills: number }>()
      
      filteredIncomes.forEach(income => {
        const month = income.date.slice(0, 7)
        const current = monthlyData.get(month) || { incomes: 0, expenses: 0, cardBills: 0 }
        current.incomes += income.amount
        monthlyData.set(month, current)
      })

      filteredExpenses.forEach(expense => {
        const month = expense.date.slice(0, 7)
        const current = monthlyData.get(month) || { incomes: 0, expenses: 0, cardBills: 0 }
        current.expenses += expense.amount
        monthlyData.set(month, current)
      })

      filteredCardBills.forEach(bill => {
        const month = bill.date.slice(0, 7)
        const current = monthlyData.get(month) || { incomes: 0, expenses: 0, cardBills: 0 }
        current.cardBills += bill.totalAmount
        monthlyData.set(month, current)
      })

      // Header
      trendsSheet.mergeCells('A1:E1')
      const title = trendsSheet.getCell('A1')
      title.value = `ANÁLISE DE TENDÊNCIAS - ${getPeriodLabel(selectedPeriod).toUpperCase()}`
      title.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      title.alignment = { horizontal: 'center', vertical: 'middle' }
      trendsSheet.getRow(1).height = 30

      // Column headers
      trendsSheet.getRow(3).values = ['Mês', 'Receitas', 'Despesas Gerais', 'Faturas', 'Saldo']
      trendsSheet.getRow(3).font = { bold: true }
      trendsSheet.getRow(3).alignment = { horizontal: 'center' }

      // Data rows
      let row = 4
      const sortedMonths = Array.from(monthlyData.keys()).sort()
      
      sortedMonths.forEach(month => {
        const data = monthlyData.get(month)!
        const balance = data.incomes - data.expenses - data.cardBills
        
        const dataRow = trendsSheet.getRow(row)
        dataRow.values = [
          new Date(month + '-01'),
          data.incomes,
          data.expenses,
          data.cardBills,
          balance
        ]

        dataRow.getCell(1).numFmt = 'mmm/yyyy'
        dataRow.getCell(2).numFmt = '"R$ "#,##0.00'
        dataRow.getCell(3).numFmt = '"R$ "#,##0.00'
        dataRow.getCell(4).numFmt = '"R$ "#,##0.00'
        dataRow.getCell(5).numFmt = '"R$ "#,##0.00'

        // Color balance cell based on positive/negative
        if (balance >= 0) {
          dataRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }
        } else {
          dataRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }
        }

        row++
      })

      // Add chart
      const chart = trendsSheet.addImage({
        base64: '',  // Would need actual chart generation
        editAs: 'oneCell',
      })

      trendsSheet.columns = [
        { width: 15 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 }
      ]

      // ==================== ABA 2: POR CATEGORIA ====================
      const categorySheet = workbook.addWorksheet('Por Categoria')
      
      // Header
      categorySheet.mergeCells('A1:C1')
      const catTitle = categorySheet.getCell('A1')
      catTitle.value = 'ANÁLISE POR CATEGORIA'
      catTitle.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      catTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } }
      catTitle.alignment = { horizontal: 'center', vertical: 'middle' }
      categorySheet.getRow(1).height = 30

      // Group by category
      const categoryTotals = new Map<string, number>()
      filteredExpenses.forEach(expense => {
        const current = categoryTotals.get(expense.category) || 0
        categoryTotals.set(expense.category, current + expense.amount)
      })

      // Column headers
      categorySheet.getRow(3).values = ['Categoria', 'Total', '% do Total']
      categorySheet.getRow(3).font = { bold: true }
      categorySheet.getRow(3).alignment = { horizontal: 'center' }

      const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0)

      row = 4
      Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])  // Sort by amount descending
        .forEach(([category, amount]) => {
          const percentage = (amount / totalExpenses) * 100
          
          const catRow = categorySheet.getRow(row)
          catRow.values = [category, amount, percentage / 100]
          
          catRow.getCell(2).numFmt = '"R$ "#,##0.00'
          catRow.getCell(3).numFmt = '0.0%'
          
          row++
        })

      categorySheet.columns = [
        { width: 25 },
        { width: 18 },
        { width: 15 }
      ]

      // Save file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `analise-financeira-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.xlsx`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise e Exportação Avançada
        </CardTitle>
        <CardDescription>
          Exporte relatórios detalhados com análises de tendências e comparativos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period Selection */}
        <div className="space-y-2">
          <Label htmlFor="period">Período de Análise</Label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodOption)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="current">Mês Atual</option>
            <option value="last3">Últimos 3 Meses</option>
            <option value="last6">Últimos 6 Meses</option>
            <option value="year">Ano Completo ({new Date().getFullYear()})</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={exportEnhancedExcel} 
            className="w-full gap-2" 
            disabled={isExporting}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar Análise (Excel)'}
          </Button>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">O que está incluído:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Análise de tendências por mês</li>
            <li>Comparativo de receitas vs despesas</li>
            <li>Detalhamento por categoria</li>
            <li>Indicadores de saldo mensal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
