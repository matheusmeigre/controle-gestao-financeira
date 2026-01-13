/**
 * ====================================
 * 🧪 EXEMPLOS DE USO - OCR Service
 * ====================================
 * 
 * Este arquivo demonstra como usar a integração OCR
 * em diferentes cenários.
 * 
 * ⚠️ ATENÇÃO: Este arquivo é APENAS para documentação!
 * Os exemplos contêm código ilustrativo que pode não compilar
 * sem contexto adicional. Use-os como referência, não copie diretamente.
 */

// @ts-nocheck - Arquivo de documentação, não código de produção

import { OcrService } from '@/lib/services/ocr-service'
import { OcrParser } from '@/lib/parsers/ocr-parser'
import { parseInvoiceFile } from '@/lib/parsers'

// ====================================
// 📝 Exemplo 1: Uso Básico via Parser Factory (RECOMENDADO)
// ====================================

/**
 * Forma mais simples e recomendada
 * O factory escolhe automaticamente o melhor parser
 */
async function exemplo1_usoBasico() {
  // Obtém arquivo do input ou dropzone
  const file = document.querySelector('input[type="file"]').files[0]
  
  // Processa automaticamente
  const result = await parseInvoiceFile(file)
  
  if (result.success) {
    console.log('✅ Sucesso!')
    console.log('Transações:', result.transactions.length)
    console.log('Total:', result.metadata?.totalAmount)
    console.log('Banco:', result.metadata?.bankName)
    
    // Acessa transações
    result.transactions.forEach(t => {
      console.log(`${t.date.toLocaleDateString('pt-BR')}: ${t.description} - R$ ${t.amount.toFixed(2)}`)
    })
  } else {
    console.error('❌ Erro:', result.errors)
  }
}

// ====================================
// 📝 Exemplo 2: Uso Direto do OCR Parser
// ====================================

/**
 * Quando você quer garantir que está usando OCR
 * (não recomendado, use factory para fallback automático)
 */
async function exemplo2_ocrDireto() {
  const file = document.querySelector('input[type="file"]').files[0]
  
  const ocrParser = new OcrParser()
  
  // Verifica se pode processar
  const canParse = await ocrParser.canParse(file)
  
  if (!canParse) {
    console.error('Arquivo não é válido para OCR')
    return
  }
  
  // Processa
  const result = await ocrParser.parse(file)
  
  if (result.success) {
    console.log('✅ OCR processado!')
    console.log('Confiança:', result.metadata?.confidence)
    
    // Verifica warnings
    if (result.errors.length > 0) {
      console.warn('⚠️ Warnings:', result.errors)
    }
  }
}

// ====================================
// 📝 Exemplo 3: Uso em Server Action
// ====================================

/**
 * Como usar no contexto de uma Server Action
 * Este é o caso de uso principal (já implementado em invoices.ts)
 */
'use server'

import { auth } from '@clerk/nextjs/server'

async function exemplo3_serverAction(formData: FormData) {
  // 1. Autenticação
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: 'Não autenticado' }
  }
  
  // 2. Extrai arquivo
  const file = formData.get('file') as File
  
  // 3. Processa (OCR será usado automaticamente para PDFs)
  const parseResult = await parseInvoiceFile(file)
  
  // 4. Verifica sucesso
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Falha ao processar arquivo',
      details: parseResult.errors,
    }
  }
  
  // 5. Converte para formato da aplicação
  const items = parseResult.transactions.map(t => ({
    id: crypto.randomUUID(),
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category || 'Outros',
  }))
  
  // 6. Retorna resultado
  return {
    success: true,
    data: {
      items,
      metadata: parseResult.metadata,
      warnings: parseResult.errors,
    },
  }
}

// ====================================
// 📝 Exemplo 4: Tratamento de Erros Específicos
// ====================================

/**
 * Como tratar diferentes tipos de erro
 */
async function exemplo4_tratamentoErros() {
  const file = document.querySelector('input[type="file"]').files[0]
  
  try {
    const result = await parseInvoiceFile(file)
    
    if (!result.success) {
      // Analisa tipo de erro
      const errorMessage = result.errors[0]
      
      if (errorMessage.includes('Timeout')) {
        alert('⏱️ A API OCR está demorando. Tente novamente em alguns instantes.')
      } else if (errorMessage.includes('não reconhecido')) {
        alert('📄 Formato de arquivo não suportado. Use PDF, CSV, OFX ou QFX.')
      } else if (errorMessage.includes('muito grande')) {
        alert('📦 Arquivo muito grande. Máximo: 10MB')
      } else if (errorMessage.includes('vazio')) {
        alert('📭 Arquivo está vazio ou corrompido')
      } else {
        alert(`❌ Erro: ${errorMessage}`)
      }
      
      return
    }
    
    // Verifica warnings de confiança
    const hasLowConfidence = result.errors.some(e => e.includes('Confiança baixa'))
    
    if (hasLowConfidence) {
      const confirmar = confirm(
        '⚠️ A confiança do OCR está baixa. Os dados podem estar incorretos.\n\n' +
        'Deseja revisar os dados manualmente antes de prosseguir?'
      )
      
      if (!confirmar) {
        return
      }
    }
    
    // Prossegue com dados
    console.log('✅ Processamento concluído!')
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error)
    alert('Erro inesperado. Tente novamente ou contate o suporte.')
  }
}

// ====================================
// 📝 Exemplo 5: Uso com React State
// ====================================

/**
 * Como integrar com React e gerenciar estado
 */
import { useState } from 'react'

