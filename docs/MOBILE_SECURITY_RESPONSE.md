# Mobile Security Response

## Controles implementados

- Sessao mobile armazenada em `SecureStore`.
- Cache persistido separado de tokens.
- Sanitizacao de logs para credenciais, identificadores sensiveis e valores financeiros.
- Builds de producao exigem `EXPO_PUBLIC_API_BASE_URL` com `https://`.
- `usesCleartextTraffic` desabilitado no Android.
- `NSAllowsArbitraryLoads` desabilitado no iOS.

## Resposta a sessao comprometida

1. Invalidar a sessao do usuario no provedor de autenticacao.
2. Solicitar novo login no app mobile.
3. Limpar tokens locais persistidos em `SecureStore`.
4. Revisar eventos `api_failure`, `exception` e falhas `401` associados ao dispositivo.
5. Confirmar se houve tentativa de acesso cruzado a recursos de outro usuario.

## Riscos remanescentes

- O app ainda depende de configuracao correta de ambiente para nao apontar para hosts inseguros fora do desenvolvimento.
- Validacoes de payload e limites do upload continuam no backend; o cliente agora faz apenas a triagem inicial.
