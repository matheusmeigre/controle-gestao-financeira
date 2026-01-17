/**
 * 📅 Invoice Dates Calculator
 * 
 * Utilitário para cálculo automático de datas de fechamento e vencimento de faturas
 * baseado nas configurações do cartão de crédito e competência selecionada.
 * 
 * Regras de negócio:
 * - Data de fechamento: mesmo mês/ano da competência
 * - Data de vencimento: mês seguinte ao fechamento
 * - Considera virada de ano (dezembro → janeiro)
 */

export interface InvoiceCompetency {
  month: number // 1-12
  year: number  // YYYY
}

export interface CardDates {
  closingDay: number // Dia do mês (1-31)
  dueDay: number     // Dia do mês (1-31)
}

export interface CalculatedDates {
  closingDate: Date | string
  dueDate: Date | string
  closingDateISO?: string
  dueDateISO?: string
}

export class InvoiceDateCalculator {
  /**
   * Calcula data de fechamento baseada no dia de fechamento do cartão
   * e na competência (mês/ano) da fatura
   * 
   * @param closingDay - Dia do mês em que a fatura fecha (1-31)
   * @param month - Mês da competência (1-12)
   * @param year - Ano da competência
   * @returns Data de fechamento
   * 
   * @example
   * // Cartão fecha dia 10, competência 12/2025
   * calculateClosingDate(10, 12, 2025) // => Date(2025, 11, 10) = 10/12/2025
   */
  static calculateClosingDate(
    closingDay: number,
    month: number,
    year: number
  ): Date {
    // Validações
    this.validateDay(closingDay, 'Dia de fechamento')
    this.validateMonth(month)
    this.validateYear(year)
    
    // JavaScript Date usa month 0-indexed (0 = Janeiro, 11 = Dezembro)
    return new Date(year, month - 1, closingDay)
  }
  
  /**
   * Calcula data de vencimento baseada no dia de vencimento do cartão
   * Vencimento é SEMPRE no mês seguinte ao fechamento
   * 
   * @param dueDay - Dia do mês em que a fatura vence (1-31)
   * @param closingMonth - Mês do fechamento (1-12)
   * @param closingYear - Ano do fechamento
   * @returns Data de vencimento
   * 
   * @example
   * // Cartão vence dia 17, fechamento em 12/2025
   * calculateDueDate(17, 12, 2025) // => Date(2026, 0, 17) = 17/01/2026
   * 
   * // Cartão vence dia 5, fechamento em 06/2025
   * calculateDueDate(5, 6, 2025) // => Date(2025, 6, 5) = 05/07/2025
   */
  static calculateDueDate(
    dueDay: number,
    closingMonth: number,
    closingYear: number
  ): Date {
    // Validações
    this.validateDay(dueDay, 'Dia de vencimento')
    this.validateMonth(closingMonth)
    this.validateYear(closingYear)
    
    // Calcular mês e ano do vencimento
    let dueMonth = closingMonth + 1
    let dueYear = closingYear
    
    // Se passou de dezembro (mês 12), vira janeiro (mês 1) do próximo ano
    if (dueMonth > 12) {
      dueMonth = 1
      dueYear++
    }
    
    return new Date(dueYear, dueMonth - 1, dueDay)
  }
  
  /**
   * Calcula ambas as datas (fechamento e vencimento) de uma vez
   * Método principal para uso em componentes
   * 
   * @param card - Objeto com closingDay e dueDay
   * @param competency - Objeto com month e year
   * @returns Objeto com ambas as datas calculadas
   * 
   * @example
   * const card = { closingDay: 10, dueDay: 17 }
   * const competency = { month: 12, year: 2025 }
   * 
   * const dates = calculateInvoiceDates(card, competency)
   * // {
   * //   closingDate: Date(2025, 11, 10),
   * //   dueDate: Date(2026, 0, 17),
   * //   closingDateISO: "2025-12-10",
   * //   dueDateISO: "2026-01-17"
   * // }
   */
  static calculateInvoiceDates(
    card: CardDates,
    competency: InvoiceCompetency
  ): CalculatedDates {
    const closingDate = this.calculateClosingDate(
      card.closingDay,
      competency.month,
      competency.year
    )
    
    const dueDate = this.calculateDueDate(
      card.dueDay,
      competency.month,
      competency.year
    )
    
    return {
      closingDate,
      dueDate,
      closingDateISO: this.formatToISO(closingDate),
      dueDateISO: this.formatToISO(dueDate),
    }
  }
  
  /**
   * Formata Date para string ISO (YYYY-MM-DD) para uso em inputs type="date"
   */
  private static formatToISO(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  /**
   * Validações
   */
  private static validateDay(day: number, fieldName: string): void {
    if (day < 1 || day > 31) {
      throw new Error(`${fieldName} deve estar entre 1 e 31`)
    }
  }
  
  private static validateMonth(month: number): void {
    if (month < 1 || month > 12) {
      throw new Error('Mês deve estar entre 1 e 12')
    }
  }
  
  private static validateYear(year: number): void {
    if (year < 2020 || year > 2100) {
      throw new Error('Ano deve estar entre 2020 e 2100')
    }
  }
  
  /**
   * Utilitário para formatar data para exibição (DD/MM/YYYY)
   * Aceita Date object ou string ISO (YYYY-MM-DD)
   */
  static formatForDisplay(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatForDisplay:', date)
      return 'Data inválida'
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  /**
   * Utilitário para obter nome do mês
   */
  static getMonthName(month: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1] || 'Mês inválido'
  }
}
