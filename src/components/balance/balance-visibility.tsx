'use client'

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

export const BALANCE_MASK = 'R$ ****'
export const BALANCE_VISIBILITY_STORAGE_KEY = 'balance-visibility'

const BALANCE_VISIBILITY_EVENT = 'balance-visibility-change'

interface BalanceVisibilityContextValue {
  balancesVisible: boolean
  toggleBalances: () => void
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextValue | null>(null)

function subscribeToBalanceVisibility(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(BALANCE_VISIBILITY_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(BALANCE_VISIBILITY_EVENT, onStoreChange)
  }
}

function getBalanceVisibilitySnapshot() {
  return window.localStorage.getItem(BALANCE_VISIBILITY_STORAGE_KEY) !== 'hidden'
}

function getServerBalanceVisibilitySnapshot() {
  return false
}

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const balancesVisible = useSyncExternalStore(
    subscribeToBalanceVisibility,
    getBalanceVisibilitySnapshot,
    getServerBalanceVisibilitySnapshot,
  )

  const toggleBalances = () => {
    window.localStorage.setItem(
      BALANCE_VISIBILITY_STORAGE_KEY,
      balancesVisible ? 'hidden' : 'visible',
    )
    window.dispatchEvent(new Event(BALANCE_VISIBILITY_EVENT))
  }

  return (
    <BalanceVisibilityContext.Provider value={{ balancesVisible, toggleBalances }}>
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext)

  if (!context) {
    throw new Error('useBalanceVisibility must be used within BalanceVisibilityProvider')
  }

  return context
}

export function BalanceValue({
  children,
  mask = BALANCE_MASK,
}: {
  children: ReactNode
  mask?: ReactNode
}) {
  const { balancesVisible } = useBalanceVisibility()

  return <>{balancesVisible ? children : mask}</>
}
