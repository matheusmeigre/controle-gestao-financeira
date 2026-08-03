import { router } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useMobileBootstrap } from '../../../providers/mobile-bootstrap-provider'

export default function ExpensesScreen() {
  const { state } = useMobileBootstrap()

  return (
    <MobileScreen eyebrow="Area principal" title="Despesas" description="Lista inicial de despesas sincronizadas no bootstrap." actionLabel="Novo formulario" onActionPress={() => router.push('/(app)/expenses/new')}>
      {(state.data?.expenses ?? []).slice(0, 10).map((expense) => (
        <InfoCard key={expense.id} label={expense.description} value={`${expense.category} • ${expense.date} • R$ ${expense.amount.toFixed(2)}`} />
      ))}
      {state.data?.expenses[0] ? <InfoCard label="Detalhe rapido" value="Abra um item em /expenses/[id] ao tocar em uma futura lista interativa." /> : null}
    </MobileScreen>
  )
}
