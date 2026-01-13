# 🤖 Integração OCR - Extração Automática de Faturas

## 🎯 O que foi implementado?

Sistema completo de **extração automática de dados de faturas em PDF** usando OCR (Optical Character Recognition) com IA, integrado à aplicação de controle de gastos.

### ✨ Funcionalidades

- ✅ **Upload de PDF** → Extração automática de transações
- ✅ **Suporte universal** a bancos brasileiros (Nubank, Inter, Itaú, etc.)
- ✅ **Categorização automática** de transações por IA
- ✅ **Validação robusta** com Zod
- ✅ **Fallback inteligente** se OCR falhar (usa parser regex)
- ✅ **Warnings** para baixa confiança
- ✅ **Timeout configurável** (90s)
- ✅ **Server-side only** (seguro)

---

## 📦 Arquivos Criados

### 🔹 Core

| Arquivo | Descrição |
|---------|-----------|
| [`lib/services/ocr-service.ts`](../lib/services/ocr-service.ts) | 🔌 Integração com API OCR externa |
| [`lib/parsers/ocr-parser.ts`](../lib/parsers/ocr-parser.ts) | 🤖 Parser que usa OCR para PDFs |

### 🔹 Atualizados

| Arquivo | Mudança |
|---------|---------|
| [`lib/parsers/index.ts`](../lib/parsers/index.ts) | ➕ Adicionado OcrParser ao factory |
| [`server/actions/invoices.ts`](../server/actions/invoices.ts) | ✨ Melhorada validação e logs |
| [`types/invoice.ts`](../types/invoice.ts) | 📊 Tipos para OCR e metadados |

### 🔹 Documentação

| Arquivo | Conteúdo |
|---------|----------|
| [`IMPLEMENTACAO_OCR.md`](IMPLEMENTACAO_OCR.md) | 📖 Documentação técnica completa |
| [`EXEMPLOS_OCR.tsx`](EXEMPLOS_OCR.tsx) | 💡 10 exemplos práticos de uso |
| [`TESTE_OCR.md`](TESTE_OCR.md) | 🧪 Guia de testes detalhado |
| [`PRODUCAO_OCR.md`](PRODUCAO_OCR.md) | 🚀 Melhores práticas para produção |
| [`README_OCR.md`](README_OCR.md) | 📄 Este arquivo (resumo geral) |

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────┐
│              Fluxo de Processamento                  │
└──────────────────────────────────────────────────────┘

1. Usuário faz upload de PDF
   ↓
2. InvoiceImporter.tsx (Client)
   ↓
3. processInvoiceUpload (Server Action)
   ↓
4. InvoiceParserFactory (Strategy Pattern)
   ↓
5. OcrParser (para PDFs)
   ↓
6. OcrService → API OCR Externa
   ↓
7. Validação com Zod
   ↓
8. Normalização de dados
   ↓
9. Retorna transações estruturadas
   ↓
10. Exibe para usuário revisar
```

---

## 🔌 API OCR

**URL**: `https://ocr-api-leitura-financas.onrender.com`

**Endpoint**: `POST /extract`

**Request**:
```typescript
FormData {
  file: File // PDF da fatura
}
```

**Response**:
```json
{
  "success": true,
  "confidence": 0.85,
  "data": {
    "empresa": "Nubank",
    "valor_total": 1234.56,
    "itens": [
      {
        "descricao": "Compra ABC",
        "valor": 150.90,
        "data": "2025-01-03"
      }
    ]
  }
}
```

---

## 🚀 Como Usar

### Para Usuários

1. Acesse a página de faturas
2. Selecione cartão e mês
3. Clique em "Importar Fatura"
4. Faça upload do PDF
5. Aguarde processamento (até 90s)
6. Revise os dados extraídos
7. Confirme para salvar

### Para Desenvolvedores

```typescript
// Usar via factory (RECOMENDADO)
import { parseInvoiceFile } from '@/lib/parsers'

const result = await parseInvoiceFile(pdfFile)

if (result.success) {
  console.log('Transações:', result.transactions)
  console.log('Banco:', result.metadata?.bankName)
  console.log('Total:', result.metadata?.totalAmount)
}
```

Veja mais exemplos em [`EXEMPLOS_OCR.tsx`](EXEMPLOS_OCR.tsx).

---

## 🧪 Como Testar

