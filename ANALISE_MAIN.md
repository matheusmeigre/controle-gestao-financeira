# Relatório de Análise — `controle-gestao-financeira` (main)

**Branch:** `main` (commit `6a20a1d`)
**Versão:** 2.0.0
**Stack:** Next.js 16.2.7 + React 19 + TypeScript 5.9 + Tailwind 4 + Supabase + Clerk
**Último commit:** `refactor(ui): refatoração visual Apple-inspired no design system`
**Data da análise:** 22 Jul 2026
**Status atual:** 82 arquivos `.ts`, 109 arquivos `.tsx`, 45 docs (~340KB)

---

## 1. PROBLEMAS CRÍTICOS

| # | Problema | Gravidade | Localização |
|---|----------|-----------|-------------|
| 1.1 | Credenciais reais no `.env.local` — service_role key do Supabase e secret key do Clerk expostas no repositório local | 🔴 Alta | `.env.local` |
| 1.2 | 8 vulnerabilidades npm (4 high, 3 moderate, 1 low) — `brace-expansion` (DoS), `postcss` (XSS), `sharp` (libvips CVEs), `uuid` (buffer overflow) | 🔴 Alta | `npm audit` |
| 1.3 | `force-dynamic` no layout raiz — desabilita toda otimização estática do Next.js, toda rota vira SSR | 🟡 Média | `src/app/layout.tsx:11` + `src/app/(dashboard)/layout.tsx:1` |
| 1.4 | Testes não executáveis — `vitest.config.ts` completamente comentado, `vitest` não instalado como dependência | 🟡 Média | `vitest.config.ts`, `package.json` |
| 1.5 | `clean` script usa `rm -rf` — incompatível com Windows (PowerShell) | 🟡 Média | `package.json:13` |

---

## 2. PROBLEMAS DE CÓDIGO

### 2.1 ESLint — 4 Warnings (0 erros)

| Arquivo | Linha | Problema |
|---------|-------|----------|
| `src/components/card-calculator.tsx` | 139 | `useEffect` com 5 dependências faltando |
| `src/components/ui/date-picker.tsx` | 72 | `useEffect` com `selectedDate` faltando |
| `src/features/cards/components/CardSelector.tsx` | 25 | `useEffect` com `loadCards` faltando |
| `src/features/cards/components/CardsList.tsx` | 52 | `useEffect` com `loadCards` faltando |

### 2.2 TypeScript — Passa limpo (`tsc --noEmit` sem erros)

- 1 `@ts-ignore` em `src/app/layout.tsx:45` (ClerkProvider + React 19)
- 2 `eslint-disable` em `quick-transaction-modal.tsx` e `terms-acceptance-modal.tsx`
- 1 `any` type em `src/components/quick-transaction-modal.tsx:47`

### 2.3 Boas Práticas Violadas

| Problema | Arquivos |
|----------|----------|
| `console.log/error` em produção | `user-data.ts` (4x), `enhanced-export-manager.tsx` (1x) |
| `alert()` para feedback ao usuário | `quick-transaction-modal.tsx`, `card-bills-list-v2.tsx`, `user-data.ts` |
| `localStorage` ainda referenciado (legado) | `user-data.ts`, `privacy-policy.tsx`, `terms-of-use.tsx` |
| Duplicação de código (v1 + v2 do mesmo componente) | `card-bill-form.tsx` + `card-bill-form-v2.tsx`, `card-bills-list.tsx` + `card-bills-list-v2.tsx` |
| Arquivo solto na raiz do projeto | `test-parse.tsx` (7.2KB) — sem utilidade em produção |

---

## 3. PROBLEMAS DE ARQUITETURA

### 3.1 Dualidade localStorage ↔ Supabase

A migração para Supabase foi feita parcialmente:
- `card.supabase.repository.ts` e interfaces em `card.repository.ts` coexistem
- `card_bills` ainda usa localStorage via `user-data.ts`
- Página `/migrate` para migrar dados do localStorage para Supabase ainda está ativa e acessível
- `privacy-policy.tsx` e `terms-of-use.tsx` descrevem armazenamento local como padrão

### 3.2 Sem Testes de Fato

