# 🏗️ Arquitetura do Sistema - Feature-Based Architecture v2.0

> **Atualizado**: Janeiro 2026  
> **Versão**: 2.0 (Reestruturação Completa)

## 📐 Visão Geral

Sistema de gestão financeira desenvolvido em **Next.js 14 (App Router)**, utilizando **arquitetura orientada a features** (feature-based architecture) com padrões de **Repository** e **Service Layer**.

### Princípios Arquiteturais

1. **Feature-Based Organization**: Código organizado por domínio de negócio
2. **Repository Pattern**: Abstração da camada de persistência
3. **Service Layer**: Lógica de negócio centralizada
4. **Separation of Concerns**: Separação clara entre UI, lógica e dados
5. **Backend-for-Frontend (BFF)**: Next.js como camada intermediária

---

## 📁 Estrutura de Diretórios

```
src/
├── app/                      # Next.js App Router (rotas)
│   ├── (dashboard)/          # Grupo de rotas protegidas
│   │   ├── cards/
│   │   └── invoices/
│   ├── sign-in/
│   ├── sign-up/
│   ├── layout.tsx            # Layout root com ClerkProvider
│   └── page.tsx              # Dashboard principal
│
├── features/                 # ⭐ Domínios de Negócio
│   ├── expenses/
│   │   ├── components/       # Componentes da feature
│   │   ├── hooks/            # Hooks específicos
│   │   ├── services/         # Lógica de negócio
│   │   │   ├── expense.repository.ts
│   │   │   └── expense.service.ts
│   │   ├── types.ts
│   │   └── index.ts          # Barrel export
│   ├── cards/
│   ├── invoices/
│   │   ├── parsers/          # Parsers de faturas
│   │   └── templates/        # Templates bancários
│   ├── incomes/
│   └── subscriptions/
│
├── components/               # Componentes UI genéricos
│   ├── layout/               # Header, Footer
│   ├── modals/               # Modais reutilizáveis
│   └── ui/                   # Design System (shadcn/ui)
│
├── lib/
│   ├── repositories/         # Repository Pattern
│   │   ├── base.repository.ts
│   │   └── index.ts
│   ├── utils.ts              # Utilitários puros
│   └── banks.ts              # Dados de bancos
│
├── server/                   # Server-only code
│   ├── actions/              # Server Actions
│   │   ├── invoice.actions.ts
│   │   └── card.actions.ts
│   └── middleware/
│
├── hooks/                    # Hooks genéricos
│   └── useToast.ts
│
├── types/                    # Tipos compartilhados
│   └── shared.types.ts
│
└── styles/
    └── globals.css

tests/                        # Testes organizados por features
├── features/
│   ├── expenses/
│   ├── cards/
│   └── invoices/
└── lib/
```

---

## 🎯 Arquitetura de Features

### Anatomia de uma Feature

```
src/features/expenses/
├── components/               # UI específica da feature
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   └── ExpenseSummary.tsx
│
├── hooks/                    # Hooks específicos
│   └── useExpenses.ts
│
├── services/                 # Lógica de negócio
│   ├── expense.repository.ts  # Acesso a dados
│   └── expense.service.ts     # Regras de negócio
│
├── types.ts                  # Tipos da feature
└── index.ts                  # Barrel export (API pública)
```

### Fluxo de Dados (Unidirecional)

```
Component
   ↓
Hook (useExpenses)
   ↓
Service (ExpenseService)
   ↓
Repository (ExpenseRepository)
   ↓
Base Repository
   ↓
localStorage / API
```

---

## 🔧 Padrões Implementados

### 1. Repository Pattern

**Objetivo**: Abstrair a camada de persistência

