"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import type { Expense, CardBill, Income } from "@/types/expense"
import ExcelJS from "exceljs"

interface ExportManagerProps {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

export function ExportManager({ expenses, cardBills, incomes }: ExportManagerProps) {
  const exportToExcel = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    const monthYear = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    // Filtrar dados do mês atual
    const monthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth))
    const monthCardBills = cardBills.filter((bill) => bill.date.startsWith(currentMonth))
    const monthIncomes = incomes.filter((income) => income.date.startsWith(currentMonth))

    // Criar workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Minha Gestão Financeira"
    workbook.created = new Date()

    const cellBorder = {
      top: { style: "thin" as const, color: { argb: "FF000000" } },
      left: { style: "thin" as const, color: { argb: "FF000000" } },
      bottom: { style: "thin" as const, color: { argb: "FF000000" } },
      right: { style: "thin" as const, color: { argb: "FF000000" } },
    }

    // ==================== ABA 1: RENDAS ====================
    const incomesSheet = workbook.addWorksheet("Rendas")

    // Linha 1: Título principal (mesclado A1:D1) - Azul
    incomesSheet.mergeCells("A1:D1")
    const titleCell1 = incomesSheet.getCell("A1")
    titleCell1.value = `RELATÓRIO FINANCEIRO - ${monthYear.toUpperCase()}`
    titleCell1.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
    titleCell1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
    titleCell1.alignment = { horizontal: "center", vertical: "middle" }
    titleCell1.border = cellBorder
    incomesSheet.getRow(1).height = 25

    // Linha 3: Cabeçalho da seção RENDAS (mesclado A3:D3) - Verde
    incomesSheet.mergeCells("A3:D3")
    const rendaHeader = incomesSheet.getCell("A3")
    rendaHeader.value = "RENDAS"
    rendaHeader.font = { bold: true, size: 11, color: { argb: "FF000000" } }
    rendaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } }
    rendaHeader.alignment = { horizontal: "center", vertical: "middle" }
    rendaHeader.border = cellBorder
    incomesSheet.getRow(3).height = 22

    // Linha 4: Cabeçalhos das colunas
    const incomeHeaders = ["Data", "Tipo", "Descrição", "Valor"]
    incomesSheet.getRow(4).values = incomeHeaders
    incomesSheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true, size: 10 }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = cellBorder
    })
    incomesSheet.getRow(4).height = 20

    // Dados das rendas
    let currentRow = 5
    monthIncomes.forEach((income) => {
      const row = incomesSheet.getRow(currentRow)
      const tipo = income.type === "salary" ? "Salário" : "Renda Extra"
      row.values = [new Date(income.date + "T00:00:00"), tipo, income.description, income.amount]

      row.getCell(1).numFmt = "dd/mm/yyyy"
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
      row.getCell(1).border = cellBorder

      row.getCell(2).alignment = { horizontal: "left", vertical: "middle" }
      row.getCell(2).border = cellBorder

      row.getCell(3).alignment = { horizontal: "left", vertical: "middle" }
      row.getCell(3).border = cellBorder

      row.getCell(4).numFmt = '"R$ "#,##0.00'
      row.getCell(4).alignment = { horizontal: "right", vertical: "middle" }
      row.getCell(4).border = cellBorder

      currentRow++
    })

    // Total das rendas (mesclar A:C para o label)
    if (monthIncomes.length > 0) {
      currentRow++
      const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
      incomesSheet.mergeCells(`A${currentRow}:C${currentRow}`)
      const totalLabelCell = incomesSheet.getCell(`A${currentRow}`)
      totalLabelCell.value = "TOTAL RENDAS"
      totalLabelCell.font = { bold: true, size: 11 }
      totalLabelCell.alignment = { horizontal: "center", vertical: "middle" }
      totalLabelCell.border = cellBorder

      const totalValueCell = incomesSheet.getCell(`D${currentRow}`)
      totalValueCell.value = totalIncome
      totalValueCell.numFmt = '"R$ "#,##0.00'
      totalValueCell.font = { bold: true, size: 11 }
      totalValueCell.alignment = { horizontal: "right", vertical: "middle" }
      totalValueCell.border = cellBorder
      incomesSheet.getRow(currentRow).height = 22
    }

    // Ajustar largura das colunas
    incomesSheet.columns = [{ width: 12 }, { width: 15 }, { width: 45 }, { width: 15 }]

    // ==================== ABA 2: GASTOS GERAIS ====================
    const expensesSheet = workbook.addWorksheet("Gastos Gerais")

    // Linha 1: Título principal (mesclado A1:D1) - Azul
    expensesSheet.mergeCells("A1:D1")
    const titleCell2 = expensesSheet.getCell("A1")
    titleCell2.value = `RELATÓRIO FINANCEIRO - ${monthYear.toUpperCase()}`
    titleCell2.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
    titleCell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
    titleCell2.alignment = { horizontal: "center", vertical: "middle" }
    titleCell2.border = cellBorder
    expensesSheet.getRow(1).height = 25

    // Linha 3: Cabeçalho da seção GASTOS GERAIS (mesclado A3:D3) - Amarelo
    expensesSheet.mergeCells("A3:D3")
    const gastosHeader = expensesSheet.getCell("A3")
    gastosHeader.value = "GASTOS GERAIS"
    gastosHeader.font = { bold: true, size: 11, color: { argb: "FF000000" } }
    gastosHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } }
    gastosHeader.alignment = { horizontal: "center", vertical: "middle" }
    gastosHeader.border = cellBorder
    expensesSheet.getRow(3).height = 22

    // Linha 4: Cabeçalhos das colunas
    const expensesHeaders = ["Data", "Categoria", "Descrição", "Valor"]
    expensesSheet.getRow(4).values = expensesHeaders
    expensesSheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true, size: 10 }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = cellBorder
    })
    expensesSheet.getRow(4).height = 20

    // Dados dos gastos
    currentRow = 5
    monthExpenses.forEach((expense) => {
      const row = expensesSheet.getRow(currentRow)
      row.values = [new Date(expense.date + "T00:00:00"), expense.category, expense.description, expense.amount]

      row.getCell(1).numFmt = "dd/mm/yyyy"
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
      row.getCell(1).border = cellBorder

      row.getCell(2).alignment = { horizontal: "left", vertical: "middle" }
      row.getCell(2).border = cellBorder

      row.getCell(3).alignment = { horizontal: "left", vertical: "middle" }
      row.getCell(3).border = cellBorder

      row.getCell(4).numFmt = '"R$ "#,##0.00'
      row.getCell(4).alignment = { horizontal: "right", vertical: "middle" }
      row.getCell(4).border = cellBorder

      currentRow++
    })

    // Total dos gastos
    if (monthExpenses.length > 0) {
      currentRow++
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      expensesSheet.mergeCells(`A${currentRow}:C${currentRow}`)
      const totalLabelCell = expensesSheet.getCell(`A${currentRow}`)
      totalLabelCell.value = "TOTAL GASTOS GERAIS"
      totalLabelCell.font = { bold: true, size: 11 }
      totalLabelCell.alignment = { horizontal: "center", vertical: "middle" }
      totalLabelCell.border = cellBorder

      const totalValueCell = expensesSheet.getCell(`D${currentRow}`)
      totalValueCell.value = totalExpenses
      totalValueCell.numFmt = '"R$ "#,##0.00'
      totalValueCell.font = { bold: true, size: 11 }
      totalValueCell.alignment = { horizontal: "right", vertical: "middle" }
      totalValueCell.border = cellBorder
      expensesSheet.getRow(currentRow).height = 22
    }

    // Ajustar largura das colunas
    expensesSheet.columns = [{ width: 12 }, { width: 15 }, { width: 45 }, { width: 15 }]

    // ==================== ABA 3: FATURAS DE CARTÃO ====================
    const cardBillsSheet = workbook.addWorksheet("Faturas de Cartão")

    // Linha 1: Título principal (mesclado A1:D1) - Azul
    cardBillsSheet.mergeCells("A1:D1")
    const titleCell3 = cardBillsSheet.getCell("A1")
    titleCell3.value = `RELATÓRIO FINANCEIRO - ${monthYear.toUpperCase()}`
    titleCell3.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
    titleCell3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
    titleCell3.alignment = { horizontal: "center", vertical: "middle" }
    titleCell3.border = cellBorder
    cardBillsSheet.getRow(1).height = 25

    // Linha 3: Cabeçalho da seção FATURAS DE CARTÃO (mesclado A3:D3) - Roxo/Lilás
    cardBillsSheet.mergeCells("A3:D3")
    const faturasHeader = cardBillsSheet.getCell("A3")
    faturasHeader.value = "FATURAS DE CARTÃO"
    faturasHeader.font = { bold: true, size: 11, color: { argb: "FF000000" } }
    faturasHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB4A7D6" } }
    faturasHeader.alignment = { horizontal: "center", vertical: "middle" }
    faturasHeader.border = cellBorder
    cardBillsSheet.getRow(3).height = 22

    // Linha 4: Cabeçalhos das colunas
    const cardHeaders = ["Data", "Cartão", "Pessoa", "Valor"]
    cardBillsSheet.getRow(4).values = cardHeaders
    cardBillsSheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true, size: 10 }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = cellBorder
    })
    cardBillsSheet.getRow(4).height = 20

    // Dados das faturas
    currentRow = 5
    monthCardBills.forEach((bill) => {
      bill.divisions.forEach((division) => {
        const row = cardBillsSheet.getRow(currentRow)
        row.values = [new Date(bill.date + "T00:00:00"), bill.cardName, division.personName, division.amount]

        row.getCell(1).numFmt = "dd/mm/yyyy"
        row.getCell(1).alignment = { horizontal: "center", vertical: "middle" }
        row.getCell(1).border = cellBorder

        row.getCell(2).alignment = { horizontal: "left", vertical: "middle" }
        row.getCell(2).border = cellBorder

        row.getCell(3).alignment = { horizontal: "left", vertical: "middle" }
        row.getCell(3).border = cellBorder

        row.getCell(4).numFmt = '"R$ "#,##0.00'
        row.getCell(4).alignment = { horizontal: "right", vertical: "middle" }
        row.getCell(4).border = cellBorder

        currentRow++
      })
    })

    // Total das faturas
    if (monthCardBills.length > 0) {
      currentRow++
      const totalCardBills = monthCardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      cardBillsSheet.mergeCells(`A${currentRow}:C${currentRow}`)
      const totalLabelCell = cardBillsSheet.getCell(`A${currentRow}`)
      totalLabelCell.value = "TOTAL FATURAS"
      totalLabelCell.font = { bold: true, size: 11 }
      totalLabelCell.alignment = { horizontal: "center", vertical: "middle" }
      totalLabelCell.border = cellBorder

      const totalValueCell = cardBillsSheet.getCell(`D${currentRow}`)
      totalValueCell.value = totalCardBills
      totalValueCell.numFmt = '"R$ "#,##0.00'
      totalValueCell.font = { bold: true, size: 11 }
      totalValueCell.alignment = { horizontal: "right", vertical: "middle" }
      totalValueCell.border = cellBorder
      cardBillsSheet.getRow(currentRow).height = 22
    }

    // Ajustar largura das colunas
    cardBillsSheet.columns = [{ width: 12 }, { width: 20 }, { width: 30 }, { width: 15 }]

    // ==================== ABA 4: RESUMO MENSAL ====================
    const summarySheet = workbook.addWorksheet("Resumo")

    // Linha 1: Título principal (mesclado A1:D1) - Azul
    summarySheet.mergeCells("A1:D1")
    const titleCell4 = summarySheet.getCell("A1")
    titleCell4.value = `RELATÓRIO FINANCEIRO - ${monthYear.toUpperCase()}`
    titleCell4.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
    titleCell4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
    titleCell4.alignment = { horizontal: "center", vertical: "middle" }
    titleCell4.border = cellBorder
    summarySheet.getRow(1).height = 25

    // Linha 3: Cabeçalho da seção RESUMO MENSAL (mesclado A3:D3) - Bege
    summarySheet.mergeCells("A3:D3")
    const resumoHeader = summarySheet.getCell("A3")
    resumoHeader.value = "RESUMO MENSAL"
    resumoHeader.font = { bold: true, size: 11, color: { argb: "FF000000" } }
    resumoHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCD5B4" } }
    resumoHeader.alignment = { horizontal: "center", vertical: "middle" }
    resumoHeader.border = cellBorder
    summarySheet.getRow(3).height = 22

    // Calcular totais
    const totalIncomes = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCardBills = monthCardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const totalOutflow = totalExpenses + totalCardBills
    const balance = totalIncomes - totalOutflow

    // Dados do resumo
    currentRow = 5
    const summaryData = [
      { label: "Total Receitas", value: totalIncomes },
      { label: "Total Despesas", value: totalOutflow },
      { label: "Saldo do Mês", value: balance },
    ]

    summaryData.forEach((item) => {
      const row = summarySheet.getRow(currentRow)
      row.values = [item.label, item.value]

      row.getCell(1).font = { bold: true, size: 11 }
      row.getCell(1).alignment = { horizontal: "left", vertical: "middle" }
      row.getCell(1).border = cellBorder

      row.getCell(2).numFmt = "#,##0.00"
      row.getCell(2).font = { size: 11 }
      row.getCell(2).alignment = { horizontal: "right", vertical: "middle" }
      row.getCell(2).border = cellBorder

      row.height = 22
      currentRow++
    })

    // Ajustar largura das colunas
    summarySheet.columns = [{ width: 25 }, { width: 20 }]

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-financeiro-${currentMonth}.xlsx`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

    const incomesData = incomes
      .filter((income) => income.date.startsWith(currentMonth))
      .map((income) => ({
        Data: income.date,
        Tipo: income.type === "salary" ? "Salário" : "Renda Extra",
        Descrição: income.description,
        Valor: `R$ ${income.amount.toFixed(2).replace(".", ",")}`,
      }))

    const expensesData = expenses
      .filter((expense) => expense.date.startsWith(currentMonth))
      .map((expense) => ({
        Data: expense.date,
        Categoria: expense.category,
        Descrição: expense.description,
        Valor: `R$ ${expense.amount.toFixed(2).replace(".", ",")}`,
      }))

    const cardBillsData = cardBills
      .filter((bill) => bill.date.startsWith(currentMonth))
      .flatMap((bill) =>
        bill.divisions.map((division) => ({
          Data: bill.date,
          Cartão: bill.cardName,
          Pessoa: division.personName,
          Valor: `R$ ${division.amount.toFixed(2).replace(".", ",")}`,
        })),
      )

    let csvContent = `Relatório de Gastos - ${monthName}\n\n`

    if (incomesData.length > 0) {
      csvContent += "RENDAS\n"
      csvContent += "Data,Tipo,Descrição,Valor\n"
      incomesData.forEach((row) => {
        csvContent += `${row.Data},${row.Tipo},${row.Descrição},${row.Valor}\n`
      })
      csvContent += "\n"
    }

    if (expensesData.length > 0) {
      csvContent += "GASTOS GERAIS\n"
      csvContent += "Data,Categoria,Descrição,Valor\n"
      expensesData.forEach((row) => {
        csvContent += `${row.Data},${row.Categoria},${row.Descrição},${row.Valor}\n`
      })
      csvContent += "\n"
    }

    if (cardBillsData.length > 0) {
      csvContent += "FATURAS DE CARTÃO\n"
      csvContent += "Data,Cartão,Pessoa,Valor\n"
      cardBillsData.forEach((row) => {
        csvContent += `${row.Data},${row.Cartão},${row.Pessoa},${row.Valor}\n`
      })
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `gastos-${currentMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToText = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

    let textContent = `RELATÓRIO DE GASTOS - ${monthName.toUpperCase()}\n`
    textContent += "=".repeat(50) + "\n\n"

    const monthIncomes = incomes.filter((income) => income.date.startsWith(currentMonth))
    if (monthIncomes.length > 0) {
      textContent += "RENDAS\n"
      textContent += "-".repeat(20) + "\n"

      const totalIncomes = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
      const salaryTotal = monthIncomes
        .filter((i) => i.type === "salary")
        .reduce((sum, income) => sum + income.amount, 0)
      const extraTotal = monthIncomes.filter((i) => i.type === "extra").reduce((sum, income) => sum + income.amount, 0)

      textContent += `Salário: R$ ${salaryTotal.toFixed(2).replace(".", ",")}\n`
      textContent += `Rendas Extras: R$ ${extraTotal.toFixed(2).replace(".", ",")}\n`
      textContent += `\nTOTAL RENDAS: R$ ${totalIncomes.toFixed(2).replace(".", ",")}\n\n`

      textContent += "Detalhamento:\n"
      monthIncomes.forEach((income) => {
        const type = income.type === "salary" ? "Salário" : "Renda Extra"
        textContent += `• ${income.date} - ${type} - ${income.description}: R$ ${income.amount.toFixed(2).replace(".", ",")}\n`
      })
      textContent += "\n"
    }

    const monthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth))
    if (monthExpenses.length > 0) {
      textContent += "GASTOS GERAIS\n"
      textContent += "-".repeat(20) + "\n"

      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const expensesByCategory = monthExpenses.reduce(
        (acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount
          return acc
        },
        {} as Record<string, number>,
      )

      Object.entries(expensesByCategory).forEach(([category, amount]) => {
        textContent += `${category}: R$ ${amount.toFixed(2).replace(".", ",")}\n`
      })

      textContent += `\nTOTAL GASTOS GERAIS: R$ ${totalExpenses.toFixed(2).replace(".", ",")}\n\n`

      textContent += "Detalhamento:\n"
      monthExpenses.forEach((expense) => {
        textContent += `• ${expense.date} - ${expense.category} - ${expense.description}: R$ ${expense.amount.toFixed(2).replace(".", ",")}\n`
      })
      textContent += "\n"
    }

    const monthCardBills = cardBills.filter((bill) => bill.date.startsWith(currentMonth))
    if (monthCardBills.length > 0) {
      textContent += "FATURAS DE CARTÃO\n"
      textContent += "-".repeat(20) + "\n"

      const totalCardBills = monthCardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
      const expensesByPerson = monthCardBills.reduce(
        (acc, bill) => {
          bill.divisions.forEach((division) => {
            acc[division.personName] = (acc[division.personName] || 0) + division.amount
          })
          return acc
        },
        {} as Record<string, number>,
      )

      Object.entries(expensesByPerson).forEach(([person, amount]) => {
        textContent += `${person}: R$ ${amount.toFixed(2).replace(".", ",")}\n`
      })

      textContent += `\nTOTAL FATURAS: R$ ${totalCardBills.toFixed(2).replace(".", ",")}\n\n`

      textContent += "Detalhamento por Cartão:\n"
      monthCardBills.forEach((bill) => {
        textContent += `• ${bill.date} - ${bill.cardName}: R$ ${bill.totalAmount.toFixed(2).replace(".", ",")}\n`
        bill.divisions.forEach((division) => {
          textContent += `  - ${division.personName}: R$ ${division.amount.toFixed(2).replace(".", ",")}\n`
        })
      })
    }

    const totalIncomes = monthIncomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCardBills = monthCardBills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    const totalOutflow = totalExpenses + totalCardBills
    const balance = totalIncomes - totalOutflow

    textContent += "\n" + "=".repeat(50) + "\n"
    textContent += "RESUMO MENSAL\n"
    textContent += "-".repeat(20) + "\n"
    textContent += `Total Receitas: R$ ${totalIncomes.toFixed(2).replace(".", ",")}\n`
    textContent += `Total Despesas: R$ ${totalOutflow.toFixed(2).replace(".", ",")}\n`
    textContent += `Saldo do Mês: R$ ${balance.toFixed(2).replace(".", ",")}\n`

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio-${currentMonth}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          <Button onClick={exportToExcel} className="w-full gap-2" variant="default">
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx)
          </Button>
          <Button onClick={exportToCSV} className="w-full gap-2 bg-transparent" variant="outline">
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={exportToText} className="w-full gap-2 bg-transparent" variant="outline">
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
