# 🚀 Integração OCR - Melhores Práticas e Produção

## 📋 Checklist de Produção

Antes de colocar em produção, verificar:

### ✅ Segurança

- [ ] **API OCR é chamada apenas no servidor** (nunca no client)
- [ ] **Autenticação validada** em todas as Server Actions
- [ ] **Validação de entrada** (tipo, tamanho, formato)
- [ ] **Sanitização de dados** (descrições, valores)
- [ ] **Rate limiting** por usuário (recomendado: 10 uploads/hora)
- [ ] **Logs não expõem dados sensíveis** (sem PII)
- [ ] **HTTPS obrigatório** para upload de arquivos
- [ ] **Content Security Policy** configurado

### ✅ Performance

- [ ] **Timeout configurado** (90s é adequado)
- [ ] **Tamanho máximo de arquivo** (10MB é adequado)
- [ ] **Cache de resultados** (evitar reprocessar mesmo PDF)
- [ ] **Lazy loading** de parsers (imports dinâmicos)
- [ ] **Compressão de resposta** (gzip/brotli)
- [ ] **CDN para assets** (se houver)
- [ ] **Monitoramento de performance** (APM)

### ✅ Confiabilidade

- [ ] **Fallback para PDFParser** se OCR falhar
- [ ] **Retry logic** para erros transitórios (3 tentativas)
- [ ] **Circuit breaker** se API OCR estiver offline
- [ ] **Graceful degradation** (app funciona mesmo sem OCR)
- [ ] **Health checks** da API OCR
- [ ] **Alertas** para taxa de erro > 20%
- [ ] **Backups** de arquivos processados (opcional)

### ✅ UX

- [ ] **Loading states** claros e informativos
- [ ] **Progress bar** durante processamento (se possível)
- [ ] **Mensagens de erro** amigáveis e acionáveis
- [ ] **Warnings** destacados visualmente
- [ ] **Pré-visualização** antes de confirmar dados
- [ ] **Permitir edição** de transações extraídas
- [ ] **Suporte multi-idioma** (pt-BR, en-US)

### ✅ Observabilidade

- [ ] **Logs estruturados** (JSON, não texto)
- [ ] **Trace IDs** para debug distribuído
- [ ] **Métricas** (taxa de sucesso, latência, erros)
- [ ] **Dashboards** (Grafana, DataDog, etc.)
- [ ] **Alertas automáticos** (PagerDuty, Slack)
- [ ] **Error tracking** (Sentry, Rollbar)

---

## 🔐 Segurança Avançada

### 1. Rate Limiting por Usuário

```typescript
// lib/rate-limiter.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.UPSTASH_URL! })

export async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `ocr:ratelimit:${userId}`
  const current = await redis.get<number>(key)
  
  if (current && current >= 10) {
    return false // Excedeu limite
  }
  
  await redis.incr(key)
  await redis.expire(key, 3600) // 1 hora
  
  return true
}

// Uso em invoices.ts
const canProceed = await checkRateLimit(userId)
if (!canProceed) {
  return {
    success: false,
    error: 'Limite de uploads excedido. Tente novamente em 1 hora.'
  }
}
```

### 2. Validação de Conteúdo (PDF real, não malware)

```typescript
// lib/file-validator.ts
import { createHash } from 'crypto'

export function validatePdfMagicNumber(buffer: ArrayBuffer): boolean {
  const uint8 = new Uint8Array(buffer)
  
  // PDFs começam com "%PDF-"
  const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2D]
  
  for (let i = 0; i < pdfSignature.length; i++) {
    if (uint8[i] !== pdfSignature[i]) {
      return false
    }
  }
  
  return true
}

export function calculateFileHash(buffer: ArrayBuffer): string {
  const hash = createHash('sha256')
  hash.update(Buffer.from(buffer))
  return hash.digest('hex')
}
```

### 3. Sanitização de Output

```typescript
// lib/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeDescription(text: string): string {
  // Remove HTML/JavaScript
  const clean = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
  
  // Remove caracteres de controle
  return clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
}
```

---

## ⚡ Performance Otimizada

### 1. Cache com Redis