- 2 testes apenas: `expense.service.test.ts` e `base.repository.test.ts`
- Pastas `tests/features/cards/`, `tests/features/incomes/`, `tests/features/invoices/` — vazias
- Setup necessário (`vitest`, `@testing-library/react`, `happy-dom`) não está instalado

### 3.3 Componentes Monolíticos

| Componente | Linhas | Problema |
|------------|--------|----------|
| `src/app/page.tsx` | ~700+ | Página inicial monolítica com tudo |
| `export-manager.tsx` | ~700+ | Responsabilidades demais |
| `card-calculator.tsx` | ~700+ | Lógica de negócio + UI misturadas |
| `card-bills-list-v2.tsx` | ~700+ | State + renderização no mesmo arquivo |
| `ocr-service.ts` | ~600+ | Serviço grande demais |

### 3.4 Página de Migração Exposta

`src/app/(dashboard)/migrate/page.tsx` (9.3KB) — rota acessível em produção para migrar dados legados.

---

## 4. SEGURANÇA

| # | Problema | Detalhes |
|---|----------|----------|
| 4.1 | Service Role Key no client | `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` — acesso irrestrito ao banco |
| 4.2 | RLS não efetivo na prática | App usa `service_role` (bypassa RLS). Policies são apenas "defesa extra" |
| 4.3 | CSP permite `unsafe-eval` | Necessário para Clerk, mas reduz proteção contra XSS |
| 4.4 | Headers de segurança bons | HSTS 2 anos, X-Frame-Options, X-Content-Type-Options configurados |
| 4.5 | OAuth via Clerk | Proteção adequada com middleware protegendo todas as rotas exceto sign-in/sign-up |

---

## 5. DEPENDÊNCIAS

### 5.1 Pacotes Desatualizados (Maiores)

| Pacote | Instalado | Latest | Diferença |
|--------|-----------|--------|-----------|
| `@clerk/nextjs` | 6.39.5 | 7.5.22 | Major |
| `@clerk/localizations` | 3.37.2 | 4.13.6 | Major |
| `lucide-react` | 0.454.0 | 1.25.0 | Major |
| `react-hook-form` | 7.71.2 | 7.82.0 | Minor |
| `@hookform/resolvers` | 3.10.0 | 5.4.0 | Major |
| `sonner` | 1.7.4 | 2.0.7 | Major |
| `tailwind-merge` | 2.6.1 | 3.6.0 | Major |
| `@vercel/analytics` | 1.3.1 | 2.0.1 | Major |
| `cmdk` | 1.0.4 | 1.1.1 | Minor |
| `recharts` | 2.15.4 | 3.10.0 | Major |
| `react-dropzone` | 15.0.0 | 19.1.1 | Major |
| `day-picker` | 9.4.3 | 10.0.1 | Major |

### 5.2 Dependências Faltando (para testes)

- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `happy-dom`
- `@vitejs/plugin-react`

---

## 6. INFRAESTRUTURA & CI/CD

### 6.1 Pipeline GitHub Actions (`github-actions-pipelines.yml`)

```yaml
- npm install --legacy-peer-deps
- npm run lint       # ✅ funciona (0 erros, 4 warnings)
- npm run type-check # ✅ funciona (limpo)
- npm run build      # ⚠️ não verificado, mas compila
```

**Faltando:** `npm test` (não existe), build de Docker, deploy automatizado, análise de cobertura.

### 6.2 `next.config.mjs`

- `images.unoptimized: true` — impede otimização de imagens do Next.js
- CSP boa, mas permite `unsafe-eval` e `unsafe-inline`
- HSTS bem configurado (2 anos + preload)

---

## 7. PROBLEMAS DE MANUTENÇÃO

| # | Problema | Impacto |
|---|----------|---------|
| 7.1 | 45 arquivos de documentação (~340KB) misturados com o código fonte | Poluição visual, difícil navegação |
| 7.2 | `docs/` sem padrão — guias, checklists, relatórios de implementação já concluídos, artefatos temporários | Manutenção confusa |
| 7.3 | `public/prototipo/` — protótipos HTML estáticos incluídos no build final | Desperdício de banda, assets desnecessários em produção |
| 7.4 | `test-parse.tsx` na raiz | Artefato de desenvolvimento poluindo o projeto |
| 7.5 | `templates/` vazio | Diretório sem utilidade |

---

## 8. PONTOS POSITIVOS (a preservar)

