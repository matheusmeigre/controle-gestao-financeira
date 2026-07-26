'use client'

/**
 * FinancialReportsView Component
 * 
 * Visualização completa de relatórios financeiros com:
 * - Gráfico de evolução mensal (linha)
 * - Tabela de entradas/saídas por período
 * - Baseado no Organizze
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import type { Expense, Income, CardBill } from '@/types/expense'
import type { Invoice } from '@/features/invoices/types'

interface FinancialReportsViewProps {
  expenses: Expense[]
  incomes: Income[]
  cardBills: CardBill[]
  invoices?: Invoice[] // Adicionado suporte opcional para invoices
}

type MonthlyData = {
  month: string
  entradas: number
  saidas: number
  saldo: number
}

export function FinancialReportsView({ 
  expenses, 
  incomes, 
  cardBills,
  invoices = [] // Valor padrão: array vazio
}: FinancialReportsViewProps) {
  
  // Processa dados para os últimos 6 meses
  const monthlyData = useMemo<MonthlyData[]>(() => {
    const now = new Date()
    const data: MonthlyData[] = []
    
    // Gera últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      
      // Calcula entradas (apenas recebidos)
      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date)
        const incomeKey = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`
        return incomeKey === monthKey && income.status === 'received'
      })
      const totalIncomes = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
      
      // Calcula saídas (despesas pagas + faturas de cardBills + invoices pagas)
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const expenseKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
        return expenseKey === monthKey && expense.status === 'paid'
      })
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      const monthCardBills = cardBills.filter(bill => {
        const billDate = new Date(bill.date)
        const billKey = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`
        return billKey === monthKey
      })
      const totalCardBills = monthCardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      
      // Adiciona invoices (faturas do módulo de cartões)
      const monthInvoices = invoices.filter(invoice => {
        const invoiceKey = `${invoice.year}-${String(invoice.month).padStart(2, '0')}`
        return invoiceKey === monthKey && invoice.isPaid
      })
      const totalInvoices = monthInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)
      
      const totalSaidas = totalExpenses + totalCardBills + totalInvoices
      const saldo = totalIncomes - totalSaidas
      
      data.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        entradas: totalIncomes,
        saidas: totalSaidas,
        saldo: saldo,
      })
    }
    
    return data
  }, [expenses, incomes, cardBills, invoices])
  
  // Calcula acumulado
  const cumulativeData = useMemo(() => {
    let accumulated = 0
    return monthlyData.map(item => {
      accumulated += item.saldo
      return {
        ...item,
        acumulado: accumulated
      }
    })
  }, [monthlyData])
  
  // Estatísticas gerais
  const stats = useMemo(() => {
    const currentMonth = monthlyData[monthlyData.length - 1]
    const previousMonth = monthlyData[monthlyData.length - 2]
    
    const totalEntradas = monthlyData.reduce((sum, m) => sum + m.entradas, 0)
    const totalSaidas = monthlyData.reduce((sum, m) => sum + m.saidas, 0)
    const mediaEntradas = totalEntradas / monthlyData.length
    const mediaSaidas = totalSaidas / monthlyData.length
    
    const crescimentoEntradas = previousMonth 
      ? ((currentMonth.entradas - previousMonth.entradas) / previousMonth.entradas) * 100
      : 0
    const crescimentoSaidas = previousMonth
      ? ((currentMonth.saidas - previousMonth.saidas) / previousMonth.saidas) * 100
      : 0
    
    return {
      totalEntradas,
      totalSaidas,
      mediaEntradas,
      mediaSaidas,
      crescimentoEntradas,
      crescimentoSaidas,
      currentMonth,
    }
  }, [monthlyData])
  
  // Formatter para moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Relatórios Financeiros
        </h2>
        <p className="text-muted-foreground mt-1">
          Análise dos últimos 6 meses
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Entradas</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums text-success">
              {formatCurrency(stats.totalEntradas)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(stats.mediaEntradas)}/mês
            </p>
            {stats.crescimentoEntradas !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${stats.crescimentoEntradas > 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.crescimentoEntradas > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.crescimentoEntradas).toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Saídas</CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums text-destructive">
              {formatCurrency(stats.totalSaidas)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(stats.mediaSaidas)}/mês
            </p>
            {stats.crescimentoSaidas !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${stats.crescimentoSaidas < 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.crescimentoSaidas > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.crescimentoSaidas).toFixed(1)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Atual</CardDescription>
            <CardTitle className={`font-mono text-2xl tabular-nums ${stats.currentMonth.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.currentMonth.saldo)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Acumulado</CardDescription>
            <CardTitle className={`font-mono text-2xl tabular-nums ${cumulativeData[cumulativeData.length - 1].acumulado >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(cumulativeData[cumulativeData.length - 1].acumulado)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              6 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>
            Entradas, saídas e saldo acumulado ao longo dos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value) || 0)}
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entradas" 
                stroke="var(--chart-2)"
                strokeWidth={2}
                name="Entradas"
                dot={{ fill: 'var(--chart-2)', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="saidas" 
                stroke="var(--chart-4)"
                strokeWidth={2}
                name="Saídas"
                dot={{ fill: 'var(--chart-4)', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="acumulado" 
                stroke="var(--chart-1)"
                strokeWidth={2}
                name="Saldo Acumulado"
                dot={{ fill: 'var(--chart-1)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
          <CardDescription>
            Entradas vs Saídas mês a mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value) || 0)}
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="entradas" fill="var(--chart-2)" name="Entradas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill="var(--chart-4)" name="Saídas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Período</CardTitle>
          <CardDescription>
            Valores consolidados mês a mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35" tabIndex={0} aria-label="Tabela de detalhamento financeiro por período">
            <table className="w-full text-sm">
              <caption className="sr-only">Entradas, saídas e saldo final consolidados por mês</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left py-3 px-2 font-semibold">Período</th>
                  <th scope="col" className="text-right py-3 px-2 font-semibold text-success">Entradas</th>
                  <th scope="col" className="text-right py-3 px-2 font-semibold text-destructive">Saídas</th>
                  <th scope="col" className="text-right py-3 px-2 font-semibold">Saldo Final</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">{item.month}</td>
                    <td className="text-right py-3 px-2 font-mono tabular-nums text-success">
                      {formatCurrency(item.entradas)}
                    </td>
                    <td className="text-right py-3 px-2 font-mono tabular-nums text-destructive">
                      {formatCurrency(item.saidas)}
                    </td>
                    <td className={`text-right py-3 px-2 font-mono font-semibold tabular-nums ${item.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(item.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-muted/30">
                  <th scope="row" className="py-3 px-2 text-left">TOTAL</th>
                  <td className="text-right py-3 px-2 font-mono tabular-nums text-success">
                    {formatCurrency(stats.totalEntradas)}
                  </td>
                  <td className="text-right py-3 px-2 font-mono tabular-nums text-destructive">
                    {formatCurrency(stats.totalSaidas)}
                  </td>
                  <td className={`text-right py-3 px-2 font-mono tabular-nums ${(stats.totalEntradas - stats.totalSaidas) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(stats.totalEntradas - stats.totalSaidas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
