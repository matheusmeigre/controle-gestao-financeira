# 📊 Módulo de Planejamento Financeiro - Documentação Completa

## 🎯 Visão Geral

O módulo de **Planejamento Financeiro** foi implementado como uma feature completa e isolada seguindo os padrões arquiteturais estabelecidos no sistema de gestão financeira pessoal.

### Características Principais

✅ **Arquitetura Feature-Based** - Módulo totalmente isolado e reutilizável  
✅ **TypeScript Strict** - Tipagem forte sem uso de `any`  
✅ **Repository Pattern** - Abstração da camada de persistência  
✅ **Service Layer** - Lógica de negócio centralizada  
✅ **Server Actions** - Integração segura cliente/servidor  
✅ **Hooks Customizados** - Gerenciamento de estado otimizado  
✅ **UI Consistente** - Design system seguindo padrões existentes  
✅ **Responsivo** - Funciona em mobile, tablet e desktop  

---

## 📁 Estrutura de Arquivos

```
src/features/planning/
├── index.ts                          # Barrel export
├── types.ts                          # Tipos e schemas TypeScript/Zod
├── hooks/
│   └── use-plannings.ts              # Hooks customizados
├── services/
│   ├── planning.repository.ts        # Camada de persistência
│   └── planning.service.ts           # Lógica de negócio
└── components/
    ├── PlanningForm.tsx              # Formulário de criação/edição
    ├── PlanningCard.tsx              # Card individual de planejamento
    ├── PlanningList.tsx              # Lista com filtros
    ├── PlanningSummary.tsx           # Resumo estatístico
    └── PlanningAlerts.tsx            # Alertas de atenção

src/server/actions/
└── planning.ts                       # Server Actions

src/app/(dashboard)/
└── planning/
    ├── page.tsx                      # Página principal
    ├── new/
    │   └── page.tsx                  # Criar novo planejamento
    └── [id]/
        └── page.tsx                  # Detalhes e edição
```

---

## 🏗️ Arquitetura

### 1. Camada de Tipos (`types.ts`)

Define todos os tipos, interfaces e validações com Zod:

**Principais Tipos:**
- `Planning` - Interface principal do planejamento
- `PlanningStatus` - Estados: `planned`, `in_progress`, `completed`, `cancelled`
- `PlanningCategory` - Categorias: viagem, compra, emergência, etc.
- `PlanningIndicators` - Métricas calculadas (progresso, atrasos, etc.)
- `PlanningSummary` - Resumo estatístico geral

**Schemas Zod:**
- `planningSchema` - Validação completa
- `createPlanningSchema` - Para criação (sem id/userId)
- `updatePlanningSchema` - Para atualização (campos opcionais)

### 2. Repository (`planning.repository.ts`)

Extende `BaseRepository` para aproveitar funcionalidades comuns:

**Métodos Principais:**
```typescript
findAll(userId)              // Busca todos
findByStatus(userId, status) // Filtra por status
findByCategory(userId, cat)  // Filtra por categoria
findActive(userId)           // Apenas ativos
findDelayed(userId)          // Atrasados
findOverBudget(userId)       // Orçamento estourado
linkExpense(...)             // Vincula gasto
unlinkExpense(...)           // Desvincula gasto
```

### 3. Service (`planning.service.ts`)

Contém toda a lógica de negócio:

**Operações CRUD:**
```typescript
createPlanning(userId, data)        // Cria com validações
updatePlanning(userId, data)        // Atualiza com regras
deletePlanning(userId, id)          // Soft delete (cancelar)
getPlanningById(userId, id)         // Busca individual
getAllPlannings(userId)             // Lista completa
```

**Operações Especiais:**
```typescript
addAmount(userId, id, amount)       // Adiciona valor
linkExpense(...)                    // Vincula e atualiza valor
unlinkExpense(...)                  // Desvincula e atualiza
markAsCompleted(userId, id)         // Marca como completo
markAsCancelled(userId, id)         // Cancela planejamento
```

