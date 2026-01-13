# 🧪 Como Testar a Integração OCR

## 🎯 Objetivo

Este guia mostra como testar a integração OCR implementada na aplicação de controle de gastos.

---

## ✅ Pré-requisitos

- [x] Node.js instalado
- [x] Dependências instaladas (`pnpm install`)
- [x] Clerk configurado (autenticação)
- [x] Aplicação rodando (`pnpm dev`)
- [x] Acesso à internet (para chamar API OCR)

---

## 🚀 Teste Rápido

### 1. Inicie a aplicação

```powershell
pnpm dev
```

### 2. Acesse a aplicação

```
http://localhost:3000
```

### 3. Faça login

Use suas credenciais do Clerk

### 4. Navegue até Cartões

```
http://localhost:3000/cards
```

### 5. Crie ou selecione um cartão

- Clique em "Novo Cartão" se ainda não tiver nenhum
- Preencha nome, limite, bandeira, banco

### 6. Acesse a fatura do cartão

- Clique no cartão criado
- Selecione um mês/ano
- Clique em "Importar Fatura"

### 7. Faça upload de um PDF

- Arraste um PDF de fatura do seu banco
- Ou clique para selecionar arquivo
- Aguarde o processamento (pode levar até 90s)

### 8. Verifique os resultados

✅ **Sucesso esperado:**
- Lista de transações aparece
- Cada transação tem: data, descrição, valor
- Categorias são sugeridas automaticamente
- Metadados mostram banco, total, confiança

⚠️ **Warnings possíveis:**
- "Confiança baixa" → Revisar dados manualmente
- "Total diverge da soma" → Verificar cálculos

❌ **Erros possíveis:**
- "Timeout" → Tentar novamente
- "Formato não reconhecido" → Usar outro formato
- "API OCR offline" → Aguardar alguns minutos

---

## 🧪 Testes Detalhados

### Teste 1: PDF Válido de Banco Conhecido

**Objetivo**: Verificar extração bem-sucedida

**Passos**:
1. Baixe PDF de fatura do Nubank, Inter, Itaú, etc.
2. Faça upload
3. Aguarde processamento

**Resultado esperado**:
- ✅ `success: true`
- ✅ Transações extraídas corretamente
- ✅ Banco identificado
- ✅ Total corresponde ao PDF
- ✅ Confiança > 70%

**Console esperado**:
```
[OcrService] Enviando PDF para OCR: fatura_nubank.pdf (1234.56 KB)
[OcrParser] Iniciando processamento OCR: fatura_nubank.pdf
[OcrParser] ✅ Sucesso! Transações extraídas: 42
[processInvoiceUpload] ✅ Sucesso!
├─ Transações: 42
├─ Total: R$ 1234.56
├─ Banco: Nubank
└─ Tempo: 12345ms
```

---

### Teste 2: PDF com Baixa Qualidade

**Objetivo**: Verificar warning de baixa confiança

**Passos**:
1. Use PDF escaneado ou com baixa resolução
2. Faça upload

**Resultado esperado**:
- ✅ `success: true` (ainda funciona)
- ⚠️ `warnings: ["Confiança baixa (65%). Revise os dados."]`
- ⚠️ Algumas transações podem estar incorretas

**Como lidar**:
- Revisar manualmente cada transação
- Ajustar valores/descrições se necessário
- Considerar baixar PDF de melhor qualidade

---

### Teste 3: Arquivo Não-PDF

**Objetivo**: Verificar validação de tipo

**Passos**:
1. Tente fazer upload de .txt, .docx, .jpg
2. Observar erro

**Resultado esperado**:
- ❌ `success: false`
- ❌ `error: "Apenas arquivos PDF são suportados pelo OCR"`

---

### Teste 4: PDF Muito Grande (> 10MB)

**Objetivo**: Verificar limite de tamanho

**Passos**:
1. Tente fazer upload de PDF > 10MB
2. Observar erro

