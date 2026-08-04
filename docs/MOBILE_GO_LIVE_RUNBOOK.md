# Mobile Go-Live Runbook

## Perfis de build

- `development`: development client e distribuicao interna.
- `preview`: homologacao interna para Android e iOS.
- `production`: build assinada para submissao em loja.

## Dependencias externas

- Conta Expo/EAS ativa.
- `EXPO_TOKEN` configurado no GitHub Actions.
- Credenciais Apple Developer.
- Credenciais Google Play Console.
- `EXPO_PUBLIC_API_BASE_URL` e `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` definidos para o ambiente correto.

## Checklist de homologacao interna

1. Executar `npm run mobile:ci`.
2. Disparar workflow `Mobile Release` com perfil `preview`.
3. Validar instalacao interna em Android.
4. Validar instalacao interna em iOS/TestFlight.
5. Confirmar autenticacao, bootstrap, CRUDs principais e preview de importacao.
6. Confirmar logs sem dados sensiveis.
7. Registrar versao/hashes de build aprovados.

## Checklist de go-live

1. Atualizar `projectId`, `appleId` e `ascAppId` reais.
2. Garantir assets finais de icone/splash antes da submissao publica.
3. Executar workflow `Mobile Release` com perfil `production`.
4. Publicar Android em Internal Testing.
5. Publicar iOS em TestFlight.
6. Validar versao em homologacao final.
7. Autorizar submissao publica somente apos aprovacao final.

## Rollback

1. Suspender promocao da versao com falha nas lojas.
2. Redirecionar homologadores para o build interno anterior aprovado.
3. Reverter o canal EAS/versao de distribuicao para o build estavel anterior.
4. Se necessario, invalidar sessoes mobile comprometidas.
5. Abrir incidente com versao afetada, impacto e plano de correcao.

## Pendencias conhecidas

- Este repositório ainda usa placeholders para `projectId` e IDs de submissao.
- Assets definitivos de icone/splash ainda precisam ser publicados antes da submissao em loja.
