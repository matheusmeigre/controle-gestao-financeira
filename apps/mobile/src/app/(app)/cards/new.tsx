import { router } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen } from '../../../components/mobile-screen'
import { useCardMutations } from '../../../hooks/use-mobile-queries'
import { getErrorMessage, parseCurrencyInput, parseIntegerInput } from '../../../lib/mobile-ui'

export default function CardFormScreen() {
  const { createCard } = useCardMutations()
  const [nickname, setNickname] = useState('')
  const [bankName, setBankName] = useState('')
  const [brand, setBrand] = useState('Visa')
  const [last4Digits, setLast4Digits] = useState('0000')
  const [closingDay, setClosingDay] = useState('1')
  const [dueDay, setDueDay] = useState('1')
  const [creditLimit, setCreditLimit] = useState('0')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      const created = await createCard.mutateAsync({
        nickname,
        bankName,
        brand: brand as 'Visa' | 'Mastercard' | 'Elo' | 'American Express' | 'Hipercard' | 'Outros',
        last4Digits,
        closingDay: parseIntegerInput(closingDay),
        dueDay: parseIntegerInput(dueDay),
        creditLimit: parseCurrencyInput(creditLimit),
        isActive: true,
      })
      router.replace(`/(app)/cards/${created.id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel criar o cartao.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Novo cartao" description="Estrutura inicial do formulario mobile para cartoes.">
      <FormSection title="Dados do cartao">
        <FormField label="Apelido" value={nickname} onChangeText={setNickname} />
        <FormField label="Banco" value={bankName} onChangeText={setBankName} />
        <FormField label="Bandeira" value={brand} onChangeText={setBrand} />
        <FormField label="Ultimos 4 digitos" value={last4Digits} onChangeText={setLast4Digits} keyboardType="numeric" />
        <FormField label="Dia de fechamento" value={closingDay} onChangeText={setClosingDay} keyboardType="numeric" />
        <FormField label="Dia de vencimento" value={dueDay} onChangeText={setDueDay} keyboardType="numeric" />
        <FormField label="Limite" value={creditLimit} onChangeText={setCreditLimit} keyboardType="numeric" />
        <SubmitButton label="Salvar cartao" onPress={() => void handleSubmit()} loading={createCard.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
