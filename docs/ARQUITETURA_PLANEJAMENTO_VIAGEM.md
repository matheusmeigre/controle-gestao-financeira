# Arquitetura de Planejamento Orientado a Domínio

## 📋 Visão Geral

Sistema de planejamento financeiro que trata cada tipo de planejamento (viagem, imóvel, reserva, estudo) como um **domínio específico** com regras, validações, campos e comportamentos próprios.

## 🎯 Princípios Arquiteturais

### 1. Domain-Driven Design (DDD)
- Cada tipo de planejamento é tratado como um **agregado** com comportamento próprio
- Regras de negócio centralizadas por tipo
- Linguagem ubíqua (ubiquitous language) no código

### 2. Separation of Concerns
- **Services Layer**: Lógica de integração (Nominatim, cálculos financeiros)
- **Components Layer**: UI reutilizável e agnóstica
- **Pages Layer**: Composição específica por tipo de planejamento

### 3. Progressive Enhancement
- API de geolocalização é opcional
- Sistema funciona sem dependências externas
- Fallback gracioso em todos os pontos

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── services/
│   │   └── nominatim.service.ts          # Serviço de geolocalização
│   └── financial-rules.ts                # Regras financeiras por tipo
│
├── components/
│   └── ui/
│       └── location-input.tsx            # Input híbrido de localização
│
└── app/
    └── (dashboard)/
        └── planning/
            └── [id]/
                └── edit/
                    └── page.tsx          # Página orientada a viagens
```

## 🧩 Componentes Principais

### 1. Nominatim Service (`nominatim.service.ts`)

**Responsabilidades:**
- Busca de localizações via OpenStreetMap
- Cache local de resultados (10 min)
- Rate limiting automático (1 req/s)
- Busca reversa (coordenadas → endereço)

**Características:**
```typescript
interface LocationResult {
  displayName: string
  city?: string
  state?: string
  country?: string
  lat?: number
  lon?: number
  type?: string
}
```

**Estratégias Implementadas:**
- ✅ Cache em memória (Map<string, LocationResult[]>)
- ✅ Timestamps para expiração
- ✅ Rate limiting com Promise-based delay
- ✅ User-Agent customizado
- ✅ Fallback silencioso em caso de erro

**Uso:**
```typescript
const results = await nominatimService.searchLocations("Guarapari")
```

### 2. Location Input (`location-input.tsx`)

**Modos de Operação:**
1. **Entrada Manual**: Campo de texto livre
2. **Autocomplete**: Busca assistida por API

**Features:**
- Debounce automático (500ms)
- Toggle entre modos
- Sugestões visuais
- Cache integrado
- Graceful degradation

**Props:**
```typescript
interface LocationInputProps {
  value?: LocationResult | null
  onChange?: (location: LocationResult | null) => void
  onManualInput?: (text: string) => void
  enableAutocomplete?: boolean  // Padrão: true
}
```

### 3. Financial Rules (`financial-rules.ts`)

**Função Principal:**
```typescript
calculateTravelFinancials(
  targetAmount: number,
  currentAmount: number,
  targetDate: string | null,
  numberOfPeople: number
): FinancialCalculation
```

**Retorna:**
```typescript
interface FinancialCalculation {
  remaining: number
  progress: number
  dailyRequired: number
  weeklyRequired: number
  monthlyRequired: number
  daysRemaining: number
  isAchievable: boolean
  alerts: FinancialAlert[]
}
```

**Alertas Contextuais:**
- ✅ Sucesso: Meta atingida
- ⚠️ Warning: Prazo apertado
- ❌ Error: Data no passado
- ℹ️ Info: Sugestões de economia

## 🎨 UX Flow - Tela de Edição de Viagem

### Hierarquia Visual

```
┌─────────────────────────────────────────────┐
│ 📍 IDENTIFICAÇÃO DA VIAGEM                  │
│ ├─ Nome da viagem                           │
│ ├─ Destino (com autocomplete)               │
│ ├─ Tipo (lazer/trabalho/estudo)            │
│ └─ Número de pessoas                        │
├─────────────────────────────────────────────┤
│ 💰 VALORES E PROGRESSO                      │
│ ├─ Custo total estimado                     │
│ ├─ Já economizado                           │
│ └─ Barra de progresso visual                │
├─────────────────────────────────────────────┤
│ 📅 PERÍODO DA VIAGEM                        │
│ ├─ Início da economia                       │
│ ├─ Data da viagem                           │
│ └─ Sugestão de aporte (calculado)          │
├─────────────────────────────────────────────┤
│ 📊 DETALHAMENTO DE CUSTOS (Opcional)        │
│ ├─ Passagens                                │
│ ├─ Hospedagem                               │
│ ├─ Alimentação                              │
│ ├─ Passeios                                 │
│ └─ Transporte                               │
├─────────────────────────────────────────────┤
│ 📝 OBSERVAÇÕES                              │
│ └─ Campo de texto livre                     │
└─────────────────────────────────────────────┘
```

### Microcopy Contextual

❌ **Genérico:** "Valor alvo"
✅ **Contextual:** "Custo total estimado da viagem"

❌ **Genérico:** "Data alvo"
✅ **Contextual:** "Data da viagem"

❌ **Genérico:** "Observações"
✅ **Contextual:** "Roteiro, reservas, dicas ou qualquer informação adicional"

## 🔄 Escalabilidade

### Como adicionar novo tipo de planejamento?

#### 1. Criar regras financeiras específicas

```typescript
// lib/financial-rules.ts
export function calculatePropertyFinancials(
  propertyValue: number,
  downPayment: number,
  loanTerm: number
): FinancialCalculation {
  // Lógica específica para imóvel
  // Considera financiamento, entrada, etc
}
```

#### 2. Criar página específica

```typescript
// app/planning/[id]/edit/page.tsx
const isProperty = planning.category === 'property'