### Teste Rápido

```powershell
# 1. Inicie a aplicação
pnpm dev

# 2. Acesse
http://localhost:3000

# 3. Faça login e navegue até Faturas

# 4. Faça upload de um PDF de fatura

# 5. Verifique os resultados
```

### Testes Detalhados

Consulte [`TESTE_OCR.md`](TESTE_OCR.md) para:
- ✅ Testes de sucesso
- ⚠️ Testes de warnings
- ❌ Testes de erro
- 🔄 Testes de fallback
- 📊 Métricas de qualidade

---

## 📊 Fluxo de Dados

```typescript
// 1. Upload (Client → Server)
const formData = new FormData()
formData.append('file', file)
formData.append('cardId', cardId)
formData.append('month', '12')
formData.append('year', '2025')

const result = await processInvoiceUpload(formData)

// 2. Processamento (Server)
// - Valida autenticação
// - Valida parâmetros
// - Chama parser factory
// - Parser factory escolhe OCR para PDFs
// - OCR chama API externa
// - API retorna dados estruturados
// - Valida com Zod
// - Normaliza datas/valores
// - Categoriza transações
// - Retorna resultado

// 3. Resultado
{
  success: true,
  data: {
    items: [...], // Transações extraídas
    metadata: {
      bankName: 'Nubank',
      totalAmount: 1234.56,
      confidence: 0.85,
      fileName: 'fatura.pdf',
      fileSize: 123456,
      itemCount: 42
    },
    warnings: [
      '✅ OCR processado com 85% de confiança'
    ]
  }
}
```

---

## 🔐 Segurança

### ✅ Implementado

- ✅ OCR executado apenas no servidor
- ✅ Validação de autenticação (Clerk)
- ✅ Validação de tipo de arquivo (apenas PDF)
- ✅ Validação de tamanho (máx 10MB)
- ✅ Timeout para evitar travamento
- ✅ Sanitização de descrições
- ✅ Valores sempre positivos
- ✅ Logs não expõem PII

### 🔜 Recomendado para Produção

- [ ] Rate limiting por usuário (ex: 10 uploads/hora)
- [ ] Validação de magic number do PDF
- [ ] Hash de arquivo para cache
- [ ] Circuit breaker se API OCR falhar muito
- [ ] WAF (Web Application Firewall)

Veja [`PRODUCAO_OCR.md`](PRODUCAO_OCR.md) para detalhes.

---

## ⚡ Performance

### Otimizações Implementadas

- ✅ Timeout de 90s (adequado para OCR)
- ✅ Tamanho máximo de 10MB
- ✅ Parsers ordenados por prioridade
- ✅ Fallback automático se OCR falhar

### Otimizações Futuras

- [ ] Cache com Redis (evita reprocessar mesmo PDF)
- [ ] Fila assíncrona para PDFs grandes
- [ ] Lazy loading de parsers
- [ ] Compressão de resposta

Veja [`PRODUCAO_OCR.md`](PRODUCAO_OCR.md) para implementação.

---

## 🐛 Troubleshooting

### Problema: Timeout

**Causa**: API OCR pode demorar (Render free tier)

**Solução**:
1. Aguardar alguns minutos
2. Tentar novamente
3. Primeira chamada "acorda" o servidor (pode demorar)

### Problema: Confiança baixa

**Causa**: PDF de baixa qualidade

**Solução**:
1. Exportar PDF novamente do app do banco
2. Revisar dados manualmente antes de salvar
3. Usar formato CSV ou OFX se disponível

### Problema: Nenhuma transação encontrada

**Causa**: PDF não é uma fatura válida

**Solução**:
1. Verificar se é PDF de fatura (não extrato)
2. Verificar se não está criptografado
3. Tentar outro formato

Veja [`TESTE_OCR.md`](TESTE_OCR.md) para mais troubleshooting.

---

## 📚 Documentação Completa

| Documento | Quando Usar |
|-----------|-------------|
| [`IMPLEMENTACAO_OCR.md`](IMPLEMENTACAO_OCR.md) | 📖 Entender a arquitetura e design |
| [`EXEMPLOS_OCR.tsx`](EXEMPLOS_OCR.tsx) | 💡 Ver exemplos de código |
| [`TESTE_OCR.md`](TESTE_OCR.md) | 🧪 Testar funcionalidades |
| [`PRODUCAO_OCR.md`](PRODUCAO_OCR.md) | 🚀 Preparar para deploy |
| [`README_OCR.md`](README_OCR.md) | 📄 Visão geral rápida |

