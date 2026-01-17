# 🧪 Testes

Estrutura de testes organizada por features, seguindo o padrão da aplicação.

## Estrutura

```
tests/
├── features/
│   ├── expenses/      # Testes da feature Expenses
│   ├── cards/         # Testes da feature Cards
│   ├── invoices/      # Testes da feature Invoices
│   └── incomes/       # Testes da feature Incomes
└── lib/               # Testes de utilitários compartilhados
```

## Tipos de Testes

### 1. Unit Tests (Repositories e Services)
Testes isolados de lógica de negócio.

```typescript
// Exemplo: tests/features/expenses/expense.service.test.ts
describe('ExpenseService', () => {
  it('deve criar uma despesa válida', async () => {
    // Arrange, Act, Assert
  })
})
```

### 2. Integration Tests
Testes de integração entre camadas.

### 3. E2E Tests (futuro)
Testes end-to-end com Playwright/Cypress.

## Running Tests

```bash
# Run all tests
npm test

# Run specific feature tests
npm test -- features/expenses

# Run with coverage
npm test -- --coverage
```

## Testing Stack (Recomendado)

- **Vitest**: Test runner (compatível com Jest)
- **Testing Library**: Para testes de componentes React
- **MSW**: Mock service worker para APIs

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Um conceito por teste**: Cada teste deve verificar uma única funcionalidade
3. **Nomes descritivos**: Deve ser claro o que o teste valida
4. **Isolamento**: Testes não devem depender uns dos outros
5. **Mock de dependências externas**: Use mocks para localStorage, APIs, etc.

## Próximos Passos

1. Configurar Vitest
2. Criar testes para BaseRepository
3. Criar testes para cada Service
4. Adicionar testes de componentes
5. Configurar CI/CD para rodar testes automaticamente
