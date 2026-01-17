# 📘 Guia de Migração - Nova Arquitetura

Este guia ajudará desenvolvedores (novos e existentes) a entender a nova arquitetura do projeto.

## 🔄 O Que Mudou?

### Antes (Estrutura Antiga)
```
controle-de-gastos/
├── app/
├── components/          # Todos os componentes misturados
├── hooks/               # Hooks genéricos
├── lib/                 # Utilitários e parsers misturados
├── server/              # Server actions
├── types/               # Tipos globais
└── styles/
```

### Depois (Nova Estrutura)
```
controle-de-gastos/
└── src/
    ├── app/             # Next.js App Router (páginas finas)
    ├── features/        # ⭐ Domínios de negócio
    │   ├── expenses/
    │   ├── cards/
    │   ├── invoices/
    │   ├── incomes/
    │   └── subscriptions/
    ├── components/      # Componentes UI genéricos
    ├── lib/
    │   └── repositories/  # Repository Pattern
    ├── server/          # Server-only code
    ├── hooks/           # Hooks genéricos
    ├── types/           # Tipos compartilhados
    └── styles/
```

## 🎯 Principais Mudanças

### 1. Feature-Based Architecture

Cada domínio de negócio agora é uma **feature independente**:

```
src/features/expenses/
├── components/          # Componentes da feature
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   └── ExpenseSummary.tsx
├── hooks/              # Hooks específicos
│   └── useExpenses.ts
├── services/           # Lógica de negócio
│   ├── expense.repository.ts
│   └── expense.service.ts
├── types.ts           # Tipos da feature
└── index.ts           # Barrel export
```

**Benefícios:**
- ✅ Alta coesão
- ✅ Baixo acoplamento
- ✅ Fácil de testar
- ✅ Fácil de entender
- ✅ Escalável

### 2. Repository Pattern

Toda persistência agora passa por **repositories**:

```typescript
// Antes
localStorage.getItem(`expenses_${userId}`)

// Depois
const repository = new ExpenseRepository()
await repository.findAll(userId)
```

**Benefícios:**
- ✅ Abstração da camada de dados
- ✅ Fácil migração para banco de dados
- ✅ Testável com mocks
- ✅ Consistência

### 3. Service Layer

Lógica de negócio agora está em **services**:

```typescript
// Antes - lógica espalhada em componentes
const addExpense = () => {
  // validações inline
  // manipulação direta de estado
}

// Depois - lógica centralizada
const expenseService = new ExpenseService()
const expense = await expenseService.addExpense(userId, data)
```

**Benefícios:**
- ✅ Lógica reutilizável
- ✅ Fácil de testar
- ✅ Separação de responsabilidades
- ✅ Manutenível

### 4. Barrel Exports

Cada feature exporta sua API pública:

```typescript
// src/features/expenses/index.ts
export { ExpenseForm, ExpenseList } from './components'
export { useExpenses } from './hooks'
export { ExpenseService } from './services'
export type { Expense } from './types'

// Uso
import { ExpenseForm, useExpenses, type Expense } from '@/features/expenses'
```

## 📦 Como Usar a Nova Arquitetura

### Criando um Novo Componente

**Componente de Feature (específico):**
```typescript
// src/features/expenses/components/ExpenseChart.tsx
export function ExpenseChart() {
  const { expenses } = useExpenses()
  // ...
}
```

**Componente UI (genérico/reutilizável):**
```typescript
// src/components/ui/chart.tsx
export function Chart({ data }) {
  // ...
}
```

### Criando uma Nova Feature

1. **Crie a estrutura:**
```bash
mkdir -p src/features/nova-feature/{components,hooks,services}
```

2. **Crie os arquivos base:**
```typescript
// types.ts
export interface NovaEntity {
  id: string
  userId: string
  // ...
}

// services/nova.repository.ts
export class NovaRepository extends BaseRepository<NovaEntity> {
  constructor() {
    super('nova')
  }
}

// services/nova.service.ts
export class NovaService {
  private repository = new NovaRepository()
  // ...
}

// hooks/useNova.ts
export function useNova() {
  // ...
}

// index.ts
export * from './components'
export * from './hooks'
export * from './services'
export * from './types'
```

### Usando Services

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ExpenseService } from '@/features/expenses'
import { useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { user } = useUser()
  const [data, setData] = useState([])
  
  useEffect(() => {
    if (!user?.id) return
    
    const service = new ExpenseService()
    service.getAllExpenses(user.id).then(setData)
  }, [user?.id])
  
  return <div>{/* ... */}</div>
}
```

### Usando Hooks (Recomendado)

```typescript
'use client'

import { useExpenses } from '@/features/expenses'

export function MyComponent() {
  const { 
    expenses, 
    loading, 
    addExpense, 
    deleteExpense 
  } = useExpenses()
  
  if (loading) return <div>Carregando...</div>
  
  return <div>{/* ... */}</div>
}
```

## 🔧 Path Aliases

```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/features/*": ["./src/features/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"]
  }
}
```

**Uso:**
```typescript
// ✅ Bom
import { ExpenseForm } from '@/features/expenses'
import { Button } from '@/components/ui/button'

// ❌ Evite
import { ExpenseForm } from '../../../features/expenses'
```

## 🧪 Testes

```typescript
// tests/features/expenses/expense.service.test.ts
import { describe, it, expect } from 'vitest'
import { ExpenseService } from '@/features/expenses'

describe('ExpenseService', () => {
  it('deve adicionar uma despesa', async () => {
    // ...
  })
})
```

## 📊 Fluxo de Dados

```
Component
   ↓
Hook (useExpenses)
   ↓
Service (ExpenseService)
   ↓
Repository (ExpenseRepository)
   ↓
localStorage / API
```

## 🚀 Próximos Passos

1. **Atualizar imports nos componentes existentes**
2. **Migrar componentes legados para features**
3. **Adicionar testes**
4. **Refatorar page.tsx para usar hooks**
5. **Documentar convenções específicas do projeto**

## ❓ FAQ

**Q: Onde coloco um componente que é usado em múltiplas features?**
A: Em `src/components/` (componentes genéricos de UI)

**Q: Onde coloco utilitários compartilhados?**
A: Em `src/lib/utils.ts` para funções puras, ou crie uma feature `shared/` se necessário

**Q: Posso usar services em Server Actions?**
A: Sim! Server Actions devem ser thin controllers que chamam services

**Q: Como faço para migrar código antigo?**
A: Gradualmente. A estrutura antiga ainda funciona durante a transição.

## 📚 Recursos Adicionais

- [ARQUITETURA.md](./ARQUITETURA.md) - Visão geral da arquitetura
- [tests/README.md](../tests/README.md) - Guia de testes
- [CONVENTIONS.md](./CONVENTIONS.md) - Convenções de código (criar)

## 🆘 Precisa de Ajuda?

- Verifique os exemplos em `src/features/expenses/`
- Consulte a documentação do Next.js
- Abra uma issue no repositório