if (isProperty) {
  return <PropertyEditForm planning={planning} />
}
```

#### 3. Criar campos específicos

```typescript
interface PropertyData {
  address: LocationResult
  propertyType: 'apartment' | 'house' | 'land'
  bedrooms: number
  financing: {
    downPayment: number
    loanTerm: number
    interestRate: number
  }
}
```

### Componentes Reutilizáveis

✅ **LocationInput**: Funciona para qualquer tipo (viagem, imóvel)
✅ **CurrencyInput**: Universal
✅ **DatePicker**: Universal
✅ **ProgressBar**: Adaptável por contexto

### Regras Centralizadas

```typescript
// lib/planning-rules.ts
export const PLANNING_RULES = {
  travel: {
    calculate: calculateTravelFinancials,
    validate: validateTravelData,
    minAdvanceDays: 30,
  },
  property: {
    calculate: calculatePropertyFinancials,
    validate: validatePropertyData,
    minDownPayment: 0.2, // 20%
  },
  // ... outros tipos
}
```

## 🚀 Benefícios da Arquitetura

### 1. Manutenibilidade
- Mudanças em um tipo não afetam outros
- Regras isoladas e testáveis
- Código autodocumentado

### 2. Escalabilidade
- Adicionar tipos sem refatorar
- Componentes reutilizáveis
- API contracts estáveis

### 3. UX Diferenciada
- Linguagem específica por domínio
- Validações contextuais
- Alertas inteligentes

### 4. Performance
- Cache inteligente
- Debounce automático
- Rate limiting integrado

### 5. Resiliência
- Funciona sem APIs externas
- Fallback em todos os níveis
- Graceful degradation

## 📊 Métricas de Sucesso

**Antes (Sistema Genérico):**
- Campos genéricos sem contexto
- Validações básicas
- UX confusa
- Difícil escalar

**Depois (Sistema Orientado a Domínio):**
- ✅ 5 seções contextuais
- ✅ 15+ validações específicas
- ✅ Alertas financeiros em tempo real
- ✅ Autocomplete de localização
- ✅ Cálculo automático de aportes
- ✅ Pronto para escalar para 10+ tipos

## 🔐 Segurança e Privacidade

### Geolocalização
- ❌ Não usa Google Maps (evita tracking)
- ✅ OpenStreetMap (open source, privacy-friendly)
- ✅ Nenhum dado enviado para terceiros
- ✅ Cache local (não persiste dados)

### Dados Financeiros
- Armazenamento local (localStorage)
- Isolamento por usuário (Clerk)
- Nenhuma API externa para cálculos

## 📝 Próximos Passos

### Curto Prazo
- [ ] Adicionar tipo "Imóvel"
- [ ] Adicionar tipo "Estudo"
- [ ] Melhorar cache (IndexedDB)

### Médio Prazo
- [ ] Integração com calendário
- [ ] Notificações de progresso
- [ ] Export de dados

### Longo Prazo
- [ ] Machine Learning para sugestões
- [ ] Comparação de preços
- [ ] Comunidade de viajantes

## 💡 Lições Aprendidas

1. **Orientação a Domínio > Genérico**: UX contextual aumenta engajamento
2. **Progressive Enhancement**: Sistema robusto funciona sem dependências
3. **Cache Inteligente**: Reduz latência e custos
4. **Microcopy Importa**: Linguagem clara melhora conversão
5. **Regras Centralizadas**: Facilita manutenção e evolução
