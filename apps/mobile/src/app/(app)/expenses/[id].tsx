import { router, useLocalSearchParams } from 'expo-router'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { FeedbackText, SubmitButton } from '../../../components/mobile-form'
import { useExpenseMutations, useExpenseQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney, getErrorMessage } from '../../../lib/mobile-ui'
import { useState } from 'react'

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useExpenseQuery(id)
  const { deleteExpense } = useExpenseMutations()
  const [feedback, setFeedback] = useState<string | null>(null)
  const expense = query.data

  async function handleDelete() {
    try {
      setFeedback(null)
      await deleteExpense.mutateAsync(id)
      router.replace('/(app)/expenses')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel excluir a despesa.'))
    }
  }

  return (
    <MobileScreen eyebrow="Detalhe" title="Despesa" description="Tela de detalhe preparada para navegacao stack e back navigation nativa.">
      <InfoCard label="ID" value={id} />
      {expense ? (
        <>
          <InfoCard label="Descricao" value={expense.description} />
          <InfoCard label="Categoria" value={expense.category} />
          <InfoCard label="Valor" value={formatMoney(expense.amount)} />
          <InfoCard label="Data" value={expense.date} />
          <SubmitButton label="Editar" onPress={() => router.push(`/(app)/expenses/${id}/edit`)} />
          <SubmitButton label="Excluir" onPress={() => void handleDelete()} loading={deleteExpense.isPending} tone="danger" />
          <FeedbackText message={feedback} />
        </>
      ) : (
        <InfoCard label="Status" value="Despesa nao encontrada no cache atual." />
      )}
    </MobileScreen>
  )
}
