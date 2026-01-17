'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, CheckCircle2, Loader2, X, FileText, TrendingUp } from 'lucide-react'
import { processInvoiceUpload } from '@/server/actions/invoices'
import type { InvoiceItem } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InvoiceImporterProps {
  cardId: string
  month: number
  year: number
  onImportSuccess: (items: InvoiceItem[], metadata?: any) => void
}

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

type ProcessingStep = 'upload' | 'parse' | 'validate' | 'complete'

export function InvoiceImporter({ cardId, month, year, onImportSuccess }: InvoiceImporterProps) {
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('upload')
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [importedItemsCount, setImportedItemsCount] = useState(0)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    setSelectedFile(file)
    setStatus('uploading')
    setProcessingStep('upload')
    setError(null)
    setWarnings([])
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)
      formData.append('month', month.toString())
      formData.append('year', year.toString())
      
      // Simulando etapas de processamento para feedback visual
      setStatus('processing')
      setProcessingStep('parse')
      
      await new Promise(resolve => setTimeout(resolve, 500)) // UX delay para mostrar progresso
      
      setProcessingStep('validate')
      
      const result = await processInvoiceUpload(formData)
      
      if (!result.success) {
        setStatus('error')
        setError(result.error || 'Erro ao processar arquivo')
        if (result.details) {
          setWarnings(result.details)
        }
        return
      }
      
      setProcessingStep('complete')
      setStatus('success')
      setMetadata(result.data?.metadata)
      setImportedItemsCount(result.data?.items?.length || 0)
      
      if (result.data?.warnings) {
        setWarnings(result.data.warnings)
      }
      
      // Passa os itens para o componente pai
      if (result.data?.items) {
        onImportSuccess(result.data.items, result.data.metadata)
      }
    } catch (err) {
      setStatus('error')
      setError('Erro inesperado ao processar arquivo')
      console.error(err)
    }
  }, [cardId, month, year, onImportSuccess])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/x-ofx': ['.ofx'],
      'application/vnd.intu.qfx': ['.qfx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: status === 'uploading' || status === 'processing',
  })
  
  const handleReset = () => {
    setStatus('idle')
    setProcessingStep('upload')
    setError(null)
    setWarnings([])
    setSelectedFile(null)
    setMetadata(null)
    setImportedItemsCount(0)
  }
  
  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'upload':
        return 'Enviando arquivo...'
      case 'parse':
        return 'Analisando conteúdo...'
      case 'validate':
        return 'Validando transações...'
      case 'complete':
        return 'Finalizado!'
      default:
        return 'Processando...'
    }
  }
  
  const getProcessingProgress = () => {
    switch (processingStep) {
      case 'upload':
        return 25
      case 'parse':
        return 50
      case 'validate':
        return 75
      case 'complete':
        return 100
      default:
        return 0
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Fatura Automaticamente</CardTitle>
        <CardDescription>
          Faça upload do arquivo da fatura do seu banco para importação automática.
          Formatos suportados: PDF, CSV (Nubank, Inter), OFX/QFX (Genérico)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        {status === 'idle' && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Solte o arquivo aqui...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Arraste e solte o arquivo da fatura
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  PDF, CSV, OFX, QFX • Máximo 10MB
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Uploading/Processing */}
        {(status === 'uploading' || status === 'processing') && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {getProcessingProgress()}%
                  </span>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">{getProcessingMessage()}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile?.name}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${getProcessingProgress()}%` }}
              />
            </div>
            
            {/* Processing Steps */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className={`space-y-1 ${processingStep === 'parse' || processingStep === 'validate' || processingStep === 'complete' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center ${
                  processingStep === 'parse' || processingStep === 'validate' || processingStep === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium">Análise</p>
              </div>
              
              <div className={`space-y-1 ${processingStep === 'validate' || processingStep === 'complete' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center ${
                  processingStep === 'validate' || processingStep === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium">Validação</p>
              </div>
              
              <div className={`space-y-1 ${processingStep === 'complete' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center ${
                  processingStep === 'complete'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium">Conclusão</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success */}
        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-900">
                  Fatura importada com sucesso!
                </p>
                <p className="text-sm text-green-700 mt-1 truncate">
                  {selectedFile?.name}
                </p>
                
                {/* Import Summary */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-md p-3 border border-green-100">
                    <p className="text-xs text-green-700 font-medium">Itens Importados</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {importedItemsCount}
                    </p>
                  </div>
                  
                  {metadata?.totalAmount && (
                    <div className="bg-white rounded-md p-3 border border-green-100">
                      <p className="text-xs text-green-700 font-medium">Valor Total</p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(metadata.totalAmount)}
                      </p>
                    </div>
                  )}
                </div>
                
                {metadata && (
                  <div className="mt-3 space-y-1 text-sm">
                    {metadata.bankName && (
                      <p className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white text-green-800 border-green-200 font-medium">
                          {metadata.bankName}
                        </Badge>
                      </p>
                    )}
                    {metadata.statementPeriod && (
                      <p className="text-green-800">
                        <span className="font-medium">Período:</span> {metadata.statementPeriod}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Avisos durante importação:
                </p>
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-muted-foreground pl-6">
                      • {warning}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">
                  Erro ao processar fatura
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                
                {warnings.length > 0 && (
                  <div className="mt-3 space-y-1 text-sm">
                    {warnings.map((warning, index) => (
                      <p key={index} className="text-red-600">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button onClick={handleReset} variant="outline" className="w-full">
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
