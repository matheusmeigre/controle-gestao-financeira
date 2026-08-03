import { router } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useMobileBootstrap } from '../../../providers/mobile-bootstrap-provider'

export default function InvoicesScreen() {
  const { state } = useMobileBootstrap()

  return (
    <MobileScreen eyebrow="Area principal" title="Faturas" description="Lista inicial de faturas para navegacao mobile." actionLabel="Nova fatura" onActionPress={() => router.push('/(app)/invoices/new')}>
      {(state.data?.invoices ?? []).slice(0, 10).map((invoice) => (
        <InfoCard key={invoice.id} label={`${invoice.month}/${invoice.year}`} value={`Total R$ ${invoice.totalAmount.toFixed(2)} • Pago ${invoice.isPaid ? 'Sim' : 'Nao'}`} />
      ))}
    </MobileScreen>
  )
}
