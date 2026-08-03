import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useCardMutations, useCardsQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney, getErrorMessage } from '../../../lib/mobile-ui'

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useCardsQuery(true)
  const card = (query.data ?? []).find((item) => item.id === id)
  const { deleteCard, updateCard } = useCardMutations()
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleDelete() {
    try {
      setFeedback(null)
      await deleteCard.mutateAsync(id)
      router.replace('/(app)/cards')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel excluir o cartao.'))
    }
  }

  async function toggleActive() {
    if (!card) return
    try {
      setFeedback(null)
      await updateCard.mutateAsync({ id, input: { isActive: !card.isActive } })
      setFeedback(card.isActive ? 'Cartao desativado.' : 'Cartao ativado.')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel atualizar o cartao.'))
    }
  }

  return (
    <MobileScreen eyebrow="Detalhe" title="Cartao" description="Tela de detalhe do cartao com back navigation nativa.">
      <InfoCard label="ID" value={id} />
      {card ? (
        <>
          <InfoCard label="Apelido" value={card.nickname} />
          <InfoCard label="Banco" value={card.bankName} />
          <InfoCard label="Limite" value={card.creditLimit ? formatMoney(card.creditLimit) : 'Nao informado'} />
          <InfoCard label="Status" value={card.isActive ? 'Ativo' : 'Inativo'} />
          <SubmitButton label="Editar" onPress={() => router.push(`/(app)/cards/${id}/edit`)} />
          <SubmitButton label={card.isActive ? 'Desativar' : 'Ativar'} onPress={() => void toggleActive()} loading={updateCard.isPending} />
          <SubmitButton label="Excluir" onPress={() => void handleDelete()} loading={deleteCard.isPending} tone="danger" />
          <FeedbackText message={feedback} tone={feedback?.includes('ativ') ? 'success' : 'error'} />
        </>
      ) : <InfoCard label="Status" value="Cartao nao encontrado no cache atual." />}
    </MobileScreen>
  )
}
