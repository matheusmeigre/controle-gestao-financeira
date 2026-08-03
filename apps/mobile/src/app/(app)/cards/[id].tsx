import { useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <MobileScreen eyebrow="Detalhe" title="Cartao" description="Tela de detalhe do cartao com back navigation nativa.">
      <InfoCard label="ID" value={id} />
    </MobileScreen>
  )
}