```typescript
// lib/cache/ocr-cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({ url: process.env.UPSTASH_URL! })

export async function cacheOcrResult(
  fileHash: string,
  result: OcrProcessedResult
): Promise<void> {
  const key = `ocr:result:${fileHash}`
  await redis.set(key, JSON.stringify(result), { ex: 86400 }) // 24h
}

export async function getCachedOcrResult(
  fileHash: string
): Promise<OcrProcessedResult | null> {
  const key = `ocr:result:${fileHash}`
  const cached = await redis.get<string>(key)
  
  if (!cached) return null
  
  return JSON.parse(cached)
}

// Uso em ocr-service.ts
static async processInvoicePdf(file: File): Promise<OcrProcessedResult> {
  // Calcula hash
  const buffer = await file.arrayBuffer()
  const hash = calculateFileHash(buffer)
  
  // Verifica cache
  const cached = await getCachedOcrResult(hash)
  if (cached) {
    console.log('[OcrService] ✅ Cache hit!')
    return cached
  }
  
  // Processa normalmente
  const result = await this.callOcrApi(file)
  
  // Salva em cache
  await cacheOcrResult(hash, result)
  
  return result
}
```

### 2. Fila de Processamento

```typescript
// lib/queue/ocr-queue.ts
import { Queue } from 'bullmq'

const ocrQueue = new Queue('ocr-processing', {
  connection: { host: process.env.REDIS_HOST }
})

export async function enqueueOcrJob(
  userId: string,
  fileId: string,
  file: File
): Promise<string> {
  const job = await ocrQueue.add('process-pdf', {
    userId,
    fileId,
    file: await file.arrayBuffer(),
  })
  
  return job.id
}

// Worker separado
// workers/ocr-worker.ts
import { Worker } from 'bullmq'

const worker = new Worker('ocr-processing', async job => {
  const { userId, fileId, file } = job.data
  
  const result = await OcrService.processInvoicePdf(file)
  
  // Notifica usuário via WebSocket ou polling
  await notifyUser(userId, { fileId, result })
  
  return result
})
```

### 3. Lazy Loading de Parsers

```typescript
// lib/parsers/index.ts
export class InvoiceParserFactory {
  private static readonly PARSERS: ParserConfig[] = [
    {
      type: 'pdf',
      parser: null, // Carrega sob demanda
      loaderFn: async () => (await import('./ocr-parser')).OcrParser,
      supportedExtensions: ['.pdf'],
      priority: 85,
    },
  ]
  
  static async parseInvoice(file: File): Promise<ParseResult> {
    for (const config of this.PARSERS) {
      // Lazy load
      if (!config.parser && config.loaderFn) {
        const ParserClass = await config.loaderFn()
        config.parser = new ParserClass()
      }
      
      if (await config.parser!.canParse(file)) {
        return await config.parser!.parse(file)
      }
    }
  }
}
```

---

## 🔄 Confiabilidade

### 1. Retry com Exponential Backoff

```typescript
// lib/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`[Retry] Tentativa ${attempt + 1} falhou. Aguardando ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError!
}

// Uso em ocr-service.ts
const result = await retryWithBackoff(
  () => this.callOcrApi(file),
  3, // 3 tentativas
  1000 // 1s inicial
)
```

### 2. Circuit Breaker

```typescript
// lib/circuit-breaker.ts
class CircuitBreaker {
  private failures = 0
  private lastFailTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minuto
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }
  
  private onFailure() {
    this.failures++
    this.lastFailTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
      console.error('[CircuitBreaker] OPEN - Too many failures')
    }
  }
}

// Uso
const circuitBreaker = new CircuitBreaker()

const result = await circuitBreaker.execute(() => 
  OcrService.processInvoicePdf(file)
)
```

### 3. Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { OcrService } from '@/lib/services/ocr-service'

export async function GET() {
  const checks = {
    api: 'unknown',
    database: 'unknown',
    ocr: 'unknown',
  }
  
  // Check OCR API
  try {
    const isAvailable = await OcrService.isAvailable()
    checks.ocr = isAvailable ? 'healthy' : 'unhealthy'
  } catch {
    checks.ocr = 'error'
  }
  
  // Check database (adicionar se usar DB)
  // checks.database = await checkDatabase()
  
  const isHealthy = Object.values(checks).every(v => v === 'healthy')
  
  return NextResponse.json(
    { status: isHealthy ? 'healthy' : 'degraded', checks },
    { status: isHealthy ? 200 : 503 }
  )
}
```

---

## 📊 Observabilidade

