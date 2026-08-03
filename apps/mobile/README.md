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

## Ambiente

Defina `EXPO_PUBLIC_API_BASE_URL` para o host base da aplicacao web/API. O cliente mobile resolve automaticamente `/api/v1` a partir desse valor.

## Arquivos principais

- `src/app/_layout.tsx`
- `src/app/index.tsx`
- `src/lib/env.ts`
- `src/lib/api.ts`
- `src/lib/session.ts`