**Cálculos:**
```typescript
calculateIndicators(planning)       // Calcula métricas
getSummary(userId)                  // Resumo geral
getDelayedPlannings(userId)         // Lista atrasados
getOverBudgetPlannings(userId)      // Lista estourados
```

### 4. Server Actions (`planning.ts`)

Actions serverless para operações seguras:

```typescript
createPlanning(input)               // Cria com validação de auth
updatePlanning(input)               // Atualiza com validação
deletePlanning(id)                  // Remove
getPlannings()                      // Lista (auth)
linkExpenseToPlan(...)              // Vincula gasto
markPlanningAsCompleted(id)         // Completa
markPlanningAsCancelled(id)         // Cancela
```

### 5. Hooks Customizados (`use-plannings.ts`)

**Hook Principal: `usePlannings(filters?)`**
```typescript
const {
  plannings,              // Lista de planejamentos
  loading,                // Estado de carregamento
  error,                  // Erros
  refresh,                // Recarrega dados
  createPlanning,         // Função criar
  updatePlanning,         // Função atualizar
  deletePlanning,         // Função deletar
  addAmount,              // Adiciona valor
  linkExpense,            // Vincula gasto
  unlinkExpense,          // Desvincula gasto
  markAsCompleted,        // Marca completo
  markAsCancelled,        // Cancela
} = usePlannings()
```

**Hooks Auxiliares:**
- `usePlanning(id)` - Busca individual
- `usePlanningIndicators(planning)` - Calcula indicadores
- `usePlanningSummary()` - Resumo estatístico
- `useDelayedPlannings()` - Lista atrasados
- `useOverBudgetPlannings()` - Lista estourados

---

## 🎨 Componentes de UI

### 1. PlanningForm

Formulário completo para criar/editar planejamentos.

**Props:**
```typescript
interface PlanningFormProps {
  onSubmit: (data: CreatePlanningInput) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CreatePlanningInput>
  mode?: 'create' | 'edit'
}
```

**Validações:**
- Nome obrigatório (3-100 caracteres)
- Valor alvo > 0
- Datas válidas
- Data alvo > data início
- Notas opcionais (máx 500 chars)

### 2. PlanningCard

Card visual com todas as informações do planejamento.

**Features:**
- Badge de status colorido
- Barra de progresso visual
- Valores atual e alvo
- Alertas visuais (atraso/estourado)
- Countdown de dias restantes
- Ícone da categoria

### 3. PlanningList

Lista com filtros e busca.

**Filtros Disponíveis:**
- Status (todos, planejado, em progresso, completo, cancelado)
- Categoria (todas ou específica)
- Busca por nome/notas
- Data de início (range)

### 4. PlanningSummary

Cards estatísticos usando `StatCard`:
- Total de planejamentos
- Em progresso
- Completados
- Meta total

### 5. PlanningAlerts

Alertas contextuais no dashboard:
- Planejamentos atrasados
- Orçamento estourado
- Link direto para a página

---

## 🔄 Fluxo de Dados

### Criação de Planejamento

```
1. Usuário preenche PlanningForm
2. Validação client-side (Zod)
3. Hook usePlannings chama createPlanning
4. Service valida regras de negócio
5. Repository salva no localStorage
6. Hook atualiza estado local
7. UI reflete mudanças
```

### Vinculação com Gastos

```
1. Gasto criado normalmente
2. Usuário vincula a um planejamento
3. Service:
   - Adiciona ID do gasto ao array linkedExpenseIds
   - Soma valor do gasto ao currentAmount
   - Recalcula status automaticamente
   - Atualiza updatedAt
4. Se atingir meta → status = completed
```

### Cálculo de Indicadores

```typescript
calculateIndicators(planning) {
  // Progresso percentual
  progress = (currentAmount / targetAmount) * 100
  
  // Verifica estourado
  isOverBudget = currentAmount > targetAmount
  
  // Verifica atraso
  if (targetDate) {
    daysRemaining = targetDate - today
    isDelayed = daysRemaining < 0 && !completed
  }
  
  return { progress, isOverBudget, isDelayed, ... }
}
```

---

## 🎯 Regras de Negócio Implementadas

### 1. Status Automático

