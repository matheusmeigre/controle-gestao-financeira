# Templates de Faturas

Esta pasta contém templates de exemplo de faturas de cartão de crédito dos principais bancos brasileiros.

## Propósito

Os templates servem como:
1. **Referência para desenvolvimento**: Estrutura de dados de cada banco
2. **Testes**: Validar parsers e leitores de PDF
3. **Documentação**: Entender padrões de cada instituição

## Bancos Disponíveis

| Banco | Arquivo | Características |
|-------|---------|----------------|
| Nubank | `nubank-template.txt` | Layout limpo, formato tabular simples |
| Inter | `inter-template.txt` | Resumo detalhado, estrutura clara |
| Itaú | `itau-template.txt` | Formato tradicional, duas datas |
| Bradesco | `bradesco-template.txt` | Layout empresarial estruturado |
| C6 Bank | `c6bank-template.txt` | Moderno e minimalista |
| Santander | `santander-template.txt` | Formato corporativo detalhado |
| Banco do Brasil | `bb-template.txt` | Layout tradicional Ourocard |

## Como Usar

### Para Testes
1. Copie o conteúdo de um template
2. Cole em um arquivo de texto
3. Use no sistema de importação para validar

### Para Desenvolvimento
1. Analise a estrutura do template
2. Identifique padrões de data e valor
3. Ajuste regex no parser correspondente

## Padrões Comuns

### Datas
- `DD/MM/YYYY` - Formato completo
- `DD/MM/YY` - Formato curto
- `DD/MM` - Apenas dia e mês

### Valores
- `R$ 1.234,56` - Com símbolo e espaço
- `R$1.234,56` - Sem espaço
- `1.234,56` - Apenas número

### Estrutura Típica
```
CABEÇALHO
- Nome do banco
- Dados do cartão

RESUMO
- Saldo anterior
- Pagamentos
- Total a pagar

LANÇAMENTOS
Data | Descrição | Valor

RODAPÉ
- Formas de pagamento
- Contatos
```

## Contribuindo

Para adicionar novos templates:
1. Crie arquivo `[banco]-template.txt`
2. Siga estrutura dos templates existentes
3. Inclua dados fictícios realistas
4. Documente características especiais

## Observações

- ⚠️ Todos os dados são fictícios
- 📝 Baseados em estruturas reais de PDFs
- 🔄 Atualize conforme bancos mudarem layouts
- 🔒 Nunca inclua dados reais de clientes
