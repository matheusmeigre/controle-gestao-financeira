import type { LucideIcon } from 'lucide-react'
import { CreditCard, House, Landmark, ReceiptText, Target, UserRound } from 'lucide-react'

export type AppNavigationItem = {
  id: 'home' | 'transactions' | 'invoices' | 'planning' | 'cards' | 'profile'
  label: string
  shortLabel?: string
  href: string
  icon: LucideIcon
}

export const appNavigationItems: AppNavigationItem[] = [
  { id: 'home', label: 'Resumo', href: '/', icon: House },
  {
    id: 'transactions',
    label: 'Transações',
    href: '/?view=transactions',
    icon: Landmark,
  },
  { id: 'invoices', label: 'Faturas', href: '/invoices', icon: ReceiptText },
  { id: 'planning', label: 'Planejamento', shortLabel: 'Planos', href: '/planning', icon: Target },
  { id: 'cards', label: 'Cartões', href: '/cards', icon: CreditCard },
  { id: 'profile', label: 'Relatórios', shortLabel: 'Mais', href: '/?view=profile', icon: UserRound },
]

export function isNavigationItemActive(
  item: AppNavigationItem,
  pathname: string,
  view: string | null,
) {
  if (item.id === 'home') return pathname === '/' && !view
  if (item.id === 'transactions' || item.id === 'profile') {
    return pathname === '/' && view === item.id
  }
  return pathname.startsWith(item.href)
}
