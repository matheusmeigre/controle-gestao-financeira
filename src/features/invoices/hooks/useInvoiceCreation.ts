"use client"

/**
 * 🎣 useInvoiceCreation Hook
 * 
 * Hook customizado para gerenciar o estado e lógica de criação de faturas.
 * Responsabilidades:
 * - Gerenciar seleção de cartão e competência
 * - Calcular automaticamente datas de fechamento e vencimento
 * - Carregar dados completos do cartão selecionado
 * - Fornecer estado consolidado para o componente
 * 
 * Benefícios:
 * - Separação de lógica da UI
 * - Cálculo automático de datas
 * - Reutilizável em outros contextos
 * - Testável isoladamente
 */

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import type { CreditCard } from '@/features/cards/types'
import { InvoiceDateCalculator } from '../utils/invoice-dates.utils'
import type { InvoiceCompetency, CalculatedDates } from '../utils/invoice-dates.utils'
import { getCards } from '@/server/actions/cards'

interface UseInvoiceCreationReturn {
  // Seleção de cartão
  cardId: string
  setCardId: (id: string) => void
  card: CreditCard | null
  isLoadingCard: boolean
  
  // Competência
  competency: InvoiceCompetency
  setCompetency: (competency: InvoiceCompetency) => void
  
  // Datas calculadas automaticamente
  calculatedDates: CalculatedDates | null
  
  // Informações derivadas
  cardDisplayName: string
  competencyDisplay: string
  isReadyToCreate: boolean
}

export function useInvoiceCreation(): UseInvoiceCreationReturn {
  const { user } = useUser()
  
  // Estado principal
  const [cardId, setCardId] = useState('')
  const [card, setCard] = useState<CreditCard | null>(null)
  const [isLoadingCard, setIsLoadingCard] = useState(false)
  
  // Competência - inicializa com mês/ano atual
  const [competency, setCompetency] = useState<InvoiceCompetency>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  
  /**
   * Efeito: Carrega dados completos do cartão quando cardId muda
   */
  useEffect(() => {
    if (!cardId || !user?.id) {
      setCard(null)
      return
    }
    
    const loadCard = async () => {
      setIsLoadingCard(true)
      
      try {
        const result = await getCards()
        
        if (result.success) {
          const foundCard = result.data.find(
            c => c.id === cardId
          )
          setCard(foundCard || null)
        } else {
          setCard(null)
        }
      } catch (error) {
        console.error('Error loading card:', error)
        setCard(null)
      } finally {
        setIsLoadingCard(false)
      }
    }
    
    loadCard()
  }, [cardId, user?.id])
  
  /**
   * Memo: Calcula datas automaticamente quando cartão ou competência mudam
   * Este é o coração da funcionalidade - cálculo automático!
   */
  const calculatedDates = useMemo<CalculatedDates | null>(() => {
    if (!card) return null
    
    try {
      return InvoiceDateCalculator.calculateInvoiceDates(
        {
          closingDay: card.closingDay,
          dueDay: card.dueDay,
        },
        competency
      )
    } catch (error) {
      console.error('Error calculating dates:', error)
      return null
    }
  }, [card, competency])
  
  /**
   * Memo: Nome de exibição do cartão
   */
  const cardDisplayName = useMemo(() => {
    if (!card) return ''
    return `${card.nickname} (•••• ${card.last4Digits})`
  }, [card])
  
  /**
   * Memo: Texto de exibição da competência
   */
  const competencyDisplay = useMemo(() => {
    const monthName = InvoiceDateCalculator.getMonthName(competency.month)
    return `${monthName}/${competency.year}`
  }, [competency])
  
  /**
   * Memo: Verifica se está pronto para criar fatura
   */
  const isReadyToCreate = useMemo(() => {
    return !!(cardId && card && calculatedDates)
  }, [cardId, card, calculatedDates])
  
  return {
    // Cartão
    cardId,
    setCardId,
    card,
    isLoadingCard,
    
    // Competência
    competency,
    setCompetency,
    
    // Datas calculadas
    calculatedDates,
    
    // Derivados
    cardDisplayName,
    competencyDisplay,
    isReadyToCreate,
  }
}