---

## 📈 Roadmap Futuro

### Curto Prazo (1-2 semanas)
- [ ] Testes automatizados
- [ ] Cache de resultados
- [ ] Rate limiting

### Médio Prazo (1-2 meses)
- [ ] Fila de processamento
- [ ] Dashboard de métricas
- [ ] Integração com LLM (melhorar categorização)

### Longo Prazo (3+ meses)
- [ ] Detecção automática de parcelas
- [ ] Agrupamento inteligente
- [ ] Suporte a múltiplos idiomas
- [ ] API pública

---

## 🎓 Tecnologias Utilizadas

- **Next.js 14** (App Router)
- **TypeScript** (tipagem forte)
- **Server Actions** (processamento server-side)
- **Zod** (validação de schemas)
- **Clerk** (autenticação)
- **API OCR Externa** (IA para extração)

---

## 📝 Notas Importantes

### ⚠️ Limitações Conhecidas

1. **API OCR Free Tier**
   - Pode "dormir" após inatividade (primeira chamada demora)
   - Rate limit não conhecido (assumir conservador)
   - Uptime não garantido (SLA desconhecido)

2. **Precisão do OCR**
   - Depende da qualidade do PDF
   - Bancos com layout não-padrão podem ter baixa confiança
   - Sempre revisar dados antes de salvar

3. **Performance**
   - PDFs grandes podem demorar (até 90s)
   - Sem processamento em lote nativo
   - Sem cache implementado (ainda)

### ✅ Próximos Passos Recomendados

1. **Testes em Staging**
   - Testar com PDFs de todos os bancos principais
   - Medir taxa de sucesso e confiança média
   - Validar performance e timeout

2. **Adicionar Monitoramento**
   - Sentry para error tracking
   - Datadog/Grafana para métricas
   - Alertas para taxa de erro alta

3. **Implementar Cache**
   - Redis/Upstash para cache de resultados
   - Evitar reprocessar mesmo PDF
   - Reduzir custos da API OCR

4. **Melhorar UX**
   - Progress bar durante processamento
   - Preview de PDF antes do upload
   - Permitir edição inline de transações

---

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Leia [`IMPLEMENTACAO_OCR.md`](IMPLEMENTACAO_OCR.md)
2. Veja [`EXEMPLOS_OCR.tsx`](EXEMPLOS_OCR.tsx)
3. Execute testes em [`TESTE_OCR.md`](TESTE_OCR.md)
4. Siga boas práticas em [`PRODUCAO_OCR.md`](PRODUCAO_OCR.md)

---

## 📞 Suporte

Se encontrar problemas:

1. 📖 Consulte a documentação
2. 🧪 Execute os testes
3. 🔍 Verifique os logs
4. 🐛 Abra uma issue no GitHub

---

## ✅ Checklist de Implementação

- [x] Criar `OcrService` com integração à API
- [x] Criar `OcrParser` implementando `InvoiceParser`
- [x] Adicionar ao `InvoiceParserFactory`
- [x] Melhorar `processInvoiceUpload` Server Action
- [x] Adicionar tipos TypeScript
- [x] Validação com Zod
- [x] Tratamento de erros e timeout
- [x] Categorização automática
- [x] Warnings para baixa confiança
- [x] Documentação completa
- [x] Exemplos práticos
- [x] Guia de testes
- [x] Melhores práticas de produção

---

## 🎉 Resultado Final

✅ **Sistema completo de OCR implementado!**

O usuário agora pode:
1. Fazer upload de um PDF de fatura de qualquer banco
2. Ter os dados extraídos automaticamente via IA
3. Revisar as transações extraídas
4. Ajustar categorias se necessário
5. Confirmar e salvar

**Sem necessidade de:**
- ❌ Digitar manualmente cada transação
- ❌ Configurar templates específicos por banco
- ❌ Instalar software adicional
- ❌ Conhecimentos técnicos

---

**Desenvolvido com ❤️ para simplificar o controle financeiro**

**Versão**: 1.0.0  
**Data**: Janeiro 2026  
**Status**: ✅ Pronto para testes
