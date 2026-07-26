import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  BALANCE_MASK,
  BALANCE_VISIBILITY_STORAGE_KEY,
  BalanceValue,
  BalanceVisibilityProvider,
} from '@/components/balance/balance-visibility'
import { BalanceVisibilityToggle } from '@/components/balance/balance-visibility-toggle'

function BalanceVisibilityExample() {
  return (
    <BalanceVisibilityProvider>
      <BalanceVisibilityToggle />
      <p><BalanceValue>R$ 1.234,56</BalanceValue></p>
      <p><BalanceValue>-R$ 98,76</BalanceValue></p>
    </BalanceVisibilityProvider>
  )
}

describe('balance visibility', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('hides and restores every balance without leaving the values in the DOM', () => {
    render(<BalanceVisibilityExample />)

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar saldos' }))

    expect(document.body.textContent).not.toContain('R$ 1.234,56')
    expect(document.body.textContent).not.toContain('-R$ 98,76')
    expect(screen.getAllByText(BALANCE_MASK)).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar saldos' }))

    expect(screen.getByText('R$ 1.234,56')).toBeTruthy()
    expect(screen.getByText('-R$ 98,76')).toBeTruthy()
  })

  it('persists the hidden preference when the interface is mounted again', () => {
    window.localStorage.setItem(BALANCE_VISIBILITY_STORAGE_KEY, 'hidden')

    render(<BalanceVisibilityExample />)

    expect(screen.getByRole('button', { name: 'Mostrar saldos' })).toBeTruthy()
    expect(screen.getAllByText(BALANCE_MASK)).toHaveLength(2)
  })
})
