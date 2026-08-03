# apps/mobile

App Expo/React Native da migracao mobile, consumindo `@api-client` e `@contracts` como fonte unica de integracao com a API v1.

## Scripts

- `npm run mobile:dev`
- `npm run mobile:android`
- `npm run mobile:ios`
- `npm run mobile:web`
- `npm run mobile:lint`
- `npm run mobile:test`
- `npm run mobile:type-check`
- `npm run mobile:export`
- `npm run mobile:ci`

## Ambiente

Defina `EXPO_PUBLIC_API_BASE_URL` para o host base da aplicacao web/API. O cliente mobile resolve automaticamente `/api/v1` a partir desse valor.

Defina `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` para inicializar o Clerk no app mobile.

## Cache e offline

- React Query centraliza queries e invalidacao.
- O cache persistido usa `AsyncStorage` apenas para dados nao sensiveis.
- Tokens continuam exclusivamente em `SecureStore`.
- O app detecta offline, exibe banner e reaproveita cache local enquanto aguarda reconexao.

## Qualidade local

Execute a validacao completa do app mobile com `npm run mobile:ci`.

## Troubleshooting

- `EXPO_PUBLIC_API_BASE_URL` sem `https://` falha em producao por regra de seguranca.
- Se um teste local falhar por ambiente, valide primeiro `npm run mobile:type-check` e `npm run mobile:test`.
- O preview de importacao depende do endpoint `/api/v1/invoices/imports/preview` acessivel pelo dispositivo.

## Arquivos principais

- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/lib/env.ts`
- `src/lib/api.ts`
- `src/lib/session.ts`
- `src/lib/auth/token-cache.ts`
- `src/providers/app-provider.tsx`
