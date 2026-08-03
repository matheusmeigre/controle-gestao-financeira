import { router } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen } from '../../../components/mobile-screen'
import { useExpenseMutations } from '../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../lib/mobile-ui'

export default function ExpenseFormScreen() {
  const { createExpense } = useExpenseMutations()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('0')
  const [category, setCategory] = useState('Outros')
  const [date, setDate] = useState('2026-08-01')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      const created = await createExpense.mutateAsync({
        description,
        amount: parseCurrencyInput(amount),
        category,
        date,
      })
      router.replace(`/(app)/expenses/${created.id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel criar a despesa.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Nova despesa" description="Estrutura inicial do formulario mobile para o dominio de despesas.">
      <FormSection title="Dados da despesa">
        <FormField label="Descricao" value={description} onChangeText={setDescription} />
        <FormField label="Valor" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Data" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar despesa" onPress={() => void handleSubmit()} loading={createExpense.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
