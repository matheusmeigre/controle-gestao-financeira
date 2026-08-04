import { router } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen } from '../../../components/mobile-screen'
import { useInvoiceMutations } from '../../../hooks/use-mobile-queries'
import { getErrorMessage, parseIntegerInput } from '../../../lib/mobile-ui'

export default function InvoiceFormScreen() {
  const { createInvoice } = useInvoiceMutations()
  const [cardId, setCardId] = useState('')
  const [month, setMonth] = useState('8')
  const [year, setYear] = useState('2026')
  const [closingDate, setClosingDate] = useState('2026-08-25')
  const [dueDate, setDueDate] = useState('2026-09-05')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit() {
    try {
      setFeedback(null)
      const created = await createInvoice.mutateAsync({
        cardId,
        month: parseIntegerInput(month),
        year: parseIntegerInput(year),
        closingDate,
        dueDate,
        items: [],
      })
      router.replace(`/(app)/invoices/${created.id}`)
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel criar a fatura.'))
    }
  }

  return (
    <MobileScreen eyebrow="Formulario" title="Nova fatura" description="Estrutura inicial do formulario mobile para faturas.">
      <FormSection title="Dados da fatura">
        <FormField label="Card ID" value={cardId} onChangeText={setCardId} />
        <FormField label="Mes" value={month} onChangeText={setMonth} keyboardType="numeric" />
        <FormField label="Ano" value={year} onChangeText={setYear} keyboardType="numeric" />
        <FormField label="Data de fechamento" value={closingDate} onChangeText={setClosingDate} placeholder="YYYY-MM-DD" />
        <FormField label="Data de vencimento" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
        <SubmitButton label="Salvar fatura" onPress={() => void handleSubmit()} loading={createInvoice.isPending} />
        <FeedbackText message={feedback} />
      </FormSection>
    </MobileScreen>
  )
}
