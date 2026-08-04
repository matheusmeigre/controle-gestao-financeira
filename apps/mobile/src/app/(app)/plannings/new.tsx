import { router } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen } from '../../../components/mobile-screen'
import { usePlanningMutations } from '../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../lib/mobile-ui'

export default function PlanningFormScreen() {
  const { createPlanning } = usePlanningMutations()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [targetAmount, setTargetAmount] = useState('0')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [startDate, setStartDate] = useState('2026-08-01')
  const [targetDate, setTargetDate] = useState('2026-12-31')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      const created = await createPlanning.mutateAsync({
        name,
        category,
        targetAmount: parseCurrencyInput(targetAmount),
        currentAmount: parseCurrencyInput(currentAmount),
        startDate,
        targetDate,
        status: 'planned',
        linkedExpenseIds: [],
        alerts: [],
        riskLevel: 'low',
      })
      router.replace(`/(app)/plannings/${created.id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel criar o planejamento.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Novo planejamento" description="Estrutura inicial do formulario mobile para planejamentos.">
      <FormSection title="Dados do planejamento">
        <FormField label="Nome" value={name} onChangeText={setName} />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Meta" value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" />
        <FormField label="Saldo inicial" value={currentAmount} onChangeText={setCurrentAmount} keyboardType="numeric" />
        <FormField label="Inicio" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
        <FormField label="Data alvo" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar planejamento" onPress={() => void handleSubmit()} loading={createPlanning.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
