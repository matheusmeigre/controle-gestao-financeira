import { InvoiceRepository } from './invoice.repository'
import type { 
  Invoice, 
  InvoiceItem,
  CreateInvoiceInput, 
  UpdateInvoiceInput,
  AddInvoiceItemInput 
} from '../types'

/**
 * Service para gerenciar faturas (Invoices)
 */
export class InvoiceService {
  private repository = new InvoiceRepository()

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Cria uma nova fatura
   */
  async createInvoice(userId: string, data: CreateInvoiceInput): Promise<Invoice> {
    // Validações
    if (data.month < 1 || data.month > 12) {
      throw new Error('Mês inválido (1-12)')
    }

    if (data.year < 2020 || data.year > 2100) {
      throw new Error('Ano inválido')
    }

    // Verifica se já existe fatura para este cartão neste período
    const existing = await this.repository.findByCardAndPeriod(
      userId, 
      data.cardId, 
      data.month, 
      data.year
    )

    if (existing) {
      throw new Error('Já existe uma fatura para este cartão neste período')
    }

    const invoice: Invoice = {
      id: this.generateId(),
      userId,
      cardId: data.cardId,
      month: data.month,
      year: data.year,
      closingDate: data.closingDate,
      dueDate: data.dueDate,
      totalAmount: 0,
      paidAmount: 0,
      isPaid: false,
      items: data.items || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Calcula total baseado nos itens
    invoice.totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0)

    return await this.repository.create(userId, invoice)
  }

  /**
   * Atualiza uma fatura
   */
  async updateInvoice(userId: string, input: UpdateInvoiceInput): Promise<Invoice | null> {
    const { id, ...updates } = input

    const updated = {
      ...updates,
      updatedAt: new Date()
    }

    // Se os itens foram atualizados, recalcula o total
    if (updates.items) {
      updated.totalAmount = updates.items.reduce((sum, item) => sum + item.amount, 0)
    }

    return await this.repository.update(userId, id, updated)
  }

  /**
   * Adiciona um item à fatura
   */
  async addInvoiceItem(userId: string, input: AddInvoiceItemInput): Promise<Invoice | null> {
    const invoice = await this.repository.findById(userId, input.invoiceId)
    
    if (!invoice) {
      throw new Error('Fatura não encontrada')
    }

    const newItem: InvoiceItem = {
      id: this.generateId(),
      invoiceId: input.invoiceId,
      ...input.item,
      createdAt: new Date()
    }

    const updatedItems = [...invoice.items, newItem]
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0)

    return await this.repository.update(userId, input.invoiceId, {
      items: updatedItems,
      totalAmount,
      updatedAt: new Date()
    })
  }

  /**
   * Remove um item da fatura
   */
  async removeInvoiceItem(userId: string, invoiceId: string, itemId: string): Promise<Invoice | null> {
    const invoice = await this.repository.findById(userId, invoiceId)
    
    if (!invoice) {
      throw new Error('Fatura não encontrada')
    }

    const updatedItems = invoice.items.filter(item => item.id !== itemId)
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0)

    return await this.repository.update(userId, invoiceId, {
      items: updatedItems,
      totalAmount,
      updatedAt: new Date()
    })
  }

  /**
   * Marca fatura como paga
   */
  async markAsPaid(userId: string, invoiceId: string, paidAmount?: number): Promise<Invoice | null> {
    const invoice = await this.repository.findById(userId, invoiceId)
    
    if (!invoice) {
      throw new Error('Fatura não encontrada')
    }

    return await this.repository.update(userId, invoiceId, {
      isPaid: true,
      paidAmount: paidAmount !== undefined ? paidAmount : invoice.totalAmount,
      updatedAt: new Date()
    })
  }

  /**
   * Busca todas as faturas
   */
  async getAllInvoices(userId: string): Promise<Invoice[]> {
    return await this.repository.findAll(userId)
  }

  /**
   * Busca faturas por cartão
   */
  async getInvoicesByCard(userId: string, cardId: string): Promise<Invoice[]> {
    return await this.repository.findByCard(userId, cardId)
  }

  /**
   * Busca fatura específica
   */
  async getInvoiceByCardAndPeriod(
    userId: string, 
    cardId: string, 
    month: number, 
    year: number
  ): Promise<Invoice | null> {
    return await this.repository.findByCardAndPeriod(userId, cardId, month, year)
  }

  /**
   * Busca faturas pendentes
   */
  async getPendingInvoices(userId: string): Promise<Invoice[]> {
    return await this.repository.findPending(userId)
  }

  /**
   * Busca faturas com vencimento próximo
   */
  async getInvoicesDueSoon(userId: string, days: number = 7): Promise<Invoice[]> {
    return await this.repository.findDueSoon(userId, days)
  }

  /**
   * Remove uma fatura
   */
  async deleteInvoice(userId: string, id: string): Promise<boolean> {
    return await this.repository.delete(userId, id)
  }
}
