import { useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function IncomeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <MobileScreen eyebrow="Detalhe" title="Receita" description="Tela de detalhe de receita para a pilha autenticada.">
      <InfoCard label="ID" value={id} />
    </MobileScreen>
  )
}
