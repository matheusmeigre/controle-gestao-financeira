import type { Expense, CardBill, Income } from '@/types/expense'
import ExcelJS from 'exceljs'

type ExportData = {
  expenses: Expense[]
  cardBills: CardBill[]
  incomes: Income[]
}

function getMonthData(data: ExportData) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const monthYear = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return {
    currentMonth,
    monthName,
    monthYear,
    monthExpenses: data.expenses.filter((e) => e.date.startsWith(currentMonth)),
    monthCardBills: data.cardBills.filter((b) => b.date.startsWith(currentMonth)),
    monthIncomes: data.incomes.filter((i) => i.date.startsWith(currentMonth)),
  }
}

const cellBorder = {
  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
  left: { style: 'thin' as const, color: { argb: 'FF000000' } },
  bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
  right: { style: 'thin' as const, color: { argb: 'FF000000' } },
}

function addTitleRow(sheet: ExcelJS.Worksheet, text: string) {
  sheet.mergeCells('A1:D1')
  const cell = sheet.getCell('A1')
  cell.value = text
  cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = cellBorder
  sheet.getRow(1).height = 25
}

function addSectionHeader(sheet: ExcelJS.Worksheet, row: number, text: string, color: string) {
  sheet.mergeCells(`A${row}:D${row}`)
  const cell = sheet.getCell(`A${row}`)
  cell.value = text
  cell.font = { bold: true, size: 11, color: { argb: 'FF000000' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
  cell.border = cellBorder
  sheet.getRow(row).height = 22
}

function addColumnHeaders(sheet: ExcelJS.Worksheet, row: number, headers: string[]) {
  sheet.getRow(row).values = headers
  sheet.getRow(row).eachCell((cell) => {
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = cellBorder
  })
  sheet.getRow(row).height = 20
}

function addTotalRow(sheet: ExcelJS.Worksheet, row: number, label: string, value: number) {
  sheet.mergeCells(`A${row}:C${row}`)
  const labelCell = sheet.getCell(`A${row}`)
  labelCell.value = label
  labelCell.font = { bold: true, size: 11 }
  labelCell.alignment = { horizontal: 'center', vertical: 'middle' }
  labelCell.border = cellBorder

  const valueCell = sheet.getCell(`D${row}`)
  valueCell.value = value
  valueCell.numFmt = '"R$ "#,##0.00'
  valueCell.font = { bold: true, size: 11 }
  valueCell.alignment = { horizontal: 'right', vertical: 'middle' }
  valueCell.border = cellBorder
  sheet.getRow(row).height = 22
}

async function buildExcelWorkbook(data: ExportData) {
  const { currentMonth, monthYear, monthExpenses, monthCardBills, monthIncomes } = getMonthData(data)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Minha Gestão Financeira'
  workbook.created = new Date()
  const title = `RELATÓRIO FINANCEIRO - ${monthYear.toUpperCase()}`

  const incomesSheet = workbook.addWorksheet('Rendas')
  addTitleRow(incomesSheet, title)
  addSectionHeader(incomesSheet, 3, 'RENDAS', 'FF92D050')
  addColumnHeaders(incomesSheet, 4, ['Data', 'Tipo', 'Descrição', 'Valor'])
  let row = 5
  monthIncomes.forEach((income) => {
    const r = incomesSheet.getRow(row)
    r.values = [new Date(income.date + 'T00:00:00'), income.type === 'salary' ? 'Salário' : 'Renda Extra', income.description, income.amount]
    r.getCell(1).numFmt = 'dd/mm/yyyy'
    ;[1, 2, 3, 4].forEach((c) => {
      r.getCell(c).alignment = { horizontal: c === 4 ? 'right' : c === 1 ? 'center' : 'left', vertical: 'middle' }
      r.getCell(c).border = cellBorder
    })
    r.getCell(4).numFmt = '"R$ "#,##0.00'
    row++
  })
  if (monthIncomes.length > 0) {
    row++
    addTotalRow(incomesSheet, row, 'TOTAL RENDAS', monthIncomes.reduce((s, i) => s + i.amount, 0))
  }
  incomesSheet.columns = [{ width: 12 }, { width: 15 }, { width: 45 }, { width: 15 }]

  const expensesSheet = workbook.addWorksheet('Gastos Gerais')
  addTitleRow(expensesSheet, title)
  addSectionHeader(expensesSheet, 3, 'GASTOS GERAIS', 'FFFFFF00')
  addColumnHeaders(expensesSheet, 4, ['Data', 'Categoria', 'Descrição', 'Valor'])
  row = 5
  monthExpenses.forEach((expense) => {
    const r = expensesSheet.getRow(row)
    r.values = [new Date(expense.date + 'T00:00:00'), expense.category, expense.description, expense.amount]
    r.getCell(1).numFmt = 'dd/mm/yyyy'
    ;[1, 2, 3, 4].forEach((c) => {
      r.getCell(c).alignment = { horizontal: c === 4 ? 'right' : c === 1 ? 'center' : 'left', vertical: 'middle' }
      r.getCell(c).border = cellBorder
    })
    r.getCell(4).numFmt = '"R$ "#,##0.00'
    row++
  })
  if (monthExpenses.length > 0) {
    row++
    addTotalRow(expensesSheet, row, 'TOTAL GASTOS GERAIS', monthExpenses.reduce((s, e) => s + e.amount, 0))
  }
  expensesSheet.columns = [{ width: 12 }, { width: 15 }, { width: 45 }, { width: 15 }]

  const cardSheet = workbook.addWorksheet('Faturas de Cartão')
  addTitleRow(cardSheet, title)
  addSectionHeader(cardSheet, 3, 'FATURAS DE CARTÃO', 'FFB4A7D6')
  addColumnHeaders(cardSheet, 4, ['Data', 'Cartão', 'Pessoa', 'Valor'])
  row = 5
  monthCardBills.forEach((bill) => {
    bill.divisions.forEach((division) => {
      const r = cardSheet.getRow(row)
      r.values = [new Date(bill.date + 'T00:00:00'), bill.cardName, division.personName, division.amount]
      r.getCell(1).numFmt = 'dd/mm/yyyy'
      ;[1, 2, 3, 4].forEach((c) => {
        r.getCell(c).alignment = { horizontal: c === 4 ? 'right' : c === 1 ? 'center' : 'left', vertical: 'middle' }
        r.getCell(c).border = cellBorder
      })
      r.getCell(4).numFmt = '"R$ "#,##0.00'
      row++
    })
  })
  if (monthCardBills.length > 0) {
    row++
    addTotalRow(cardSheet, row, 'TOTAL FATURAS', monthCardBills.reduce((s, b) => s + b.totalAmount, 0))
  }
  cardSheet.columns = [{ width: 12 }, { width: 20 }, { width: 30 }, { width: 15 }]

  const summarySheet = workbook.addWorksheet('Resumo')
  addTitleRow(summarySheet, title)
  addSectionHeader(summarySheet, 3, 'RESUMO MENSAL', 'FFFCD5B4')
  const totalIncomes = monthIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalCardBills = monthCardBills.reduce((s, b) => s + b.totalAmount, 0)
  const totalOutflow = totalExpenses + totalCardBills
  const balance = totalIncomes - totalOutflow
  row = 5
  ;[
    { label: 'Total Receitas', value: totalIncomes },
    { label: 'Total Despesas', value: totalOutflow },
    { label: 'Saldo do Mês', value: balance },
  ].forEach((item) => {
    const r = summarySheet.getRow(row)
    r.values = [item.label, item.value]
    r.getCell(1).font = { bold: true, size: 11 }
    r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
    r.getCell(1).border = cellBorder
    r.getCell(2).numFmt = '#,##0.00'
    r.getCell(2).font = { size: 11 }
    r.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' }
    r.getCell(2).border = cellBorder
    r.height = 22
    row++
  })
  summarySheet.columns = [{ width: 25 }, { width: 20 }]

  return workbook
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToExcel(data: ExportData) {
  const workbook = await buildExcelWorkbook(data)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `relatorio-financeiro-${currentMonth}.xlsx`)
}

export function exportToCSV(data: ExportData) {
  const { currentMonth, monthName, monthExpenses, monthCardBills, monthIncomes } = getMonthData(data)

  const incomesData = monthIncomes.map((income) => ({
    Data: income.date,
    Tipo: income.type === 'salary' ? 'Salário' : 'Renda Extra',
    Descrição: income.description,
    Valor: `R$ ${income.amount.toFixed(2).replace('.', ',')}`,
  }))

  const expensesData = monthExpenses.map((expense) => ({
    Data: expense.date,
    Categoria: expense.category,
    Descrição: expense.description,
    Valor: `R$ ${expense.amount.toFixed(2).replace('.', ',')}`,
  }))

  const cardBillsData = monthCardBills.flatMap((bill) =>
    bill.divisions.map((division) => ({
      Data: bill.date,
      Cartão: bill.cardName,
      Pessoa: division.personName,
      Valor: `R$ ${division.amount.toFixed(2).replace('.', ',')}`,
    }))
  )

  let csv = `Relatório de Gastos - ${monthName}\n\n`
  if (incomesData.length > 0) {
    csv += 'RENDAS\nData,Tipo,Descrição,Valor\n'
    incomesData.forEach((r) => { csv += `${r.Data},${r.Tipo},${r.Descrição},${r.Valor}\n` })
    csv += '\n'
  }
  if (expensesData.length > 0) {
    csv += 'GASTOS GERAIS\nData,Categoria,Descrição,Valor\n'
    expensesData.forEach((r) => { csv += `${r.Data},${r.Categoria},${r.Descrição},${r.Valor}\n` })
    csv += '\n'
  }
  if (cardBillsData.length > 0) {
    csv += 'FATURAS DE CARTÃO\nData,Cartão,Pessoa,Valor\n'
    cardBillsData.forEach((r) => { csv += `${r.Data},${r.Cartão},${r.Pessoa},${r.Valor}\n` })
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `gastos-${currentMonth}.csv`)
}

export function exportToText(data: ExportData) {
  const { currentMonth, monthName, monthExpenses, monthCardBills, monthIncomes } = getMonthData(data)
  let text = `RELATÓRIO DE GASTOS - ${monthName.toUpperCase()}\n${'='.repeat(50)}\n\n`

  if (monthIncomes.length > 0) {
    const total = monthIncomes.reduce((s, i) => s + i.amount, 0)
    const salary = monthIncomes.filter((i) => i.type === 'salary').reduce((s, i) => s + i.amount, 0)
    const extra = monthIncomes.filter((i) => i.type === 'extra').reduce((s, i) => s + i.amount, 0)
    text += `RENDAS\n${'-'.repeat(20)}\nSalário: R$ ${salary.toFixed(2).replace('.', ',')}\nRendas Extras: R$ ${extra.toFixed(2).replace('.', ',')}\n\nTOTAL RENDAS: R$ ${total.toFixed(2).replace('.', ',')}\n\nDetalhamento:\n`
    monthIncomes.forEach((i) => {
      text += `• ${i.date} - ${i.type === 'salary' ? 'Salário' : 'Renda Extra'} - ${i.description}: R$ ${i.amount.toFixed(2).replace('.', ',')}\n`
    })
    text += '\n'
  }

  if (monthExpenses.length > 0) {
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0)
    const byCategory = monthExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
    text += `GASTOS GERAIS\n${'-'.repeat(20)}\n`
    Object.entries(byCategory).forEach(([cat, amt]) => { text += `${cat}: R$ ${amt.toFixed(2).replace('.', ',')}\n` })
    text += `\nTOTAL GASTOS GERAIS: R$ ${total.toFixed(2).replace('.', ',')}\n\nDetalhamento:\n`
    monthExpenses.forEach((e) => {
      text += `• ${e.date} - ${e.category} - ${e.description}: R$ ${e.amount.toFixed(2).replace('.', ',')}\n`
    })
    text += '\n'
  }

  if (monthCardBills.length > 0) {
    const total = monthCardBills.reduce((s, b) => s + b.totalAmount, 0)
    const byPerson = monthCardBills.reduce((acc, b) => { b.divisions.forEach((d) => { acc[d.personName] = (acc[d.personName] || 0) + d.amount }); return acc }, {} as Record<string, number>)
    text += `FATURAS DE CARTÃO\n${'-'.repeat(20)}\n`
    Object.entries(byPerson).forEach(([p, a]) => { text += `${p}: R$ ${a.toFixed(2).replace('.', ',')}\n` })
    text += `\nTOTAL FATURAS: R$ ${total.toFixed(2).replace('.', ',')}\n\nDetalhamento por Cartão:\n`
    monthCardBills.forEach((b) => {
      text += `• ${b.date} - ${b.cardName}: R$ ${b.totalAmount.toFixed(2).replace('.', ',')}\n`
      b.divisions.forEach((d) => { text += `  - ${d.personName}: R$ ${d.amount.toFixed(2).replace('.', ',')}\n` })
    })
  }

  const totalIncomes = monthIncomes.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalCardBills = monthCardBills.reduce((s, b) => s + b.totalAmount, 0)
  const balance = totalIncomes - (totalExpenses + totalCardBills)
  text += `\n${'='.repeat(50)}\nRESUMO MENSAL\n${'-'.repeat(20)}\nTotal Receitas: R$ ${totalIncomes.toFixed(2).replace('.', ',')}\nTotal Despesas: R$ ${(totalExpenses + totalCardBills).toFixed(2).replace('.', ',')}\nSaldo do Mês: R$ ${balance.toFixed(2).replace('.', ',')}\n`

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
  downloadBlob(blob, `relatorio-${currentMonth}.txt`)
}
