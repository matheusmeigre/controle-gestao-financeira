import { router } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useMobileBootstrap } from '../../../providers/mobile-bootstrap-provider'

export default function CardsScreen() {
  const { state } = useMobileBootstrap()

  return (
    <MobileScreen eyebrow="Area principal" title="Cartoes" description="Area inicial de cartoes com navegacao para detalhe e formulario." actionLabel="Novo cartao" onActionPress={() => router.push('/(app)/cards/new')}>
      {(state.data?.cards ?? []).slice(0, 10).map((card) => (
        <InfoCard key={card.id} label={card.nickname} value={`${card.bankName} • ${card.brand} • Final ${card.last4Digits}`} />
      ))}
    </MobileScreen>
  )
}