### 1. Logs Estruturados

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Uso
logger.info({
  event: 'ocr_processing',
  userId,
  fileId,
  fileName: file.name,
  fileSize: file.size,
}, 'Iniciando processamento OCR')

logger.error({
  event: 'ocr_failed',
  userId,
  fileId,
  error: error.message,
  stack: error.stack,
}, 'Falha no processamento OCR')
```

### 2. Métricas com Prometheus

```typescript
// lib/metrics.ts
import { Counter, Histogram, register } from 'prom-client'

export const ocrProcessingCounter = new Counter({
  name: 'ocr_processing_total',
  help: 'Total de processamentos OCR',
  labelNames: ['status', 'bank'],
})

export const ocrProcessingDuration = new Histogram({
  name: 'ocr_processing_duration_seconds',
  help: 'Duração do processamento OCR',
  buckets: [1, 5, 10, 30, 60, 90],
})

// Endpoint de métricas
// app/api/metrics/route.ts
export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType },
  })
}

// Uso em ocr-service.ts
const endTimer = ocrProcessingDuration.startTimer()

try {
  const result = await this.callOcrApi(file)
  ocrProcessingCounter.inc({ status: 'success', bank: result.data.bankName })
  return result
} catch (error) {
  ocrProcessingCounter.inc({ status: 'error', bank: 'unknown' })
  throw error
} finally {
  endTimer()
}
```

### 3. Error Tracking com Sentry

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
})

// Uso em ocr-service.ts
try {
  const result = await this.callOcrApi(file)
  return result
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      service: 'ocr',
      userId,
      fileId,
    },
    extra: {
      fileName: file.name,
      fileSize: file.size,
    },
  })
  
  throw error
}
```

---

## 🌐 Variáveis de Ambiente

Adicionar em `.env.local`:

```env
# OCR API
OCR_API_URL=https://ocr-api-leitura-financas.onrender.com
OCR_API_TIMEOUT=90000
OCR_MIN_CONFIDENCE=0.7
OCR_MAX_FILE_SIZE=10485760

# Cache (opcional)
UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=...

# Observabilidade (opcional)
SENTRY_DSN=https://...
LOG_LEVEL=info

# Rate Limiting (opcional)
MAX_UPLOADS_PER_HOUR=10
```

E em `.env.production`:

```env
OCR_API_URL=https://ocr-api-leitura-financas.onrender.com
OCR_API_TIMEOUT=90000
OCR_MIN_CONFIDENCE=0.8
OCR_MAX_FILE_SIZE=10485760
LOG_LEVEL=warn
MAX_UPLOADS_PER_HOUR=20
```

---

## 📱 Progressive Enhancement

A aplicação deve funcionar mesmo sem OCR:

```typescript
// lib/parsers/index.ts
export class InvoiceParserFactory {
  static async parseInvoice(file: File): Promise<ParseResult> {
    // Tenta OCR primeiro (se disponível)
    if (await this.isOcrAvailable()) {
      try {
        return await ocrParser.parse(file)
      } catch (error) {
        console.warn('[ParserFactory] OCR falhou, usando fallback')
      }
    }
    
    // Fallback para parsers tradicionais
    return await pdfParser.parse(file)
  }
}
```

---

## 🚀 Deploy

### Vercel

```json
// vercel.json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 300
    }
  },
  "env": {
    "OCR_API_URL": "@ocr_api_url",
    "OCR_API_TIMEOUT": "90000"
  }
}
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start"]
```

---

## ✅ Checklist Final

Antes do deploy:

- [ ] Testar em ambiente staging
- [ ] Executar todos os testes automatizados
- [ ] Verificar variáveis de ambiente
- [ ] Configurar rate limiting
- [ ] Configurar cache (Redis)
- [ ] Configurar monitoramento (Sentry, Datadog)
- [ ] Configurar alertas (Slack, email)
- [ ] Documentar troubleshooting
- [ ] Treinar equipe de suporte
- [ ] Preparar rollback plan

---

## 📞 Suporte em Produção

Se algo der errado:

1. **Verificar health check**: `/api/health`
2. **Verificar métricas**: `/api/metrics`
3. **Verificar logs**: Datadog/CloudWatch/Vercel
4. **Verificar Sentry**: Erros recentes
5. **Testar API OCR diretamente**: `curl` ou Postman
6. **Rollback** se necessário
7. **Post-mortem** após incidente

---

**Boa sorte em produção! 🚀**