O sistema determina automaticamente o status baseado nos valores:

```typescript
- currentAmount === 0          → PLANNED
- 0 < currentAmount < target   → IN_PROGRESS
- currentAmount >= target      → COMPLETED
- Cancelamento manual          → CANCELLED
```

### 2. Validações

**Criação:**
- Nome: 3-100 caracteres, obrigatório
- Valor alvo: > 0, obrigatório
- Valor atual: >= 0, padrão 0
- Data início: válida, obrigatório
- Data alvo: válida, > data início, opcional

**Atualização:**
- Mesmas validações
- Status não pode ser alterado de CANCELLED manualmente
- Progresso recalculado automaticamente

### 3. Soft Delete

Ao deletar:
- Se status != COMPLETED → marca como CANCELLED
- Se status === COMPLETED → hard delete

### 4. Integridade

- Valores sempre >= 0
- Datas sempre válidas
- Status consistente com valores
- LinkedExpenseIds sempre array (nunca null/undefined)

---

## 🚀 Como Usar

### 1. Criar Novo Planejamento

```typescript
// Em um componente
import { usePlannings } from '@/features/planning'

function MyComponent() {
  const { createPlanning } = usePlannings()
  
  const handleCreate = async () => {
    await createPlanning({
      name: 'Viagem para Paris',
      category: 'travel',
      targetAmount: 15000,
      currentAmount: 0,
      startDate: '2026-01-24',
      targetDate: '2026-12-31',
      notes: 'Economizar para as férias'
    })
  }
}
```

### 2. Listar com Filtros

```typescript
import { usePlannings } from '@/features/planning'

const { plannings, loading } = usePlannings({
  status: 'in_progress',
  category: 'travel',
  search: 'viagem'
})
```

### 3. Adicionar Valor

```typescript
const { addAmount } = usePlannings()

await addAmount('planning-id', 500) // Adiciona R$ 500
```

### 4. Exibir Alertas

```typescript
import { PlanningAlerts } from '@/features/planning'

function Dashboard() {
  return (
    <div>
      <PlanningAlerts /> {/* Mostra automaticamente se houver alertas */}
    </div>
  )
}
```

---

## 🔗 Integração com o Sistema

### Navegação Adicionada

**Dashboard Principal:**
- Novo botão "Planejamento" ao lado de "Gestão de Cartões"
- Componente `PlanningAlerts` exibindo avisos

**Página de Cartões:**
- Link para `/planning` na navegação

**Página de Faturas:**
- Link para `/planning` na navegação

### Rotas Criadas

```
/planning              → Lista de planejamentos
/planning/new          → Criar novo
/planning/[id]         → Detalhes e ações
/planning/[id]/edit    → Editar (futuro)
```

---

## 📊 Métricas e Indicadores

### Indicadores por Planejamento

```typescript
interface PlanningIndicators {
  progress: number          // 0-100%
  isOverBudget: boolean     // Estourou orçamento?
  isDelayed: boolean        // Está atrasado?
  isCompleted: boolean      // Finalizado?
  isCancelled: boolean      // Cancelado?
  daysRemaining?: number    // Dias até data alvo
  amountRemaining: number   // Quanto falta
}
```

### Resumo Geral

```typescript
interface PlanningSummary {
  total: number              // Total de planejamentos
  planned: number            // Quantidade planejados
  inProgress: number         // Em progresso
  completed: number          // Completados
  cancelled: number          // Cancelados
  totalTargetAmount: number  // Soma de todas as metas
  totalCurrentAmount: number // Soma de todos os valores atuais
  totalProgress: number      // Progresso geral %
}
```

---

## 🎨 Design e UX

### Cores por Status

- **Planejado** (planned): Roxo
- **Em Progresso** (in_progress): Azul
- **Completo** (completed): Verde
- **Cancelado** (cancelled): Cinza

### Cores de Alertas

- **Atraso**: Laranja
- **Orçamento Estourado**: Vermelho

### Responsividade

- Mobile: Cards em coluna única
- Tablet: Grid 2 colunas
- Desktop: Grid 3 colunas
- Textos adaptáveis com breakpoints

