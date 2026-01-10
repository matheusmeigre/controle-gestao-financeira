'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { processInvoiceUpload } from '@/server/actions/invoices'
import type { InvoiceItem } from '@/types/invoice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InvoiceImporterProps {
  cardId: string
  month: number
  year: number
  onImportSuccess: (items: InvoiceItem[], metadata?: any) => void
}

type ImportStatus = 'idle' | 'uploading' | 'success' | 'error'

export function InvoiceImporter({ cardId, month, year, onImportSuccess }: InvoiceImporterProps) {
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    setSelectedFile(file)
    setStatus('uploading')
    setError(null)
    setWarnings([])
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)
      formData.append('month', month.toString())
      formData.append('year', year.toString())
      
      const result = await processInvoiceUpload(formData)
      
      if (!result.success) {
        setStatus('error')
        setError(result.error || 'Erro ao processar arquivo')
        if (result.details) {
          setWarnings(result.details)
        }
        return
      }
      
      setStatus('success')
      setMetadata(result.data?.metadata)
      
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
    disabled: status === 'uploading',
  })
  
  const handleReset = () => {
    setStatus('idle')
    setError(null)
    setWarnings([])
    setSelectedFile(null)
    setMetadata(null)
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
        
        {/* Uploading */}
        {status === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Processando fatura...</p>
              <p className="text-sm text-muted-foreground">
                {selectedFile?.name}
              </p>
            </div>
          </div>
        )}
        
        {/* Success */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  Fatura importada com sucesso!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {selectedFile?.name}
                </p>
                
                {metadata && (
                  <div className="mt-3 space-y-1 text-sm">
                    {metadata.bankName && (
                      <p>
                        <span className="font-medium">Banco:</span> {metadata.bankName}
                      </p>
                    )}
                    {metadata.totalAmount && (
                      <p>
                        <span className="font-medium">Total:</span>{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(metadata.totalAmount)}
                      </p>
                    )}
                    {metadata.statementPeriod && (
                      <p>
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
