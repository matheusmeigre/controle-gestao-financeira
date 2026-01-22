'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard as CreditCardIcon, Plus, Trash2, Eye, Pencil, Receipt, RotateCw, Lock, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CreditCard } from '../types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STORAGE_KEY = 'credit_cards'

// Cores baseadas nos bancos
const BANK_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  'Nubank': { bg: 'bg-gradient-to-br from-purple-600 to-purple-800', text: 'text-white', accent: 'bg-purple-500' },
  'Inter': { bg: 'bg-gradient-to-br from-orange-500 to-orange-700', text: 'text-white', accent: 'bg-orange-400' },
  'Itaú': { bg: 'bg-gradient-to-br from-blue-600 to-blue-800', text: 'text-white', accent: 'bg-blue-500' },
  'Bradesco': { bg: 'bg-gradient-to-br from-red-600 to-red-800', text: 'text-white', accent: 'bg-red-500' },
  'Santander': { bg: 'bg-gradient-to-br from-red-500 to-red-700', text: 'text-white', accent: 'bg-red-400' },
  'Banco do Brasil': { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700', text: 'text-gray-900', accent: 'bg-yellow-400' },
  'Caixa': { bg: 'bg-gradient-to-br from-blue-500 to-blue-700', text: 'text-white', accent: 'bg-blue-400' },
  'C6 Bank': { bg: 'bg-gradient-to-br from-gray-800 to-black', text: 'text-white', accent: 'bg-gray-700' },
  'BTG Pactual': { bg: 'bg-gradient-to-br from-blue-900 to-black', text: 'text-white', accent: 'bg-blue-800' },
  'PicPay': { bg: 'bg-gradient-to-br from-green-500 to-green-700', text: 'text-white', accent: 'bg-green-400' },
  'Mercado Pago': { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white', accent: 'bg-blue-300' },
  'default': { bg: 'bg-gradient-to-br from-slate-600 to-slate-800', text: 'text-white', accent: 'bg-slate-500' },
}

// Logos das bandeiras
const BRAND_LOGOS: Record<string, string> = {
  'Visa': '💳',
  'Mastercard': '🔴',
  'Elo': '🟡',
  'American Express': '🔵',
  'Hipercard': '🟠',
  'Outros': '💳',
}

export function CardsList() {
  const { user } = useUser()
  const router = useRouter()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuAnimating, setMenuAnimating] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
  }, [user])

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  const loadCards = () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        const userCards = allCards.filter(
          card => card.userId === user.id && card.isActive
        )
        setCards(userCards)
      }
    } catch (error) {
      console.error('Error loading cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCard = (cardId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const allCards: CreditCard[] = JSON.parse(stored)
        const updatedCards = allCards.map(card =>
          card.id === cardId ? { ...card, isActive: false } : card
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards))
        loadCards()
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  const getBankColor = (bankName: string) => {
    // Extrair nome do banco (remover código)
    const bankKey = Object.keys(BANK_COLORS).find(key => 
      bankName.toLowerCase().includes(key.toLowerCase())
    )
    return bankKey ? BANK_COLORS[bankKey] : BANK_COLORS.default
  }

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const toggleMenu = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (openMenuId === cardId) {
      setOpenMenuId(null)
      setMenuAnimating(null)
    } else {
      setOpenMenuId(cardId)
      setMenuAnimating(cardId)
      // Remove animation state after animation completes
      setTimeout(() => setMenuAnimating(null), 400)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Cadastre seu primeiro cartão de crédito para começar a gerenciar suas faturas.
          </p>
          <Link href="/cards/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Cartão
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
      {cards.map(card => {
        const colors = getBankColor(card.bankName)
        const brandLogo = BRAND_LOGOS[card.brand] || BRAND_LOGOS['Outros']
        const isFlipped = flippedCards.has(card.id || '')
        
        return (
          <div key={card.id} className="perspective-1000 h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] relative w-full max-w-md mx-auto">
            {/* Menu dropdown - Fora do card para evitar conflitos */}
            <div className="absolute top-2 right-2 z-50">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/40 hover:bg-black/50 border-none backdrop-blur-sm text-white shadow-lg"
                onClick={(e) => toggleMenu(card.id || '', e)}
                title="Opções"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              {/* Dropdown Menu */}
              {openMenuId === card.id && (
                <div 
                  className="absolute right-0 mt-1 w-48 origin-top"
                  style={{
                    animation: menuAnimating === card.id ? 'flipInX 0.4s ease-out' : 'none',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(null)
                      router.push(`/cards/${card.id}/edit`)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors duration-150"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar cartão
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(null)
                      router.push(`/invoices?cardId=${card.id}`)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors duration-150"
                  >
                    <Receipt className="h-4 w-4" />
                    Ver faturas
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (card.id && confirm('Deseja realmente excluir este cartão?')) {
                        deleteCard(card.id)
                        setOpenMenuId(null)
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir cartão
                  </button>
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => toggleFlip(card.id || '')}
              className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRENTE DO CARTÃO */}
              <div
                className={`absolute inset-0 rounded-xl p-4 sm:p-5 md:p-6 shadow-xl ${colors.bg} ${colors.text} backface-hidden hover:shadow-2xl transition-shadow`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Header - Instituição e Bandeira */}
                <div className="flex items-start justify-between mb-3 sm:mb-4 pr-16 sm:pr-20 md:pr-24">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold opacity-95 mb-0.5 sm:mb-1 leading-tight truncate">
                      {card.bankName.split(' - ')[1] || card.bankName}
                    </p>
                    <p className="text-[10px] sm:text-xs opacity-80 font-medium truncate">{card.nickname}</p>
                  </div>
                </div>

                {/* Logo da bandeira - Posicionado separadamente */}
                <div className="absolute top-4 sm:top-5 md:top-6 right-4 sm:right-5 md:right-6 text-2xl sm:text-3xl md:text-4xl">
                  {brandLogo}
                </div>

                {/* Chip simulado */}
                <div className="mb-3 sm:mb-4 md:mb-5">
                  <div className="w-10 h-8 sm:w-12 sm:h-9 md:w-14 md:h-11 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg opacity-90 shadow-md"></div>
                </div>

                {/* Número do cartão */}
                <div className="mb-2 sm:mb-3">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono tracking-[0.1em] sm:tracking-[0.15em] font-semibold leading-tight">
                    •••• •••• •••• {card.last4Digits}
                  </p>
                </div>

                {/* Footer - Informações de data */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-4 sm:left-5 md:left-6 right-4 sm:right-5 md:right-6 flex items-end justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] opacity-70 uppercase tracking-wider mb-0.5 font-semibold">Vencimento</p>
                    <p className="text-[11px] sm:text-xs md:text-sm font-bold">Dia {card.dueDay}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] opacity-70 uppercase tracking-wider mb-0.5 font-semibold">Fechamento</p>
                    <p className="text-[11px] sm:text-xs md:text-sm font-bold">Dia {card.closingDay}</p>
                  </div>
                  {card.creditLimit && (
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] opacity-70 uppercase tracking-wider mb-0.5 font-semibold">Limite</p>
                      <p className="text-[11px] sm:text-xs md:text-sm font-bold truncate">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(card.creditLimit)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* VERSO DO CARTÃO */}
              <div
                className={`absolute inset-0 rounded-xl shadow-xl ${colors.bg} ${colors.text} backface-hidden rotate-y-180 flex flex-col`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Tarja magnética */}
                <div className="flex h-8 sm:h-10 md:h-12 bg-black/50 mt-3 sm:mt-4 md:mt-5 flex-shrink-0"></div>

                {/* Conteúdo bloqueado - ocupando 50% da altura */}
                <div className="flex-col items-center justify-center px-4 py-auto max-w-[100%] mt-2 flex-grow">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-full max-w-[100%] text-center" style={{ maxHeight: '90%' }}>
                    <Lock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mx-auto mb-1.5 sm:mb-2 opacity-80" />
                    <h3 className="text-xs sm:text-sm font-bold mb-1 sm:mb-1.5">Em Desenvolvimento</h3>
                    <p className="text-[9px] sm:text-[10px] opacity-85 leading-tight mb-1.5 sm:mb-2">
                      Em breve você poderá vincular este cartão ao banco e ver:
                    </p>
                    <ul className="text-[8px] sm:text-[9px] opacity-75 space-y-0.5 text-left max-w-[130px] sm:max-w-[150px] mx-auto leading-tight">
                      <li>• Nome do titular</li>
                      <li>• Código de segurança (CVC)</li>
                      <li>• Data de validade</li>
                      <li>• Categoria do cartão</li>
                    </ul>
                  </div>
                  <p className="text-[8px] sm:text-[9px] opacity-80 ml-[40%] mb-7 sm:mb-7 italic">Clique para voltar</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