```typescript
// lib/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  async findAll(userId: string): Promise<T[]>
  async findById(userId: string, id: string): Promise<T | null>
  async create(userId: string, item: T): Promise<T>
  async update(userId: string, id: string, updates: Partial<T>): Promise<T | null>
  async delete(userId: string, id: string): Promise<boolean>
}

// features/expenses/services/expense.repository.ts
export class ExpenseRepository extends BaseRepository<Expense> {
  async findByCategory(userId: string, category: string): Promise<Expense[]>
  async findByMonth(userId: string, month: number, year: number): Promise<Expense[]>
  // ... métodos específicos
}
```

**Benefícios**:
- ✅ Fácil migração para banco de dados (PostgreSQL, MongoDB, etc.)
- ✅ Testável com mocks
- ✅ Consistência nas operações de dados
- ✅ Single Responsibility Principle

### 2. Service Layer

**Objetivo**: Centralizar lógica de negócio

```typescript
// features/expenses/services/expense.service.ts
export class ExpenseService {
  private repository = new ExpenseRepository()

  async addExpense(userId: string, data: CreateExpenseInput): Promise<Expense> {
    // 1. Validações de negócio
    if (!data.description?.trim()) {
      throw new Error('Descrição é obrigatória')
    }

    // 2. Transformações
    const expense = { ...data, id: this.generateId(), userId }

    // 3. Persistência
    return await this.repository.create(userId, expense)
  }

  async getMonthlyTotal(userId: string, month: number, year: number): Promise<number> {
    const expenses = await this.repository.findByMonth(userId, month, year)
    return expenses.reduce((sum, e) => sum + e.amount, 0)
  }
}
```

**Benefícios**:
- ✅ Lógica reutilizável
- ✅ Fácil de testar
- ✅ Desacoplamento entre UI e dados
- ✅ Domain-Driven Design

### 3. Custom Hooks

**Objetivo**: Encapsular lógica de estado e side effects

```typescript
// features/expenses/hooks/useExpenses.ts
export function useExpenses() {
  const { user } = useUser()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const service = useMemo(() => new ExpenseService(), [])

  useEffect(() => {
    if (!user?.id) return
    service.getAllExpenses(user.id).then(setExpenses)
  }, [user?.id, service])

  const addExpense = useCallback(async (data) => {
    const newExpense = await service.addExpense(user!.id, data)
    setExpenses(prev => [...prev, newExpense])
  }, [user?.id, service])

  return { expenses, loading, addExpense }
}
```

**Benefícios**:
- ✅ Reutilização de lógica
- ✅ Separação de concerns
- ✅ Facilita testes de componentes

### 4. Barrel Exports

**Objetivo**: API pública limpa para cada feature

```typescript
// features/expenses/index.ts
export { ExpenseForm, ExpenseList, ExpenseSummary } from './components'
export { useExpenses } from './hooks'
export { ExpenseService, ExpenseRepository } from './services'
export type { Expense, CreateExpenseInput } from './types'
export { CATEGORIES } from './types'

// Uso em outros arquivos
import { ExpenseForm, useExpenses, type Expense } from '@/features/expenses'
```

---

## 🔐 Autenticação e Segurança

### Multi-Tenant com Clerk

```
┌─────────┐          ┌──────────┐          ┌──────────────┐
│ Browser │          │   Clerk  │          │ localStorage │
└────┬────┘          └────┬─────┘          └──────┬───────┘
     │                    │                        │
     │ 1. Login OAuth     │                        │
     ├───────────────────>│                        │
     │                    │                        │
     │ 2. Return userId   │                        │
     │<───────────────────┤                        │
     │                    │                        │
     │ 3. Save with userId                         │
     ├────────────────────────────────────────────>│
     │                    │    Key: "expenses_user123"
     │                    │                        │
     │ 4. Load filtered by userId                  │
     │<────────────────────────────────────────────┤
     │                    │                        │
```

### Isolamento de Dados

```typescript
// Cada usuário tem seus próprios dados
localStorage:
  "expenses_user_abc123" → [despesas do user abc123]
  "expenses_user_xyz789" → [despesas do user xyz789]
  "cards_user_abc123"    → [cartões do user abc123]
```

---

