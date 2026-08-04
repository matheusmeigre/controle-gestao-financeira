import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useIncomeMutations, useIncomeQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney, getErrorMessage } from '../../../lib/mobile-ui'

export default function IncomeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useIncomeQuery(id)
  const income = query.data
  const { deleteIncome, receiveIncome } = useIncomeMutations()
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleDelete() {
    try {
      setFeedback(null)
      await deleteIncome.mutateAsync(id)
      router.replace('/(app)/incomes')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel excluir a receita.'))
    }
  }

  async function handleReceive() {
    try {
      setFeedback(null)
      await receiveIncome.mutateAsync({ id, input: {} })
      setFeedback('Receita marcada como recebida.')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel receber a receita.'))
    }
  }

  return (
    <MobileScreen eyebrow="Detalhe" title="Receita" description="Tela de detalhe de receita para a pilha autenticada.">
      <InfoCard label="ID" value={id} />
      {income ? (
        <>
          <InfoCard label="Descricao" value={income.description} />
          <InfoCard label="Tipo" value={income.type} />
          <InfoCard label="Valor" value={formatMoney(income.amount)} />
          <InfoCard label="Status" value={income.status} />
          <SubmitButton label="Editar" onPress={() => router.push(`/(app)/incomes/${id}/edit`)} />
          {income.status !== 'received' ? <SubmitButton label="Receber" onPress={() => void handleReceive()} loading={receiveIncome.isPending} /> : null}
          <SubmitButton label="Excluir" onPress={() => void handleDelete()} loading={deleteIncome.isPending} tone="danger" />
          <FeedbackText message={feedback} tone={feedback === 'Receita marcada como recebida.' ? 'success' : 'error'} />
        </>
      ) : (
        <InfoCard label="Status" value="Receita nao encontrada no cache atual." />
      )}
    </MobileScreen>
  )
}
