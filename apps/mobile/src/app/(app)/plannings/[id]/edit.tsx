import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../../components/mobile-form'
import { MobileScreen } from '../../../../components/mobile-screen'
import { usePlanningMutations, usePlanningsQuery } from '../../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../../lib/mobile-ui'

export default function PlanningEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = usePlanningsQuery()
  const planning = useMemo(() => (query.data ?? []).find((item) => item.id === id), [id, query.data])
  const { updatePlanning } = usePlanningMutations()
  const [name, setName] = useState(planning?.name ?? '')
  const [category, setCategory] = useState(planning?.category ?? '')
  const [targetAmount, setTargetAmount] = useState(String(planning?.targetAmount ?? 0))
  const [currentAmount, setCurrentAmount] = useState(String(planning?.currentAmount ?? 0))
  const [startDate, setStartDate] = useState(planning?.startDate ?? '2026-08-01')
  const [targetDate, setTargetDate] = useState(planning?.targetDate ?? '2026-12-31')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      await updatePlanning.mutateAsync({
        id,
        input: {
          name,
          category,
          targetAmount: parseCurrencyInput(targetAmount),
          currentAmount: parseCurrencyInput(currentAmount),
          startDate,
          targetDate,
        },
      })
      router.replace(`/(app)/plannings/${id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel atualizar o planejamento.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Editar planejamento" description="Atualize os dados e salve no backend mobile.">
      <FormSection title="Dados do planejamento">
        <FormField label="Nome" value={name} onChangeText={setName} />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Meta" value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" />
        <FormField label="Saldo atual" value={currentAmount} onChangeText={setCurrentAmount} keyboardType="numeric" />
        <FormField label="Inicio" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
        <FormField label="Data alvo" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar alteracoes" onPress={() => void handleSubmit()} loading={updatePlanning.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
