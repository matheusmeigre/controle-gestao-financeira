import { useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <MobileScreen eyebrow="Detalhe" title="Despesa" description="Tela de detalhe preparada para navegacao stack e back navigation nativa.">
      <InfoCard label="ID" value={id} />
    </MobileScreen>
  )
}
