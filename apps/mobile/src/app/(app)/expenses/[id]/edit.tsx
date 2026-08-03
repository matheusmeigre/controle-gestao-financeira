import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../../components/mobile-form'
import { MobileScreen } from '../../../../components/mobile-screen'
import { useExpenseMutations, useExpensesQuery } from '../../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../../lib/mobile-ui'

export default function ExpenseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useExpensesQuery()
  const expense = useMemo(() => (query.data ?? []).find((item) => item.id === id), [id, query.data])
  const { updateExpense } = useExpenseMutations()
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(String(expense?.amount ?? 0))
  const [category, setCategory] = useState(expense?.category ?? 'Outros')
  const [date, setDate] = useState(expense?.date ?? '2026-08-01')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      await updateExpense.mutateAsync({
        id,
        input: {
          description,
          amount: parseCurrencyInput(amount),
          category,
          date,
        },
      })
      router.replace(`/(app)/expenses/${id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel atualizar a despesa.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Editar despesa" description="Atualize os campos e salve no backend mobile.">
      <FormSection title="Dados da despesa">
        <FormField label="Descricao" value={description} onChangeText={setDescription} />
        <FormField label="Valor" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Data" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar alteracoes" onPress={() => void handleSubmit()} loading={updateExpense.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