---

## 🔐 Segurança e Privacidade

### Autenticação

- Todas as Server Actions validam `auth()` do Clerk
- Dados isolados por `userId`
- Nenhuma operação sem autenticação

### Validação

- Client-side: Zod schemas
- Server-side: Actions validam novamente
- Service layer: Regras de negócio

### Armazenamento

- LocalStorage isolado por usuário
- Formato: `plannings_${userId}`
- Serialização/deserialização automática de datas

---

## 🧪 Testabilidade

A arquitetura facilita testes:

```typescript
// Testar Service isoladamente
const service = new PlanningService()
const planning = await service.createPlanning(userId, data)
expect(planning.status).toBe('planned')

// Testar Repository
const repo = new PlanningRepository()
const plannings = await repo.findActive(userId)
expect(plannings).toHaveLength(2)

// Testar cálculos
const indicators = service.calculateIndicators(planning)
expect(indicators.progress).toBe(50)
```

---

## 🚀 Próximas Melhorias (Futuro)

### Curto Prazo
- [ ] Página de edição dedicada
- [ ] Histórico de alterações
- [ ] Exportar planejamentos para Excel/CSV
- [ ] Gráficos de evolução temporal

### Médio Prazo
- [ ] Automação: transferir valor de renda para planejamento
- [ ] Metas mensais/semanais automáticas
- [ ] Notificações push quando próximo da meta
- [ ] Comparação entre planejamentos

### Longo Prazo
- [ ] Integração com banco de dados real
- [ ] Planejamentos compartilhados (família)
- [ ] IA para sugestões de economia
- [ ] Previsão de alcance de meta baseado em histórico

---

## 📝 Convenções Adotadas

### Nomenclatura
- **Componentes**: PascalCase (`PlanningForm`)
- **Hooks**: camelCase com prefixo `use` (`usePlannings`)
- **Types**: PascalCase (`Planning`, `PlanningStatus`)
- **Constants**: UPPER_SNAKE_CASE (`PLANNING_STATUS`)

### Estrutura de Arquivos
- Componentes: `/components/NomeDoComponente.tsx`
- Hooks: `/hooks/use-nome-do-hook.ts`
- Services: `/services/nome.service.ts`
- Types: Centralizados em `types.ts`

### Git
- Commits semânticos: `feat:`, `fix:`, `refactor:`
- Branch: `feature/planning-module`

---

## 📚 Dependências

### Principais
- `next` - Framework
- `react` - UI
- `typescript` - Tipagem
- `zod` - Validação
- `@clerk/nextjs` - Autenticação
- `lucide-react` - Ícones

### Internas
- `@/components/ui/*` - Design system
- `@/lib/repositories/base.repository` - Repository base
- `@/hooks/use-toast` - Notificações

---

## 🎓 Lições Aprendidas

1. **Arquitetura Feature-Based funciona**: Isolamento total facilita manutenção
2. **Repository Pattern vale a pena**: Migração futura para DB será trivial
3. **Hooks customizados simplificam componentes**: Lógica centralizada
4. **Zod é essencial**: Validação robusta client + server
5. **TypeScript strict evita bugs**: Zero `any` usado

---

## 📞 Suporte

Para dúvidas sobre o módulo:
1. Consulte esta documentação
2. Veja exemplos em `/features/expenses` ou `/features/cards`
3. Revise os testes em `/tests/features/planning`

---

## ✅ Checklist de Implementação

- [x] Estrutura de tipos e schemas
- [x] Repository com BaseRepository
- [x] Service com lógica de negócio
- [x] Server Actions
- [x] Hooks customizados
- [x] Componentes de UI
- [x] Páginas de rotas
- [x] Integração com navegação
- [x] Alertas no dashboard
- [x] Responsividade
- [x] Tema claro/escuro
- [x] Validações completas
- [x] Documentação

**Status: ✅ MÓDULO COMPLETO E PRONTO PARA PRODUÇÃO**

---

*Documentação criada em: 24/01/2026*  
*Versão: 1.0.0*  
*Autor: AI Assistant (Claude Sonnet 4.5)*
