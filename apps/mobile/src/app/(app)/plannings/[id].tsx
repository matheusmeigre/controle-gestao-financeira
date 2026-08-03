import { useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function PlanningDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <MobileScreen eyebrow="Detalhe" title="Planejamento" description="Tela de detalhe de planejamento com suporte a back navigation.">
      <InfoCard label="ID" value={id} />
    </MobileScreen>
  )
}