## 🧪 Estratégia de Testes

### Estrutura de Testes

```
tests/
├── features/
│   ├── expenses/
│   │   ├── expense.service.test.ts
│   │   ├── expense.repository.test.ts
│   │   └── useExpenses.test.ts
│   └── cards/
└── lib/
    └── base.repository.test.ts
```

### Pirâmide de Testes

```
     ┌─────┐
     │ E2E │  ← Poucos (Playwright/Cypress)
     └─────┘
    ┌───────┐
    │Integr.│  ← Médios (Testing Library)
    └───────┘
   ┌─────────┐
   │  Unit   │  ← Muitos (Vitest)
   └─────────┘
```

### Testing Stack

- **Vitest**: Test runner
- **Testing Library**: Testes de componentes
- **MSW**: Mock de APIs

---

## 🚀 Evolução Futura

### Roadmap de Migração

```
Fase 1: Estrutura Base ✅
Fase 2: Feature Expenses ✅
Fase 3: Feature Cards ✅
Fase 4: Feature Invoices ✅
Fase 5: Repository Pattern ✅
Fase 6: Server Actions ✅
Fase 7: Testes ✅
Fase 8: Documentação ✅

Próximos Passos:
│
├─ Migrar de localStorage para PostgreSQL/Supabase
├─ Implementar tRPC para type-safe APIs
├─ Adicionar React Query para cache
├─ Implementar SSR para SEO
├─ Adicionar Storybook para documentação de componentes
└─ Configurar CI/CD com testes automatizados
```

### Migração de Dados

**Atual**: localStorage  
**Futuro**: PostgreSQL/Supabase

```typescript
// Mudança mínima necessária
// Apenas atualizar BaseRepository

export class BaseRepository<T> {
  // De:
  async findAll(userId: string) {
    return JSON.parse(localStorage.getItem(key))
  }

  // Para:
  async findAll(userId: string) {
    return await prisma.expense.findMany({ where: { userId } })
  }
}

// ✅ Services e Components não mudam!
```

---

## 📚 Recursos

- **[MIGRATION.md](./MIGRATION.md)**: Guia de migração para desenvolvedores
- **[tests/README.md](../tests/README.md)**: Guia de testes
- **[ARQUITETURA.md](./ARQUITETURA.md)**: Documentação antiga (referência)

---

## 👥 Contribuindo

### Convenções

1. **Nomenclatura**: PascalCase para componentes, camelCase para funções
2. **Exports**: Use barrel exports em cada feature
3. **Types**: Sempre exporte tipos junto com implementações
4. **Testes**: Todo service deve ter testes unitários
5. **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)

### Adicionando uma Nova Feature

```bash
# 1. Criar estrutura
mkdir -p src/features/nova-feature/{components,hooks,services}

# 2. Criar arquivos base
touch src/features/nova-feature/{types.ts,index.ts}
touch src/features/nova-feature/services/{nova.repository.ts,nova.service.ts}

# 3. Implementar repository
# 4. Implementar service
# 5. Criar hooks
# 6. Criar componentes
# 7. Adicionar barrel export
# 8. Escrever testes
```

---

## 🏆 Benefícios da Nova Arquitetura

### Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Organização** | Flat, misturado | Feature-based, isolado |
| **Testabilidade** | Difícil | Fácil (service/repository) |
| **Escalabilidade** | Limitada | Alta (features independentes) |
| **Onboarding** | Confuso | Claro e documentado |
| **Manutenção** | Complexa | Simples (mudanças localizadas) |
| **Reusabilidade** | Baixa | Alta (services reutilizáveis) |

### Métricas de Sucesso

- ✅ Tempo de onboarding: < 2 horas
- ✅ Adicionar feature: Sem tocar código existente
- ✅ Cobertura de testes: > 80%
- ✅ Build time: < 30s
- ✅ Zero conflitos de merge entre features

---

**Última atualização**: Janeiro 2026  
**Mantido por**: Time de Desenvolvimento
