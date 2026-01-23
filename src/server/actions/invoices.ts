'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { parseInvoiceFile } from '@/features/invoices/parsers'
import { InvoiceService } from '@/features/invoices'
import { InvoiceRepository } from '@/features/invoices/services/invoice.repository'
import type { Invoice, InvoiceItem, CreateInvoiceInput, AddInvoiceItemInput } from '@/features/invoices/types'

/**
 * Server Actions para gerenciamento de faturas
 * Refatorado para usar InvoiceService da feature
 */

const invoiceService = new InvoiceService()
const invoiceRepository = new InvoiceRepository()

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
    
    // 3️⃣ Log de processamento
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    console.log('='.repeat(60))
    console.log(`[processInvoiceUpload] 📄 Novo upload`)
    console.log(`├─ Arquivo: ${file.name}`)
    console.log(`├─ Tipo: ${file.type}`)
    console.log(`├─ Extensão: .${fileExtension}`)
    console.log(`├─ Tamanho: ${(file.size / 1024).toFixed(2)} KB`)
    console.log(`├─ Cartão: ${cardId}`)
    console.log(`└─ Competência: ${month.toString().padStart(2, '0')}/${year}`)
    console.log('='.repeat(60))
    
    // 4️⃣ Processamento do arquivo com parser factory
    // O factory irá automaticamente escolher o melhor parser:
    // - PDFs: Tenta OCR primeiro, depois fallback para regex
    // - CSVs: Tenta Nubank/Inter específicos
    // - OFX/QFX: Parser genérico
    const parseResult = await parseInvoiceFile(file)
    
    // 5️⃣ Tratamento de falha no parsing
    if (!parseResult.success) {
      console.log(`[processInvoiceUpload] ❌ Falha no parsing`)
      console.log(`└─ Erros:`, parseResult.errors)
      
      return { 
        success: false, 
        error: 'Não foi possível processar o arquivo',
        details: parseResult.errors 
      }
    }
    
    // 6️⃣ Validação de transações extraídas
    if (!parseResult.transactions || parseResult.transactions.length === 0) {
      console.log(`[processInvoiceUpload] ⚠️ Nenhuma transação encontrada`)
      
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
    
    // 9️⃣ Log de sucesso
    const processingTime = Date.now() - startTime
    console.log(`[processInvoiceUpload] ✅ Sucesso!`)
    console.log(`├─ Transações: ${items.length}`)
    console.log(`├─ Total: R$ ${metadata.totalAmount?.toFixed(2) || '0.00'}`)
    console.log(`├─ Banco: ${metadata.bankName || 'N/A'}`)
    console.log(`├─ Data Fechamento: ${parseResult.metadata?.closingDate || 'não extraída'}`)
    console.log(`├─ Data Vencimento: ${parseResult.metadata?.dueDate || 'não extraída'}`)
    console.log(`└─ Tempo: ${processingTime}ms`)
    console.log('='.repeat(60))
    
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
    
    if (!userId) {
      return { success: false, error: 'Não autenticado' }
    }
    
    // Usa o InvoiceService para criar a fatura
    const result = await invoiceService.createInvoice(userId, input)
    
    revalidatePath('/invoices')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('[createInvoice] Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar fatura'
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
    
    // Usa InvoiceRepository para buscar faturas
    let userInvoices = await invoiceRepository.findAll(userId)
    
    // Aplica filtros
    if (filters?.cardId) {
      userInvoices = userInvoices.filter((inv: Invoice) => inv.cardId === filters.cardId)
    }
    if (filters?.month) {
      userInvoices = userInvoices.filter((inv: Invoice) => inv.month === filters.month)
    }
    if (filters?.year) {
      userInvoices = userInvoices.filter((inv: Invoice) => inv.year === filters.year)
    }
    
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
    
    const invoice = await invoiceRepository.findById(userId, invoiceId)
    
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
    
    // Usa InvoiceService para adicionar item
    const result = await invoiceService.addInvoiceItem(userId, input)
    
    revalidatePath(`/invoices/${input.invoiceId}`)
    
    return { success: true, data: result }
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
    
    // Usa InvoiceService para remover item
    await invoiceService.removeInvoiceItem(userId, invoiceId, itemId)
    
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
    
    // Usa InvoiceRepository para atualizar pagamento
    const invoice = await invoiceRepository.update(userId, invoiceId, {
      paidAmount,
      isPaid: paidAmount >= 0,
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

/**
 * Deleta uma fatura permanentemente
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    console.log('[deleteInvoice] Iniciando exclusão:', invoiceId)
    
    const { userId } = await auth()
    
    if (!userId) {
      console.log('[deleteInvoice] Usuário não autenticado')
      return { success: false, error: 'Não autenticado' }
    }
    
    console.log('[deleteInvoice] UserId:', userId)
    
    // Usa InvoiceService para deletar
    const deleted = await invoiceService.deleteInvoice(userId, invoiceId)
    
    console.log('[deleteInvoice] Resultado da exclusão:', deleted)
    
    if (!deleted) {
      return { success: false, error: 'Fatura não encontrada' }
    }
    
    revalidatePath('/invoices')
    
    console.log('[deleteInvoice] Fatura excluída com sucesso')
    return { success: true }
  } catch (error) {
    console.error('[deleteInvoice] Error:', error)
    return { 
      success: false, 
      error: 'Erro ao excluir fatura' 
    }
  }
}

