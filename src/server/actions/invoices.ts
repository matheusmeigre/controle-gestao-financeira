'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import type { Invoice, CreateInvoiceInput, AddInvoiceItemInput } from '@/features/invoices/types'
import {
  createInvoice as createApiInvoice,
  deleteInvoice as deleteApiInvoice,
  getInvoice as getApiInvoice,
  listInvoices as listApiInvoices,
  payInvoice as payApiInvoice,
} from '@/application/api-v1/invoices'
import {
  addInvoiceItemApplication,
  processInvoiceUploadApplication,
  removeInvoiceItemApplication,
  updateInvoiceApplication,
} from '@/application/invoices'

function toLegacyInvoice(
  userId: string,
  invoice: Awaited<ReturnType<typeof getApiInvoice>> extends infer T ? Exclude<T, null> : never
): Invoice {
  return {
    id: invoice.id,
    userId,
    cardId: invoice.cardId,
    month: invoice.month,
    year: invoice.year,
    closingDate: new Date(`${invoice.closingDate}T00:00:00.000Z`),
    dueDate: new Date(`${invoice.dueDate}T00:00:00.000Z`),
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    isPaid: invoice.isPaid,
    items: invoice.items.map((item) => ({
      id: item.id,
      invoiceId: invoice.id,
      date: new Date(`${item.date}T00:00:00.000Z`),
      description: item.description,
      amount: item.amount,
      category: item.category,
      installment: item.installment,
      notes: item.notes,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    })),
    createdAt: invoice.createdAt ? new Date(invoice.createdAt) : undefined,
    updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt) : undefined,
  }
}

/**
 * ====================================
 * 📤 Server Action: Upload e Processamento de Faturas
 * ====================================
 * 
 * Esta função processa uploads de arquivos de fatura (PDF, CSV, OFX, QFX)
 * e os converte em transações estruturadas.
 * 
 * Estratégia de parsing:
 * 1. PDFs → Prioriza OCR com IA (alta precisão)
 * 2. CSVs → Parsers específicos (Nubank, Inter)
 * 3. OFX/QFX → Parser genérico
 * 
 * Funcionalidades:
 * - ✅ Validação de autenticação
 * - ✅ Validação de arquivo e parâmetros
 * - ✅ Detecção automática de formato
 * - ✅ Processamento com parsers especializados
 * - ✅ OCR inteligente para PDFs (via API externa)
 * - ✅ Categorização automática de transações
 * - ✅ Normalização de dados financeiros
 * - ✅ Tratamento robusto de erros
 * - ✅ Warnings para baixa confiança OCR
 * 
 * @param formData - FormData contendo:
 *   - file: Arquivo da fatura (PDF, CSV, OFX, QFX)
 *   - cardId: ID do cartão (UUID)
 *   - month: Mês da competência (1-12)
 *   - year: Ano da competência
 * 
 * @returns Resultado do processamento com transações ou erro
 */
export async function processInvoiceUpload(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { 
        success: false, 
        error: 'Não autenticado. Faça login para continuar.' 
      }
    }
    return processInvoiceUploadApplication(formData)
  } catch (error) {
    console.error('[processInvoiceUpload] 💥 Erro inesperado:', error)
    
    return { 
      success: false, 
      error: 'Erro inesperado ao processar arquivo de fatura',
      details: [
        error instanceof Error ? error.message : String(error),
        'Entre em contato com o suporte se o problema persistir'
      ]
    }
  }
}

export async function createInvoice(input: CreateInvoiceInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await createApiInvoice(userId, {
      cardId: input.cardId,
      month: input.month,
      year: input.year,
      closingDate: input.closingDate.toISOString().slice(0, 10),
      dueDate: input.dueDate.toISOString().slice(0, 10),
      items: (input.items ?? []).map((item) => ({
        date: item.date.toISOString().slice(0, 10),
        description: item.description,
        amount: item.amount,
        category: item.category,
        installment: item.installment,
        notes: item.notes,
      })),
    })
    revalidatePath('/invoices')
    return { success: true, data: toLegacyInvoice(userId, data) }
  } catch (error) {
    console.error('[createInvoice] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar fatura' }
  }
}

export async function getInvoices(filters?: { cardId?: string; month?: number; year?: number }) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await listApiInvoices(userId, filters)

    return { success: true, data: data.map((invoice) => toLegacyInvoice(userId, invoice)) }
  } catch (error) {
    console.error('[getInvoices] Error:', error)
    return { success: false, error: 'Erro ao buscar faturas' }
  }
}

export async function getInvoice(invoiceId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await getApiInvoice(userId, invoiceId)
    if (!data) return { success: false, error: 'Fatura não encontrada' }
    return { success: true, data: toLegacyInvoice(userId, data) }
  } catch (error) {
    console.error('[getInvoice] Error:', error)
    return { success: false, error: 'Erro ao buscar fatura' }
  }
}

export async function addInvoiceItem(input: AddInvoiceItemInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const newItem = await addInvoiceItemApplication(userId, input)
    if (!newItem) return { success: false, error: 'Fatura não encontrada' }

    revalidatePath(`/invoices/${input.invoiceId}`)
    return { success: true, data: newItem }
  } catch (error) {
    console.error('[addInvoiceItem] Error:', error)
    return { success: false, error: 'Erro ao adicionar item à fatura' }
  }
}

export async function removeInvoiceItem(invoiceId: string, itemId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const removed = await removeInvoiceItemApplication(userId, invoiceId, itemId)
    if (!removed) return { success: false, error: 'Fatura ou item não encontrado' }

    revalidatePath(`/invoices/${invoiceId}`)
    return { success: true }
  } catch (error) {
    console.error('[removeInvoiceItem] Error:', error)
    return { success: false, error: 'Erro ao remover item da fatura' }
  }
}

export async function markInvoiceAsPaid(invoiceId: string, paidAmount: number) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }

    const invoice = await payApiInvoice(userId, invoiceId, { paidAmount })
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath('/invoices')
    
    return { success: true, data: toLegacyInvoice(userId, invoice) }
  } catch (error) {
    console.error('[markInvoiceAsPaid] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao marcar fatura como paga' 
    }
  }
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await updateInvoiceApplication(userId, invoiceId, updates)
    if (!data) return { success: false, error: 'Fatura não encontrada' }

    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath('/invoices')
    return { success: true, data }
  } catch (error) {
    console.error('[updateInvoice] Error:', error)
    return { success: false, error: 'Erro ao atualizar fatura' }
  }
}

/**
 * Deleta uma fatura permanentemente
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    const deleted = await deleteApiInvoice(userId, invoiceId)
    
    if (!deleted) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    console.error('[deleteInvoice] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao excluir fatura' 
    }
  }
}

