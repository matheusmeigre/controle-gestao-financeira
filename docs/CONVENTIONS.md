# 📋 Convenções de Código

Este documento define as convenções e melhores práticas do projeto.

## 📁 Estrutura de Arquivos

### Nomenclatura

```
✅ CORRETO
- PascalCase para componentes: ExpenseForm.tsx
- camelCase para utilitários: useExpenses.ts
- kebab-case para arquivos de config: vitest.config.ts
- Sufixo de tipo: expense.service.ts, expense.repository.ts

❌ EVITAR
- snake_case: expense_form.tsx
- Sem sufixo: expense.ts (ambíguo)
```

### Organização de Imports

```typescript
// 1. External packages
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

// 2. Internal aliases (@/)
import { Button } from '@/components/ui/button'
import { ExpenseService } from '@/features/expenses'

// 3. Relative imports
import { formatCurrency } from './utils'
import type { LocalType } from './types'
```

## 🎯 Features

### Estrutura Obrigatória

```
src/features/nova-feature/
├── components/          # Componentes da feature
├── hooks/               # Hooks específicos (opcional)
├── services/            # Lógica de negócio
│   ├── nova.repository.ts
│   └── nova.service.ts
├── types.ts             # Tipos da feature
└── index.ts             # Barrel export
```

### Barrel Export (index.ts)

```typescript
// Sempre exporte a API pública da feature
export { Component1, Component2 } from './components'
export { useFeature } from './hooks'
export { FeatureService, FeatureRepository } from './services'
export type { FeatureType, CreateInput } from './types'
export { CONSTANTS } from './types'
```

## 🔧 Services e Repositories

### Repository

```typescript
// Extende sempre BaseRepository
export class ExpenseRepository extends BaseRepository<Expense> {
  constructor() {
    super('expenses') // localStorage key
  }

  // Métodos específicos do domínio
  async findByCategory(userId: string, category: string) {
    // implementação
  }
}
```

### Service

```typescript
export class ExpenseService {
  private repository = new ExpenseRepository()

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async addExpense(userId: string, data: CreateExpenseInput) {
    // 1. Validações
    if (!data.description) {
      throw new Error('Descrição é obrigatória')
    }

    // 2. Transformações
    const expense = { ...data, id: this.generateId(), userId }

    // 3. Persistência
    return await this.repository.create(userId, expense)
  }
}
```

## 🪝 Hooks

### Nomenclatura

```typescript
// ✅ Sempre use prefixo
export function useExpenses() {}
export function useCards() {}
export function useAuth() {}

// ❌ Não use
export function expenses() {}
export function getExpenses() {}
```

### Padrão

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { ExpenseService } from '../services/expense.service'

export function useExpenses() {
  const { user } = useUser()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const service = useMemo(() => new ExpenseService(), [])

  // Load effect
  useEffect(() => {
    if (!user?.id) return
    // ...
  }, [user?.id])

  // Mutations
  const addItem = useCallback(async (input) => {
    // ...
  }, [user?.id])

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refresh: loadData
  }
}
```

## 📦 Componentes

### Client vs Server

```typescript
// Client Component (interativo)
'use client'

export function ExpenseForm() {
  const [amount, setAmount] = useState(0)
  // ...
}

// Server Component (estático)
export function ExpenseList({ expenses }) {
  return (
    <ul>
      {expenses.map(e => <li key={e.id}>{e.description}</li>)}
    </ul>
  )
}
```

### Props

```typescript
// ✅ Use interfaces para props
interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void
  initialData?: Expense
}

export function ExpenseForm({ onSubmit, initialData }: ExpenseFormProps) {
  // ...
}

// ❌ Evite inline types
export function ExpenseForm({ onSubmit }: { onSubmit: Function }) {
  // ...
}
```

## 🎨 TypeScript

### Types vs Interfaces

```typescript
// Use interface para objetos
interface User {
  id: string
  name: string
}

// Use type para unions, intersections, utilities
type Status = 'pending' | 'completed'
type CreateUserInput = Omit<User, 'id'>
```

### Naming

```typescript
// Sufixos descritivos
type CreateExpenseInput = Omit<Expense, 'id' | 'userId'>
type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: string }

// Enums
export const CATEGORIES = ['Alimentação', 'Transporte'] as const
export type Category = typeof CATEGORIES[number]
```

## 🧪 Testes

### Nomenclatura

```
tests/
├── features/
│   └── expenses/
│       ├── expense.service.test.ts
│       ├── expense.repository.test.ts
│       └── ExpenseForm.test.tsx
```

### Estrutura

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('ExpenseService', () => {
  let service: ExpenseService

  beforeEach(() => {
    service = new ExpenseService()
  })

  describe('addExpense', () => {
    it('deve adicionar uma despesa válida', async () => {
      // Arrange
      const input = { description: 'Test', amount: 100 }

      // Act
      const result = await service.addExpense('user123', input)

      // Assert
      expect(result).toHaveProperty('id')
      expect(result.description).toBe('Test')
    })

    it('deve lançar erro se descrição for vazia', async () => {
      const input = { description: '', amount: 100 }
      await expect(service.addExpense('user123', input)).rejects.toThrow()
    })
  })
})
```

## 🚫 Anti-Patterns

### ❌ Evitar

```typescript
// ❌ Lógica de negócio em componentes
export function ExpenseForm() {
  const handleSubmit = () => {
    if (!description) return
    if (amount <= 0) return
    const id = Date.now().toString()
    localStorage.setItem('expenses', JSON.stringify([...]))
  }
}

// ❌ Imports relativos profundos
import { Button } from '../../../components/ui/button'

// ❌ Any types
const data: any = await fetchData()

// ❌ Código não reutilizável
const calculateTotal = () => {
  let total = 0
  expenses.forEach(e => total += e.amount)
  return total
}
```

### ✅ Fazer

```typescript
// ✅ Lógica em services
const expenseService = new ExpenseService()
const expense = await expenseService.addExpense(userId, data)

// ✅ Path aliases
import { Button } from '@/components/ui/button'

// ✅ Type-safe
const data: Expense[] = await fetchExpenses()

// ✅ Código reutilizável
const total = expenses.reduce((sum, e) => sum + e.amount, 0)
```

## 📝 Comentários

### Quando comentar

```typescript
// ✅ JSDoc para funções públicas
/**
 * Adiciona uma nova despesa
 * @param userId - ID do usuário autenticado
 * @param data - Dados da despesa
 * @returns Despesa criada com ID
 * @throws Error se validação falhar
 */
async addExpense(userId: string, data: CreateExpenseInput): Promise<Expense>

// ✅ Explicar "por que", não "o que"
// Usamos timeout para debounce do input de busca
setTimeout(() => search(query), 300)

// ❌ Comentários óbvios
// Incrementa counter
counter++
```

## 🔄 Git

### Commits

```bash
# Conventional Commits
feat: adicionar feature de exportação
fix: corrigir cálculo de total mensal
docs: atualizar README com novos padrões
refactor: extrair lógica para service
test: adicionar testes para ExpenseService
chore: atualizar dependências
```

### Branches

```bash
feature/nome-da-feature
fix/descricao-do-bug
refactor/area-refatorada
docs/tipo-de-documentacao
```

## 📚 Recursos

- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Next.js Docs](https://nextjs.org/docs)
- [Testing Library](https://testing-library.com/)

---

**Dúvidas?** Consulte os exemplos em `src/features/expenses/` ou abra uma issue.
