import { router } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useMobileBootstrap } from '../../../providers/mobile-bootstrap-provider'

export default function PlanningsScreen() {
  const { state } = useMobileBootstrap()

  return (
    <MobileScreen eyebrow="Area principal" title="Planejamentos" description="Area de planejamentos com resumo inicial e navegacao para detalhe e formulario." actionLabel="Novo planejamento" onActionPress={() => router.push('/(app)/plannings/new')}>
      {(state.data?.plannings ?? []).slice(0, 10).map((planning) => (
        <InfoCard key={planning.id} label={planning.name} value={`${planning.status} • ${planning.riskLevel} • R$ ${planning.currentAmount.toFixed(2)} de R$ ${planning.targetAmount.toFixed(2)}`} />
      ))}
    </MobileScreen>
  )
}