function Exemplo5Component() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  
  const handleFileUpload = async (file: File) => {
    setStatus('processing')
    setError(null)
    setWarnings([])
    
    try {
      const result = await parseInvoiceFile(file)
      
      if (!result.success) {
        setStatus('error')
        setError(result.errors.join('\n'))
        return
      }
      
      setStatus('success')
      setTransactions(result.transactions)
      setWarnings(result.errors) // Warnings do OCR
      
    } catch (err) {
      setStatus('error')
      setError('Erro inesperado ao processar arquivo')
    }
  }
  
  return (
    <div>
      {status === 'processing' && <p>Processando...</p>}
      {status === 'error' && <p className="error">{error}</p>}
      {status === 'success' && (
        <>
          <p className="success">✅ {transactions.length} transações extraídas!</p>
          
          {warnings.length > 0 && (
            <div className="warnings">
              <h4>⚠️ Atenção:</h4>
              {warnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}
          
          <ul>
            {transactions.map((t, i) => (
              <li key={i}>
                {t.description} - R$ {t.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ====================================
// 📝 Exemplo 6: Health Check da API OCR
// ====================================

/**
 * Como verificar se a API OCR está disponível
 */
async function exemplo6_healthCheck() {
  console.log('Verificando API OCR...')
  
  const isAvailable = await OcrService.isAvailable()
  
  if (isAvailable) {
    console.log('✅ API OCR está online')
  } else {
    console.log('❌ API OCR está offline ou inacessível')
    // Fallback: usar parsers tradicionais
  }
}

// ====================================
// 📝 Exemplo 7: Processamento em Lote
// ====================================

/**
 * Como processar múltiplos arquivos
 * (Cuidado: pode ser lento e consumir muitos recursos)
 */
async function exemplo7_processamentoLote(files: File[]) {
  const results = []
  
  for (const file of files) {
    console.log(`Processando: ${file.name}`)
    
    const result = await parseInvoiceFile(file)
    
    results.push({
      fileName: file.name,
      success: result.success,
      transactionCount: result.transactions.length,
      errors: result.errors,
    })
    
    // Pequeno delay entre requisições para não sobrecarregar API
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Relatório
  console.log('\n📊 Relatório de Processamento em Lote:')
  console.log(`Total de arquivos: ${files.length}`)
  console.log(`Sucessos: ${results.filter(r => r.success).length}`)
  console.log(`Falhas: ${results.filter(r => !r.success).length}`)
  
  return results
}

// ====================================
// 📝 Exemplo 8: Integração com FormData Completo
// ====================================

/**
 * Como criar FormData completo para upload
 */
async function exemplo8_formDataCompleto(
  file: File,
  cardId: string,
  month: number,
  year: number
) {
  // Cria FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('cardId', cardId)
  formData.append('month', month.toString())
  formData.append('year', year.toString())
  
  // Envia para Server Action
  const response = await fetch('/api/invoices/upload', {
    method: 'POST',
    body: formData,
    // NÃO define Content-Type - deixa browser definir com boundary
  })
  
  const result = await response.json()
  
  return result
}

// ====================================
// 📝 Exemplo 9: Mock para Testes
// ====================================

/**
 * Como mockar o OcrService em testes
 */
import { jest } from '@jest/globals'

// Mock bem-sucedido
jest.mock('@/lib/services/ocr-service', () => ({
  OcrService: {
    processInvoicePdf: jest.fn().mockResolvedValue({
      success: true,
      data: {
        bankName: 'Banco Teste',
        totalAmount: 1234.56,
        confidence: 0.95,
        items: [
          { date: new Date(), description: 'Compra Teste', amount: 100.0 },
        ],
      },
    }),
  },
}))

// Mock com erro
jest.mock('@/lib/services/ocr-service', () => ({
  OcrService: {
    processInvoicePdf: jest.fn().mockResolvedValue({
      success: false,
      error: 'Timeout: A API OCR demorou muito para responder',
    }),
  },
}))

// Mock com baixa confiança
jest.mock('@/lib/services/ocr-service', () => ({
  OcrService: {
    processInvoicePdf: jest.fn().mockResolvedValue({
      success: true,
      data: {
        confidence: 0.5, // Baixa confiança
        items: [...],
      },
      warnings: ['⚠️ Confiança baixa (50%). Revise os dados.'],
    }),
  },
}))

// ====================================
// 📝 Exemplo 10: Categorização Customizada
// ====================================

/**
 * Como adicionar categorização personalizada
 */
async function exemplo10_categorizacaoCustom() {
  const result = await parseInvoiceFile(file)
  
  if (!result.success) return
  
  // Re-categoriza transações com lógica custom
  const transactionsRecategorized = result.transactions.map(t => {
    let category = t.category
    
    // Regras customizadas
    if (t.description.includes('NETFLIX')) {
      category = 'Streaming'
    } else if (t.description.includes('GYMPASS')) {
      category = 'Academia'
    } else if (t.description.includes('UBER EATS') || t.description.includes('IFOOD')) {
      category = 'Delivery'
    }
    
    return { ...t, category }
  })
  
  console.log('Transações recategorizadas:', transactionsRecategorized)
}

// ====================================
// 🎯 Exportações (se quiser usar em outros arquivos)
// ====================================

export {
  exemplo1_usoBasico,
  exemplo2_ocrDireto,
  exemplo3_serverAction,
  exemplo4_tratamentoErros,
  Exemplo5Component,
  exemplo6_healthCheck,
  exemplo7_processamentoLote,
  exemplo8_formDataCompleto,
  exemplo10_categorizacaoCustom,
}
