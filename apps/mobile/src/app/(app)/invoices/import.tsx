import * as DocumentPicker from 'expo-document-picker'
import { useState } from 'react'
import { FeedbackText, FormField, FormSection, SubmitButton } from '../../../components/mobile-form'
import { MobileScreen, InfoCard } from '../../../components/mobile-screen'
import { useInvoiceImportPreviewMutation } from '../../../hooks/use-invoice-import-preview'
import { getErrorMessage, formatMoney, parseIntegerInput } from '../../../lib/mobile-ui'
import { validateInvoiceImportFile } from '../../../lib/invoice-import'

export default function InvoiceImportScreen() {
  const previewMutation = useInvoiceImportPreviewMutation()
  const [cardId, setCardId] = useState('')
  const [month, setMonth] = useState('8')
  const [year, setYear] = useState('2026')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)

  async function handlePickDocument() {
    setFeedback(null)

    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
      type: [
        'application/pdf',
        'text/csv',
        'application/x-ofx',
        'application/vnd.intu.qfx',
      ],
    })

    if (result.canceled) {
      return
    }

    const asset = result.assets[0]
    const validationError = validateInvoiceImportFile(asset)

    if (validationError) {
      setSelectedFile(null)
      setFeedback(validationError)
      return
    }

    const response = await fetch(asset.uri)
    const blob = await response.blob()
    const file = new File([blob], asset.name, { type: asset.mimeType ?? 'application/octet-stream' })

    setSelectedFile(file)
    setFeedback(`Arquivo selecionado: ${asset.name}`)
  }

  async function handlePreview() {
    if (!selectedFile) {
      setFeedback('Selecione um arquivo antes de enviar.')
      return
    }

    try {
      setFeedback(null)
      setProgressLabel('Enviando arquivo para preview...')

      await previewMutation.mutateAsync({
        file: selectedFile,
        cardId,
        month: parseIntegerInput(month),
        year: parseIntegerInput(year),
      })

      setProgressLabel('Preview concluido.')
    } catch (error) {
      setProgressLabel(null)
      setFeedback(getErrorMessage(error, 'Nao foi possivel processar o preview da importacao.'))
    }
  }

  function handleReset() {
    previewMutation.reset()
    setSelectedFile(null)
    setProgressLabel(null)
    setFeedback(null)
  }

  return (
    <MobileScreen eyebrow="Importacao" title="Importar fatura" description="Selecione um arquivo do dispositivo, valide localmente e gere um preview antes de persistir.">
      <FormSection title="Arquivo e parametros">
        <SubmitButton label="Selecionar arquivo" onPress={() => void handlePickDocument()} />
        <FormField label="Card ID" value={cardId} onChangeText={setCardId} />
        <FormField label="Mes" value={month} onChangeText={setMonth} keyboardType="numeric" />
        <FormField label="Ano" value={year} onChangeText={setYear} keyboardType="numeric" />
        <SubmitButton label="Gerar preview" onPress={() => void handlePreview()} loading={previewMutation.isPending} />
        <SubmitButton label="Cancelar / limpar" onPress={handleReset} tone="danger" />
        <FeedbackText message={progressLabel} tone="success" />
        <FeedbackText message={feedback} tone={feedback?.startsWith('Arquivo selecionado') ? 'success' : 'error'} />
      </FormSection>

      {previewMutation.data ? (
        <FormSection title="Preview importado">
          <InfoCard label="Arquivo" value={previewMutation.data.metadata.fileName} />
          <InfoCard label="Itens detectados" value={String(previewMutation.data.metadata.itemCount)} />
          <InfoCard label="Periodo" value={`${previewMutation.data.metadata.month}/${previewMutation.data.metadata.year}`} />
          {previewMutation.data.metadata.totalAmount !== undefined ? (
            <InfoCard label="Total detectado" value={formatMoney(previewMutation.data.metadata.totalAmount)} />
          ) : null}
          {previewMutation.data.warnings?.map((warning) => (
            <InfoCard key={warning} label="Aviso" value={warning} />
          ))}
          {previewMutation.data.items.map((item) => (
            <InfoCard key={item.id} label={item.description} value={`${item.category} • ${item.date} • ${formatMoney(item.amount)}`} />
          ))}
        </FormSection>
      ) : null}
    </MobileScreen>
  )
}
