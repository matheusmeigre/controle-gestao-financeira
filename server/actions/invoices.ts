'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { parseInvoiceFile } from '@/lib/parsers'
import type { Invoice, InvoiceItem, CreateInvoiceInput, AddInvoiceItemInput } from '@/types/invoice'

/**
 * Server Actions para gerenciamento de faturas
 * 
 * Funcionalidades:
 * - Upload e parse automático de faturas
 * - CRUD de faturas
 * - Gestão de itens da fatura
 * - Validação de duplicatas (idempotência)
 */

// Mock database
let invoices: Invoice[] = []

export async function processInvoiceUpload(formData: FormData) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const file = formData.get('file') as File
    const cardId = formData.get('cardId') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)
    
    if (!file) {
      return { success: false, error: 'Nenhum arquivo fornecido' }
    }
    
    if (!cardId || !month || !year) {
      return { 
        success: false, 
        error: 'Cartão e competência são obrigatórios' 
      }
    }
    
    // Parse do arquivo
    console.log(`[processInvoiceUpload] Processando arquivo: ${file.name}`)
    const parseResult = await parseInvoiceFile(file)
    
    if (!parseResult.success) {
      return { 
        success: false, 
        error: 'Erro ao processar arquivo',
        details: parseResult.errors 
      }
    }
    
    // Converte transações parseadas para itens de fatura
    const items: InvoiceItem[] = parseResult.transactions.map(t => ({
      id: crypto.randomUUID(),
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category || 'Outros',
      installment: t.installment,
      notes: t.rawData ? JSON.stringify(t.rawData) : undefined,
      createdAt: new Date(),
    }))
    
    return { 
      success: true, 
      data: {
        items,
        metadata: parseResult.metadata,
        warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined
      }
    }
  } catch (error) {
    console.error('[processInvoiceUpload] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao processar arquivo de fatura' 
    }
  }
}

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    // Verifica se já existe fatura para este cartão/competência
    const existing = invoices.find(
      inv => inv.userId === userId &&
      inv.cardId === input.cardId &&
      inv.month === input.month &&
      inv.year === input.year
    )
    
    if (existing) {
      return { 
        success: false, 
        error: 'Já existe uma fatura para este cartão nesta competência' 
      }
    }
    
    // Calcula total dos itens
    const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0)
    
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      userId,
      ...input,
      totalAmount,
      paidAmount: 0,
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    invoices.push(newInvoice)
    
    revalidatePath('/invoices')
    
    return { success: true, data: newInvoice }
  } catch (error) {
    console.error('[createInvoice] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao criar fatura' 
    }
  }
}

export async function getInvoices(filters?: {
  cardId?: string
  month?: number
  year?: number
}) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    let userInvoices = invoices.filter(inv => inv.userId === userId)
    
    // Aplica filtros
    if (filters?.cardId) {
      userInvoices = userInvoices.filter(inv => inv.cardId === filters.cardId)
    }
    if (filters?.month) {
      userInvoices = userInvoices.filter(inv => inv.month === filters.month)
    }
    if (filters?.year) {
      userInvoices = userInvoices.filter(inv => inv.year === filters.year)
    }
    
    // Ordena por data (mais recente primeiro)
    userInvoices.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    
    return { success: true, data: userInvoices }
  } catch (error) {
    console.error('[getInvoices] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar faturas' 
    }
  }
}

export async function getInvoice(invoiceId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const invoice = invoices.find(
      inv => inv.id === invoiceId && inv.userId === userId
    )
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    return { success: true, data: invoice }
  } catch (error) {
    console.error('[getInvoice] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao buscar fatura' 
    }
  }
}

export async function addInvoiceItem(input: AddInvoiceItemInput) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const invoice = invoices.find(
      inv => inv.id === input.invoiceId && inv.userId === userId
    )
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    // Validação de duplicata (idempotência)
    const isDuplicate = invoice.items.some(
      item => 
        item.date.getTime() === input.item.date.getTime() &&
        item.description === input.item.description &&
        item.amount === input.item.amount
    )
    
    if (isDuplicate) {
      return { 
        success: false, 
        error: 'Item duplicado. Esta transação já existe na fatura.' 
      }
    }
    
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      invoiceId: input.invoiceId,
      ...input.item,
      createdAt: new Date(),
    }
    
    invoice.items.push(newItem)
    invoice.totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    invoice.updatedAt = new Date()
    
    revalidatePath(`/invoices/${input.invoiceId}`)
    
    return { success: true, data: newItem }
  } catch (error) {
    console.error('[addInvoiceItem] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao adicionar item à fatura' 
    }
  }
}

export async function removeInvoiceItem(invoiceId: string, itemId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const invoice = invoices.find(
      inv => inv.id === invoiceId && inv.userId === userId
    )
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    const itemIndex = invoice.items.findIndex(item => item.id === itemId)
    
    if (itemIndex === -1) {
      return { success: false, error: 'Item não encontrado' }
    }
    
    invoice.items.splice(itemIndex, 1)
    invoice.totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    invoice.updatedAt = new Date()
    
    revalidatePath(`/invoices/${invoiceId}`)
    
    return { success: true }
  } catch (error) {
    console.error('[removeInvoiceItem] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao remover item da fatura' 
    }
  }
}

export async function markInvoiceAsPaid(invoiceId: string, paidAmount: number) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const invoice = invoices.find(
      inv => inv.id === invoiceId && inv.userId === userId
    )
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    invoice.paidAmount = paidAmount
    invoice.isPaid = paidAmount >= invoice.totalAmount
    invoice.updatedAt = new Date()
    
    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath('/invoices')
    
    return { success: true, data: invoice }
  } catch (error) {
    console.error('[markInvoiceAsPaid] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao marcar fatura como paga' 
    }
  }
}
