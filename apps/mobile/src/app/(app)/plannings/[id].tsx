import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { usePlanningMutations, usePlanningsQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney, getErrorMessage, parseCurrencyInput } from '../../../lib/mobile-ui'

export default function PlanningDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = usePlanningsQuery()
  const planning = (query.data ?? []).find((item) => item.id === id)
  const { deletePlanning, contributePlanning } = usePlanningMutations()
  const [amount, setAmount] = useState('0')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleDelete() {
    try {
      setFeedback(null)
      await deletePlanning.mutateAsync(id)
      router.replace('/(app)/plannings')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel excluir o planejamento.'))
    }
  }

  async function handleContribution() {
    try {
      setFeedback(null)
      await contributePlanning.mutateAsync({ id, input: { amount: parseCurrencyInput(amount) } })
      setFeedback('Aporte realizado com sucesso.')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel aportar neste planejamento.'))
    }
  }

  return (
    <MobileScreen eyebrow="Detalhe" title="Planejamento" description="Tela de detalhe de planejamento com suporte a back navigation.">
      <InfoCard label="ID" value={id} />
      {planning ? (
        <>
          <InfoCard label="Nome" value={planning.name} />
          <InfoCard label="Categoria" value={planning.category} />
          <InfoCard label="Progresso" value={`${formatMoney(planning.currentAmount)} de ${formatMoney(planning.targetAmount)}`} />
          <InfoCard label="Status" value={`${planning.status} • risco ${planning.riskLevel}`} />
          <SubmitButton label="Editar" onPress={() => router.push(`/(app)/plannings/${id}/edit`)} />
          <FormSection title="Aportar valor">
            <FormField label="Valor do aporte" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <SubmitButton label="Registrar aporte" onPress={() => void handleContribution()} loading={contributePlanning.isPending} />
          </FormSection>
          <SubmitButton label="Excluir" onPress={() => void handleDelete()} loading={deletePlanning.isPending} tone="danger" />
          <FeedbackText message={feedback} tone={feedback === 'Aporte realizado com sucesso.' ? 'success' : 'error'} />
        </>
      ) : <InfoCard label="Status" value="Planejamento nao encontrado no cache atual." />}
    </MobileScreen>
  )
}
