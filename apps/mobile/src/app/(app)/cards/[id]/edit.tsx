import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../../components/mobile-form'
import { MobileScreen } from '../../../../components/mobile-screen'
import { useCardMutations, useCardsQuery } from '../../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput, parseIntegerInput } from '../../../../lib/mobile-ui'

export default function CardEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useCardsQuery(true)
  const card = useMemo(() => (query.data ?? []).find((item) => item.id === id), [id, query.data])
  const { updateCard } = useCardMutations()
  const [nickname, setNickname] = useState(card?.nickname ?? '')
  const [bankName, setBankName] = useState(card?.bankName ?? '')
  const [brand, setBrand] = useState(card?.brand ?? 'Visa')
  const [last4Digits, setLast4Digits] = useState(card?.last4Digits ?? '0000')
  const [closingDay, setClosingDay] = useState(String(card?.closingDay ?? 1))
  const [dueDay, setDueDay] = useState(String(card?.dueDay ?? 1))
  const [creditLimit, setCreditLimit] = useState(String(card?.creditLimit ?? 0))
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      await updateCard.mutateAsync({
        id,
        input: {
          nickname,
          bankName,
          brand: brand as 'Visa' | 'Mastercard' | 'Elo' | 'American Express' | 'Hipercard' | 'Outros',
          last4Digits,
          closingDay: parseIntegerInput(closingDay),
          dueDay: parseIntegerInput(dueDay),
          creditLimit: parseCurrencyInput(creditLimit),
        },
      })
      router.replace(`/(app)/cards/${id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel atualizar o cartao.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Editar cartao" description="Atualize os dados principais do cartao.">
      <FormSection title="Dados do cartao">
        <FormField label="Apelido" value={nickname} onChangeText={setNickname} />
        <FormField label="Banco" value={bankName} onChangeText={setBankName} />
        <FormField label="Bandeira" value={brand} onChangeText={(value) => setBrand(value as typeof brand)} />
        <FormField label="Ultimos 4 digitos" value={last4Digits} onChangeText={setLast4Digits} keyboardType="numeric" />
        <FormField label="Dia de fechamento" value={closingDay} onChangeText={setClosingDay} keyboardType="numeric" />
        <FormField label="Dia de vencimento" value={dueDay} onChangeText={setDueDay} keyboardType="numeric" />
        <FormField label="Limite" value={creditLimit} onChangeText={setCreditLimit} keyboardType="numeric" />
        <SubmitButton label="Salvar alteracoes" onPress={() => void handleSubmit()} loading={updateCard.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
