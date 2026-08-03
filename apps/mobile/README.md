# apps/mobile

Fundação inicial do app mobile baseada no `@api-client` tipado da API v1.

## Escopo atual

- criação padronizada do cliente mobile
- bootstrap de sessão (`me`, `bootstrap`, `expenses`, `incomes`, `cards`, `plannings`, `invoices`)
- resolução simples de `baseUrl` e token de acesso

## Próximos passos naturais

1. adicionar runtime Expo/React Native
2. ligar autenticação mobile ao `getAccessToken`
3. montar camada de cache/offline e sincronização
4. construir shells de navegação e telas iniciais

## Arquivos principais

- `src/lib/api.ts`
- `src/lib/session.ts`
- `src/index.ts`
