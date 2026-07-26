'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { parseInvoiceFile } from '@/features/invoices/parsers'
import { SupabaseInvoiceRepository } from '@/features/invoices/services/invoice.supabase.repository'
import type { Invoice, InvoiceItem, CreateInvoiceInput, AddInvoiceItemInput } from '@/features/invoices/types'

const invoiceRepository = new SupabaseInvoiceRepository()

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
  const startTime = Date.now()
  
  try {
    // 1️⃣ Autenticação
    const { userId } = await auth()
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Não autenticado. Faça login para continuar.' 
      }
    }
    
    // 2️⃣ Extração e validação de parâmetros
    const file = formData.get('file') as File
    const cardId = formData.get('cardId') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)
    
    // Validação de arquivo
    if (!file) {
      return { 
        success: false, 
        error: 'Nenhum arquivo fornecido. Faça upload de um arquivo PDF, CSV, OFX ou QFX.' 
      }
    }
    
    // Validação de parâmetros obrigatórios
    if (!cardId || !month || !year) {
      return { 
        success: false, 
        error: 'Cartão e competência (mês/ano) são obrigatórios.',
        details: [
          !cardId ? 'Cartão não especificado' : '',
          !month ? 'Mês não especificado' : '',
          !year ? 'Ano não especificado' : '',
        ].filter(Boolean)
      }
    }
    
    // Validação de competência
    if (month < 1 || month > 12) {
      return {
        success: false,
        error: 'Mês inválido. Deve estar entre 1 e 12.'
      }
    }
    
    if (year < 2020 || year > 2100) {
      return {
        success: false,
        error: 'Ano inválido. Deve estar entre 2020 e 2100.'
      }
    }
    
    // 3️⃣ Validação server-side de tipo de arquivo (VULN-07)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const ALLOWED_EXTENSIONS = ['pdf', 'csv', 'ofx', 'qfx']
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        success: false,
        error: `Tipo de arquivo não suportado: .${fileExtension ?? 'desconhecido'}. Use PDF, CSV, OFX ou QFX.`,
      }
    }

    // Validação de UUID do cardId (VULN-08)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_REGEX.test(cardId)) {
      return { success: false, error: 'ID do cartão inválido.' }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[processInvoiceUpload] arquivo=${file.name} ext=${fileExtension} card=${cardId} ${month}/${year}`)
    }

    // 4️⃣ Processamento do arquivo com parser factory
    // O factory irá automaticamente escolher o melhor parser:
    // - PDFs: Tenta OCR primeiro, depois fallback para regex
    // - CSVs: Tenta Nubank/Inter específicos
    // - OFX/QFX: Parser genérico
    const parseResult = await parseInvoiceFile(file)
    
    // 5️⃣ Tratamento de falha no parsing
    if (!parseResult.success) {
      return { 
        success: false, 
        error: 'Não foi possível processar o arquivo',
        details: parseResult.errors 
      }
    }
    
    // 6️⃣ Validação de transações extraídas
    if (!parseResult.transactions || parseResult.transactions.length === 0) {
      return {
        success: false,
        error: 'Nenhuma transação encontrada no arquivo',
        details: [
          'O arquivo pode estar vazio ou em formato não suportado',
          'Verifique se o arquivo é uma fatura válida',
          ...parseResult.errors
        ]
      }
    }
    
    // 7️⃣ Conversão de transações para itens de fatura
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
    
    // 8️⃣ Metadados enriquecidos
    const metadata = {
      ...parseResult.metadata,
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension,
      processedAt: new Date().toISOString(),
      itemCount: items.length,
      cardId,
      month,
      year,
      // Datas extraídas do arquivo (se disponíveis)
      hasExtractedDates: !!(parseResult.metadata?.closingDate && parseResult.metadata?.dueDate),
    }
    
    // 9️⃣ Log de sucesso (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const processingTime = Date.now() - startTime
      console.log(`[processInvoiceUpload] ✅ ${items.length} transações em ${processingTime}ms`)
    }
    
    // 🔟 Retorno estruturado
    return { 
      success: true, 
      data: {
        items,
        metadata,
        // Passa warnings do parser (ex: baixa confiança OCR)
        warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined
      }
    }
    
  } catch (error) {
    // Tratamento de erros inesperados
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

    // Verifica se já existe fatura para este cartão+competência
    const existing = await invoiceRepository.findByCardAndPeriod(
      userId, input.cardId, input.month, input.year
    )
    if (existing) {
      return { success: false, error: 'Já existe uma fatura para este cartão nesta competência' }
    }

    const totalAmount = (input as Invoice).items?.reduce((s, i) => s + i.amount, 0) ?? 0
    const invoiceData: Invoice = {
      ...(input as Invoice),
      id: crypto.randomUUID(),
      userId,
      totalAmount,
      paidAmount: 0,
      isPaid: false,
      items: (input as Invoice).items ?? [],
    }

    const data = await invoiceRepository.create(userId, invoiceData)
    revalidatePath('/invoices')
    return { success: true, data }
  } catch (error) {
    console.error('[createInvoice] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao criar fatura' }
  }
}

export async function getInvoices(filters?: { cardId?: string; month?: number; year?: number }) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    let data = await invoiceRepository.findAll(userId)
    if (filters?.cardId) data = data.filter((inv) => inv.cardId === filters.cardId)
    if (filters?.month) data = data.filter((inv) => inv.month === filters.month)
    if (filters?.year) data = data.filter((inv) => inv.year === filters.year)

    return { success: true, data }
  } catch (error) {
    console.error('[getInvoices] Error:', error)
    return { success: false, error: 'Erro ao buscar faturas' }
  }
}

export async function getInvoice(invoiceId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await invoiceRepository.findById(userId, invoiceId)
    if (!data) return { success: false, error: 'Fatura não encontrada' }
    return { success: true, data }
  } catch (error) {
    console.error('[getInvoice] Error:', error)
    return { success: false, error: 'Erro ao buscar fatura' }
  }
}

export async function addInvoiceItem(input: AddInvoiceItemInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const invoice = await invoiceRepository.findById(userId, input.invoiceId)
    if (!invoice) return { success: false, error: 'Fatura não encontrada' }

    const newItem: InvoiceItem = {
      ...input.item,
      id: crypto.randomUUID(),
      invoiceId: input.invoiceId,
      createdAt: new Date(),
    }
    const updatedItems = [...invoice.items, newItem]
    const totalAmount = updatedItems.reduce((s, i) => s + i.amount, 0)

    await invoiceRepository.update(userId, input.invoiceId, {
      items: updatedItems,
      totalAmount,
    })

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

    const invoice = await invoiceRepository.findById(userId, invoiceId)
    if (!invoice) return { success: false, error: 'Fatura não encontrada' }

    const updatedItems = invoice.items.filter((i) => i.id !== itemId)
    const totalAmount = updatedItems.reduce((s, i) => s + i.amount, 0)

    await invoiceRepository.update(userId, invoiceId, { items: updatedItems, totalAmount })

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

    // Busca a fatura para obter o totalAmount (VULN-05: fix isPaid logic)
    const existing = await invoiceRepository.findById(userId, invoiceId)
    if (!existing) {
      return { success: false, error: 'Fatura não encontrada' }
    }

    if (paidAmount < 0) {
      return { success: false, error: 'Valor pago não pode ser negativo' }
    }

    if (paidAmount > existing.totalAmount) {
      return { success: false, error: 'Valor pago não pode exceder o valor total da fatura' }
    }
    
    const invoice = await invoiceRepository.update(userId, invoiceId, {
      paidAmount,
      isPaid: paidAmount >= existing.totalAmount,
      updatedAt: new Date()
    })
    
    if (!invoice) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
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

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Não autenticado' }

    const data = await invoiceRepository.update(userId, invoiceId, updates)
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
    
    const deleted = await invoiceRepository.delete(userId, invoiceId)
    
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