| Item | Detalhe |
|------|---------|
| ✅ Modularização por features | `src/features/` com `components/`, `hooks/`, `services/`, `types.ts`, `index.ts` |
| ✅ Repository Pattern | Separação clara entre interface (`*.repository.ts`) e implementação (`*.supabase.repository.ts`) |
| ✅ Server Actions centralizadas | `src/server/actions/` por domínio |
| ✅ Atualização otimista | `useDashboardData.ts` com rollback automático |
| ✅ Middleware de autenticação | Clerk protegendo todas as rotas |
| ✅ Migrações SQL versionadas | `supabase/migrations/001` e `002` |
| ✅ Triggers de `updated_at` | Em `credit_cards`, `invoices`, `plannings` |
| ✅ i18n | Clerk com localização pt-BR disponível |
| ✅ Zero erros de TypeScript | Compilação limpa |
| ✅ Zero erros de ESLint | Apenas 4 warnings de hooks |

---

## 9. RECOMENDAÇÕES PRIORITÁRIAS

### 🔴 Imediatas (pré-refactoring)

1. **Rodar `npm audit fix`** para corrigir vulnerabilidades
2. **Remover service role key** do `.env.local` ou restringir acesso
3. **Completar migração Supabase** — remover `localStorage` de todos os fluxos e eliminar a página `/migrate`
4. **Instalar `vitest` e configurar testes** — descomentar `vitest.config.ts`
5. **Corrigir `clean` script** para funcionar no Windows (`Remove-Item -Recurse -Force`)

### 🟡 Curto Prazo

6. **Atualizar dependências major** — Clerk v7, lucide-react v1, recharts v3, sonner v2, hookform/resolvers v5, tailwind-merge v3
7. **Remover `force-dynamic`** e adotar ISR ou SSG onde possível
8. **Resolver 4 warnings de ESLint** — adicionar dependências faltantes nos `useEffect`
9. **Substituir `alert()` por `sonner` toast** em todos os componentes
10. **Remover `console.log`** de produção
11. **Remover `public/prototipo/`** do build final

### 🔵 Médio Prazo

12. **Eliminar duplicação** — unificar `card-bill-form` v1/v2 e `card-bills-list` v1/v2
13. **Quebrar componentes monolíticos** — `page.tsx` (24KB), `export-manager.tsx` (24KB), `card-calculator.tsx` (23KB), `card-bills-list-v2.tsx` (23KB)
14. **Limpar `docs/`** — arquivar documentação já implementada ou mover para wiki
15. **Remover `test-parse.tsx`** da raiz
16. **Criar testes significativos** para serviços e Server Actions
17. **Adicionar cobertura de testes** na pipeline CI

---

## 10. MÉTRICAS DO PROJETO

| Métrica | Valor |
|---------|-------|
| Arquivos `.ts` | 82 |
| Arquivos `.tsx` | 109 |
| Total de componentes | ~70 |
| Features | 7 (cards, categories, dashboard, expenses, incomes, invoices, planning, subscriptions) |
| UI primitives (shadcn) | 28 |
| Documentação | 45 arquivos, ~340KB |
| Testes | 2 arquivos |
| Cobertura de testes | ~0% |
| Erros ESLint | 0 |
| Warnings ESLint | 4 |
| Erros TypeScript | 0 |
| Dependências desatualizadas | ~18 (6 major) |
| Vulnerabilidades npm | 8 (4 high) |

---

## RESUMO EXECUTIVO

O projeto está em um **estado sólido de desenvolvimento**, com boa arquitetura (patterns, modularização, tipos) e compilação limpa. Porém, carrega **dívida técnica de diversas fases**:

1. **Migração incompleta** do localStorage para Supabase criou um sistema híbrido
2. **Testes inexistentes** — sem suíte rodando, sem cobertura
3. **Dependências desatualizadas** — vários pacotes com breaking changes disponíveis
4. **Componentes hinchados** — páginas e componentes ultrapassam 700+ linhas
5. **Documentação excessiva** — 45 arquivos misturados ao código, muitos desatualizados

O refactoring deve priorizar: **completar a migração Supabase**, **instalar/configurar testes**, **atualizar dependências com breaking changes**, e então **quebrar os componentes monolíticos** e **limpar artefatos legados**.
