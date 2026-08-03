# Mobile Observability Alerts

## Eventos criticos

- `exception`: falha nao tratada em runtime mobile.
- `api_failure`: erro de rede, timeout ou resposta invalida da API v1.
- `performance`: cold start, bootstrap e latencia de chamadas criticas.

## Alertas operacionais essenciais

1. Aumentou a taxa de `exception` fatal por versao do app.
2. Aumentou a taxa de `api_failure` por endpoint.
3. Cold start acima do baseline esperado por ambiente.
4. Bootstrap falhando repetidamente apos autenticacao.
5. Upload de importacao de fatura falhando acima do normal.

## Regras de sanitizacao

- Nunca registrar `token`, `authorization`, `password` ou `secret` em claro.
- Nunca registrar `amount`, `paidAmount` ou `creditLimit` em payload bruto.
- Contextos de erro devem preservar diagnostico tecnico sem expor dados financeiros.
