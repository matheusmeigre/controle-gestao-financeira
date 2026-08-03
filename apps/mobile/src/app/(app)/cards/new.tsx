import { MobileScreen, InfoCard } from '../../../components/mobile-screen'

export default function CardFormScreen() {
  return (
    <MobileScreen eyebrow="Formulario" title="Novo cartao" description="Estrutura inicial do formulario mobile para cartoes.">
      <InfoCard label="Status" value="Formulario preparado para o TODO 5." />
    </MobileScreen>
  )
}