**Resultado esperado**:
- ❌ `success: false`
- ❌ `error: "Arquivo muito grande (12.5MB). Máximo permitido: 10MB"`

**Solução**:
- Comprimir PDF
- Dividir em múltiplos arquivos
- Usar formato CSV ou OFX se disponível

---

### Teste 5: Timeout da API

**Objetivo**: Verificar tratamento de timeout

**Passos**:
1. API OCR pode demorar (hospedada no Render free tier)
2. Se demorar > 90s, timeout ocorre

**Resultado esperado**:
- ❌ `success: false`
- ❌ `error: "Timeout: A API OCR demorou muito para responder"`
- ❌ `warnings: ["A API pode estar sobrecarregada", "Tente novamente..."]`

**Solução**:
- Aguardar alguns minutos
- Tentar novamente
- API Render free tier "dorme" após inatividade, primeira chamada é lenta

---

### Teste 6: Fallback para PDFParser

**Objetivo**: Verificar que fallback funciona

**Passos**:
1. Se API OCR falhar completamente
2. Sistema tenta PDFParser tradicional

**Como forçar**:
- Temporariamente comentar OcrParser no `parsers/index.ts`
- Ou simular API offline

**Resultado esperado**:
- ✅ PDFParser processa o arquivo
- ✅ Transações extraídas (pode ter menos precisão)
- ℹ️ Parser usado: "PDF Parser (Enhanced)"

---

### Teste 7: CSV do Nubank

**Objetivo**: Verificar que CSVs continuam funcionando

**Passos**:
1. Baixe CSV de fatura do Nubank
2. Faça upload

**Resultado esperado**:
- ✅ NubankParser processa (prioridade maior que OCR)
- ✅ Transações extraídas
- ℹ️ Parser usado: "Nubank CSV Parser"

---

### Teste 8: OFX Genérico

**Objetivo**: Verificar parser OFX

**Passos**:
1. Baixe arquivo OFX ou QFX do banco
2. Faça upload

**Resultado esperado**:
- ✅ GenericOFXParser processa
- ✅ Transações extraídas

---

### Teste 9: Múltiplos Uploads Sequenciais

**Objetivo**: Verificar que não há vazamento de memória

**Passos**:
1. Faça upload de 5-10 PDFs seguidos
2. Observe uso de memória e tempo de resposta

**Resultado esperado**:
- ✅ Todos processam sem erro
- ✅ Tempo de resposta consistente
- ✅ Sem "memory leak"

---

### Teste 10: Validação de Categorização

**Objetivo**: Verificar categorização automática

**Passos**:
1. Fazer upload de PDF com transações conhecidas
2. Verificar categorias sugeridas

**Categorias esperadas**:
- "UBER" → Transporte
- "IFOOD" → Alimentação
- "NETFLIX" → Entretenimento
- "FARMACIA" → Saúde
- "SUPERMERCADO" → Supermercado
- etc.

**Ajuste se necessário**:
- Editar lógica em `ocr-parser.ts` → `categorizeTransaction()`

---

## 🔍 Debugging

### Ver Logs no Console

```powershell
# Terminal onde rodou `pnpm dev`
# Logs do servidor aparecem aqui
```

**Logs importantes**:
```
[OcrService] Enviando PDF para OCR...
[OcrParser] Iniciando processamento OCR...
[OcrParser] ✅ Sucesso! Transações extraídas: X
[processInvoiceUpload] ✅ Sucesso!
```

### Ver Logs no Browser

```javascript
// Abrir DevTools (F12)
// Aba Console
// Ver chamadas à Server Action
```

### Testar API OCR Diretamente

```powershell
# Via cURL
curl -X POST https://ocr-api-leitura-financas.onrender.com/extract `
  -F "file=@C:\caminho\para\fatura.pdf"

