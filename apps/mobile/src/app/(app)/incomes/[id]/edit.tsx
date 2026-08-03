import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../../components/mobile-form'
import { MobileScreen } from '../../../../components/mobile-screen'
import { useIncomeMutations, useIncomeQuery } from '../../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput } from '../../../../lib/mobile-ui'

export default function IncomeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useIncomeQuery(id)
  const income = useMemo(() => query.data, [query.data])
  const { updateIncome } = useIncomeMutations()
  const [description, setDescription] = useState(income?.description ?? '')
  const [amount, setAmount] = useState(String(income?.amount ?? 0))
  const [type, setType] = useState<'salary' | 'extra'>(income?.type ?? 'salary')
  const [category, setCategory] = useState(income?.category ?? '')
  const [date, setDate] = useState(income?.date ?? '2026-08-01')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      await updateIncome.mutateAsync({
        id,
        input: {
          description,
          amount: parseCurrencyInput(amount),
          type,
          category: category || undefined,
          date,
        },
      })
      router.replace(`/(app)/incomes/${id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel atualizar a receita.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Editar receita" description="Atualize os campos e salve no backend mobile.">
      <FormSection title="Dados da receita">
        <FormField label="Descricao" value={description} onChangeText={setDescription} />
        <FormField label="Valor" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <FormField label="Tipo" value={type} onChangeText={(value) => setType(value === 'extra' ? 'extra' : 'salary')} />
        <FormField label="Categoria" value={category} onChangeText={setCategory} />
        <FormField label="Data" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar alteracoes" onPress={() => void handleSubmit()} loading={updateIncome.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
