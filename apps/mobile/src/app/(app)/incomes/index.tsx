import { router } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useMobileBootstrap } from '../../../providers/mobile-bootstrap-provider'

export default function IncomesScreen() {
  const { state } = useMobileBootstrap()

  return (
    <MobileScreen eyebrow="Area principal" title="Receitas" description="Lista inicial de receitas carregadas no shell autenticado." actionLabel="Novo formulario" onActionPress={() => router.push('/(app)/incomes/new')}>
      {(state.data?.incomes ?? []).slice(0, 10).map((income) => (
        <InfoCard key={income.id} label={income.description} value={`${income.type} • ${income.date} • R$ ${income.amount.toFixed(2)}`} />
      ))}
    </MobileScreen>
  )
}
