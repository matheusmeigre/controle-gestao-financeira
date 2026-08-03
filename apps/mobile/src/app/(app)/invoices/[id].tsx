import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useInvoiceMutations, useInvoicesQuery } from '../../../hooks/use-mobile-queries'
import { formatMoney, getErrorMessage, parseCurrencyInput } from '../../../lib/mobile-ui'

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useInvoicesQuery()
  const invoice = (query.data ?? []).find((item) => item.id === id)
  const { addInvoiceItem, deleteInvoice, payInvoice, removeInvoiceItem } = useInvoiceMutations()
  const [paidAmount, setPaidAmount] = useState(String(invoice?.totalAmount ?? 0))
  const [itemDescription, setItemDescription] = useState('')
  const [itemAmount, setItemAmount] = useState('0')
  const [itemCategory, setItemCategory] = useState('Outros')
  const [itemDate, setItemDate] = useState('2026-08-01')
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleDelete() {
    try {
      setFeedback(null)
      await deleteInvoice.mutateAsync(id)
      router.replace('/(app)/invoices')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel excluir a fatura.'))
    }
  }

  async function handlePay() {
    try {
      setFeedback(null)
      await payInvoice.mutateAsync({ id, input: { paidAmount: parseCurrencyInput(paidAmount) } })
      setFeedback('Pagamento registrado com sucesso.')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel registrar o pagamento.'))
    }
  }

  async function handleAddItem() {
    try {
      setFeedback(null)
      await addInvoiceItem.mutateAsync({
        id,
        input: {
          item: {
            description: itemDescription,
            amount: parseCurrencyInput(itemAmount),
            category: itemCategory,
            date: itemDate,
          },
        },
      })
      setFeedback('Item adicionado com sucesso.')
      setItemDescription('')
      setItemAmount('0')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel adicionar o item.'))
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      setFeedback(null)
      await removeInvoiceItem.mutateAsync({ id, itemId })
      setFeedback('Item removido com sucesso.')
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Nao foi possivel remover o item.'))
    }
  }

  return (
    <MobileScreen eyebrow="Detalhe" title="Fatura" description="Tela de detalhe da fatura pronta para compor o fluxo autenticado.">
      <InfoCard label="ID" value={id} />
      {invoice ? (
        <>
          <InfoCard label="Competencia" value={`${invoice.month}/${invoice.year}`} />
          <InfoCard label="Fechamento" value={invoice.closingDate} />
          <InfoCard label="Vencimento" value={invoice.dueDate} />
          <InfoCard label="Valor total" value={formatMoney(invoice.totalAmount)} />
          <FormSection title="Registrar pagamento">
            <FormField label="Valor pago" value={paidAmount} onChangeText={setPaidAmount} keyboardType="numeric" />
            <SubmitButton label="Registrar pagamento" onPress={() => void handlePay()} loading={payInvoice.isPending} />
          </FormSection>
          <FormSection title="Adicionar item">
            <FormField label="Descricao" value={itemDescription} onChangeText={setItemDescription} />
            <FormField label="Valor" value={itemAmount} onChangeText={setItemAmount} keyboardType="numeric" />
            <FormField label="Categoria" value={itemCategory} onChangeText={setItemCategory} />
            <FormField label="Data" value={itemDate} onChangeText={setItemDate} placeholder="YYYY-MM-DD" />
            <SubmitButton label="Adicionar item" onPress={() => void handleAddItem()} loading={addInvoiceItem.isPending} />
          </FormSection>
          {invoice.items.map((item) => (
            <FormSection key={item.id} title={item.description}>
              <InfoCard label="Item" value={`${item.category} • ${item.date} • ${formatMoney(item.amount)}`} />
              <SubmitButton label={`Remover item ${item.description}`} onPress={() => void handleRemoveItem(item.id)} loading={removeInvoiceItem.isPending} tone="danger" />
            </FormSection>
          ))}
          <SubmitButton label="Excluir fatura" onPress={() => void handleDelete()} loading={deleteInvoice.isPending} tone="danger" />
          <FeedbackText message={feedback} tone={feedback?.includes('sucesso') ? 'success' : 'error'} />
        </>
      ) : <InfoCard label="Status" value="Fatura nao encontrada no cache atual." />}
    </MobileScreen>
  )
}
