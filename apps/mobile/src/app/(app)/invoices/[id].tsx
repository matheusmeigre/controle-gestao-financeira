import { useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <MobileScreen eyebrow="Detalhe" title="Fatura" description="Tela de detalhe da fatura pronta para compor o fluxo autenticado.">
      <InfoCard label="ID" value={id} />
    </MobileScreen>
  )
}
