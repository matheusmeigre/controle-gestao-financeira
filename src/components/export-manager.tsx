"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import type { Expense, CardBill, Income } from "@/types/expense"
import { exportToExcel, exportToCSV, exportToText } from "@/lib/services/export.service"

interface ExportManagerProps {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

export function ExportManager({ expenses, cardBills, incomes }: ExportManagerProps) {
  const data = { expenses, cardBills, incomes }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button onClick={() => exportToExcel(data)} className="w-full gap-2" variant="default">
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </Button>
          <Button onClick={() => exportToCSV(data)} className="w-full gap-2 bg-transparent" variant="outline">
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={() => exportToText(data)} className="w-full gap-2 bg-transparent" variant="outline">
            <FileText className="h-4 w-4" />
            Texto (.txt)
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Os dados do mês atual serão exportados no formato selecionado. O arquivo Excel contém 4 abas separadas
          (Rendas, Gastos Gerais, Faturas e Resumo).
        </p>
      </CardContent>
    </Card>
  )
}
