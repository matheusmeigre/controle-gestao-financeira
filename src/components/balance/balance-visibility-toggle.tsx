'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBalanceVisibility } from './balance-visibility'

export function BalanceVisibilityToggle() {
  const { balancesVisible, toggleBalances } = useBalanceVisibility()
  const label = balancesVisible ? 'Ocultar saldos' : 'Mostrar saldos'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleBalances}
      aria-label={label}
      aria-pressed={!balancesVisible}
      title={label}
    >
      {balancesVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
    </Button>
  )
}
