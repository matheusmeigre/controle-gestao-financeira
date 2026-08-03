import { router } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen } from '../../../components/mobile-screen'
import { useIncomeMutations } from '../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../lib/mobile-ui'

export default function IncomeFormScreen() {
  const { createIncome } = useIncomeMutations()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('0')
  const [type, setType] = useState<'salary' | 'extra'>('salary')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('2026-08-01')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      const created = await createIncome.mutateAsync({
        description,
        amount: parseCurrencyInput(amount),
        type,
        category: category || undefined,
        date,
        status: 'pending',
      })
      router.replace(`/(app)/incomes/${created.id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel criar a receita.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Nova receita" description="Estrutura inicial do formulario mobile para receitas.">
      <FormSection title="Dados da receita">
        <FormField label="Descricao" value={description} onChangeText={setDescription} />
        <FormField label="Valor" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Tipo" value={type} onChangeText={(value) => setType(value === 'extra' ? 'extra' : 'salary')} placeholder="salary ou extra" />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Data" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar receita" onPress={() => void handleSubmit()} loading={createIncome.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