# Via PowerShell
$file = Get-Item "C:\caminho\para\fatura.pdf"
$form = @{
    file = $file
}
Invoke-RestMethod -Uri "https://ocr-api-leitura-financas.onrender.com/extract" -Method Post -Form $form
```

### Health Check da API

```powershell
# Verificar se API está online
curl https://ocr-api-leitura-financas.onrender.com/docs
# Deve retornar HTML da documentação Swagger
```

---

## 📊 Métricas de Sucesso

| Métrica | Objetivo | Como Medir |
|---------|----------|------------|
| **Taxa de Sucesso** | > 90% | Sucessos / Total de uploads |
| **Confiança Média** | > 80% | Média de `confidence` |
| **Tempo de Processamento** | < 30s | `processingTime` no log |
| **Precisão de Categorias** | > 70% | Categorias corretas / Total |
| **Fallback Rate** | < 10% | Vezes que usou PDFParser / Total PDFs |

---

## 🐛 Troubleshooting Comum

### Problema: "Não autenticado"

**Causa**: Usuário não logado ou sessão expirada

**Solução**:
```
1. Fazer logout
2. Fazer login novamente
3. Tentar upload novamente
```

### Problema: "Cartão e competência são obrigatórios"

**Causa**: FormData incompleto

**Solução**:
```
Verificar que InvoiceImporter está passando:
- cardId
- month
- year
```

### Problema: API OCR sempre timeout

**Causa**: API Render free tier dormindo

**Solução**:
```
1. Fazer requisição de "warm-up":
   curl https://ocr-api-leitura-financas.onrender.com/docs
   
2. Aguardar 10-20 segundos
3. Tentar upload novamente
```

### Problema: Transações duplicadas

**Causa**: Upload do mesmo arquivo múltiplas vezes

**Solução**:
```
Implementar detecção de duplicatas (TODO futuro):
- Comparar hash do arquivo
- Comparar transações com faturas existentes
```

### Problema: Categorias erradas

**Causa**: Lógica de categorização muito simples

**Solução**:
```
Editar lib/parsers/ocr-parser.ts:
- Adicionar mais padrões em categorizeTransaction()
- Ou integrar com LLM (Groq/OpenAI)
```

---

## ✅ Checklist de Teste Completo

Antes de fazer commit/deploy, verificar:

- [ ] Upload de PDF válido funciona
- [ ] Upload de CSV funciona
- [ ] Upload de OFX funciona
- [ ] Validação de tipo de arquivo funciona
- [ ] Validação de tamanho funciona
- [ ] Timeout é tratado corretamente
- [ ] Warnings de baixa confiança aparecem
- [ ] Categorização automática funciona
- [ ] Metadados são retornados corretamente
- [ ] Logs no servidor são claros
- [ ] Erros são mostrados de forma amigável
- [ ] Fallback para PDFParser funciona
- [ ] Múltiplos uploads sequenciais funcionam
- [ ] Não há vazamento de memória
- [ ] TypeScript compila sem erros

---

## 🎓 Próximos Passos

Após validar que tudo funciona:

1. **Testes Automatizados**
   - Criar testes unitários para OcrService
   - Criar testes de integração para processInvoiceUpload
   - Mockar API OCR nos testes

2. **Monitoramento**
   - Adicionar analytics para taxa de sucesso
   - Rastrear tempo de processamento
   - Alertar se taxa de erro > 20%

3. **Melhorias**
   - Cache de resultados (evitar reprocessar)
   - Fila de processamento (para uploads em lote)
   - Integração com LLM (melhorar categorização)
   - Detecção automática de parcelas

4. **Documentação**
   - Criar vídeo demonstrativo
   - Atualizar README principal
   - Documentar troubleshooting comum

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs no console do servidor
2. Verificar console do browser (DevTools)
3. Testar API OCR diretamente (curl)
4. Verificar documentação em `IMPLEMENTACAO_OCR.md`
5. Ver exemplos em `EXEMPLOS_OCR.tsx`

---

**Boa sorte com os testes! 🚀**
