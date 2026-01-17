/**
 * useWelcomeFlow Hook
 * 
 * Hook para gerenciar o fluxo de boas-vindas
 * (termos de uso + modal de boas-vindas)
 */

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function useWelcomeFlow() {
  const { user } = useUser()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Detecta primeiro acesso do usuário
  useEffect(() => {
    if (!user?.id) return

    const termsKey = `terms_accepted_${user.id}`
    const hasAcceptedTerms = localStorage.getItem(termsKey)

    if (!hasAcceptedTerms) {
      setShowTermsModal(true)
    } else {
      // Só mostra welcome se já aceitou os termos
      const welcomeKey = `welcome_shown_${user.id}`
      const hasSeenWelcome = localStorage.getItem(welcomeKey)

      if (!hasSeenWelcome) {
        setShowWelcome(true)
        localStorage.setItem(welcomeKey, 'true')
      }
    }
  }, [user?.id])

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    if (!user?.id) return

    const termsKey = `terms_accepted_${user.id}`
    localStorage.setItem(termsKey, 'true')
    setShowTermsModal(false)

    // After accepting terms, check if should show welcome
    const welcomeKey = `welcome_shown_${user.id}`
    const hasSeenWelcome = localStorage.getItem(welcomeKey)

    if (!hasSeenWelcome) {
      setShowWelcome(true)
      localStorage.setItem(welcomeKey, 'true')
    }
  }

  return {
    showWelcome,
    showTermsModal,
    setShowWelcome,
    handleAcceptTerms,
  }
}
