# 🚀 Quick Start - Módulo de Cartões de Crédito

## ✅ Instalação Completa

O módulo foi completamente implementado! Siga os passos abaixo para começar a usar.

## 📦 Dependências Instaladas

As seguintes dependências já foram adicionadas ao projeto:

```bash
✅ react-hook-form
✅ @hookform/resolvers
✅ zod
✅ react-dropzone
```

## 🎯 Rotas Disponíveis

### Cartões de Crédito

1. **Listagem de Cartões**
   ```
   http://localhost:3000/cards
   ```
   - Visualiza todos os cartões cadastrados
   - Acesso rápido às faturas de cada cartão

2. **Cadastro de Novo Cartão**
   ```
   http://localhost:3000/cards/new
   ```
   - Formulário seguro (apenas últimos 4 dígitos)
   - Validação em tempo real

### Faturas

3. **Dashboard de Faturas**
   ```
   http://localhost:3000/invoices
   ```
   - Lista todas as faturas
   - Filtros por cartão, mês, ano
   - Status de pagamento

4. **Criar/Importar Fatura**
   ```
   http://localhost:3000/invoices/new
   ```
   - Importação automática (CSV/OFX)
   - Adição manual de itens
   - Seletor de competência

5. **Detalhes da Fatura**
   ```
   http://localhost:3000/invoices/[id]
   ```
   - Breakdown por categoria
   - Lista completa de transações
   - Progresso de pagamento

## 🏃 Como Começar

### Passo 1: Inicie o servidor
```bash
npm run dev
```

### Passo 2: Cadastre seu primeiro cartão
1. Acesse http://localhost:3000/cards/new
2. Preencha:
   - Apelido: "Meu Cartão Pessoal"
   - Banco: "Nubank"
   - Bandeira: "Mastercard"
   - Últimos 4 dígitos: "1234"
   - Dia de fechamento: 10
   - Dia de vencimento: 15
3. Clique em "Cadastrar Cartão"

### Passo 3: Teste a importação de fatura

#### Opção A: Criar arquivo de teste Nubank

Crie um arquivo `fatura-teste.csv`:

```csv
date,category,title,amount
2026-01-05,alimentação,"Supermercado ABC",-150.00
2026-01-08,transporte,"Uber",-25.50
2026-01-10,outros,"Amazon",-89.90
2026-01-12,saúde,"Farmácia",-45.00
```

#### Opção B: Criar arquivo de teste Inter

Crie um arquivo `fatura-inter.csv`:

```csv
Data,Descrição,Valor
15/01/2026,"COMPRA LOJA XYZ",150.00
18/01/2026,"RESTAURANTE ABC",85.50
20/01/2026,"POSTO DE GASOLINA",200.00
```

### Passo 4: Importe a fatura
1. Acesse http://localhost:3000/invoices/new
2. Selecione seu cartão
3. Escolha competência (Janeiro 2026)
4. Configure datas
5. Arraste o arquivo CSV na área de upload
6. Aguarde o processamento
7. Revise os itens importados
8. Clique em "Criar Fatura"

### Passo 5: Visualize a fatura
1. Acesse http://localhost:3000/invoices
2. Clique na fatura criada
3. Explore o breakdown por categoria
4. Veja todas as transações

## 🧪 Testando os Parsers

### Testar Nubank Parser
```csv
date,category,title,amount
2026-01-15,alimentação,"Mercado Livre",-200.00
2026-01-16,transporte,"99 Táxi",-30.00
```

### Testar Inter Parser
```csv
Data,Descrição,Valor
15/01/2026,"Netflix",39.90
20/01/2026,"Spotify",21.90
```

### Testar OFX (Genérico)
Baixe um extrato OFX do seu banco (Itaú, Bradesco, etc.) e teste a importação.

## 🔧 Personalização

### Adicionar um novo banco

1. Crie o parser em `lib/parsers/seu-banco-parser.ts`:

```typescript
import type { InvoiceParser, ParseResult } from './types'

export class SeuBancoParser implements InvoiceParser {
  readonly name = 'Seu Banco Parser'
  
  async canParse(file: File): Promise<boolean> {
    // Lógica de detecção
    return file.name.includes('seu-banco')
  }
  
  async parse(file: File): Promise<ParseResult> {
    // Lógica de parsing
    return {
      success: true,
      transactions: [],
      errors: []
    }
  }
}
```

2. Registre no factory (`lib/parsers/index.ts`):

```typescript
import { SeuBancoParser } from './seu-banco-parser'

private static readonly PARSERS: ParserConfig[] = [
  // ... outros parsers
  {
    type: 'seu-banco',
    parser: new SeuBancoParser(),
    supportedExtensions: ['.csv'],
    priority: 85,
  },
]
```

## 🗄️ Migração para Banco de Dados

Atualmente o sistema usa armazenamento em memória (mock). Para produção:

### 1. Configure Prisma

Consulte `docs/CREDIT_CARD_MODULE.md` para o schema completo.

### 2. Atualize os Server Actions

Substitua os arrays por queries Prisma em:
- `server/actions/cards.ts`
- `server/actions/invoices.ts`

Exemplo:
```typescript
// Antes
let cards: CreditCard[] = []

// Depois
import { prisma } from '@/lib/prisma'

export async function getCards() {
  const { userId } = await auth()
  
  const cards = await prisma.creditCard.findMany({
    where: { userId, isActive: true }
  })
  
  return { success: true, data: cards }
}
```

## 📊 Estrutura de Dados

### CreditCard
```typescript
{
  id: string
  userId: string
  nickname: string
  bankName: string
  brand: 'Visa' | 'Mastercard' | ...
  last4Digits: string  // APENAS os últimos 4 dígitos
  closingDay: number
  dueDay: number
  creditLimit?: number
  isActive: boolean
}
```

### Invoice
```typescript
{
  id: string
  userId: string
  cardId: string
  month: number  // 1-12
  year: number
  closingDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount: number
  isPaid: boolean
  items: InvoiceItem[]
}
```

### InvoiceItem
```typescript
{
  id: string
  invoiceId: string
  date: Date
  description: string
  amount: number
  category: string
  installment?: string  // "2/12"
  notes?: string
}
```

## 🛡️ Segurança

### ✅ O que o sistema FAZ
- Armazena apenas últimos 4 dígitos
- Valida inputs no servidor
- Sanitiza dados de upload
- Implementa soft delete

### ❌ O que o sistema NÃO FAZ
- Nunca armazena número completo
- Nunca armazena CVV
- Nunca expõe dados sensíveis na URL

## 📝 Checklist de Produção

Antes de colocar em produção:

- [ ] Migrar para banco de dados real (Prisma)
- [ ] Configurar rate limiting
- [ ] Adicionar testes automatizados
- [ ] Configurar backup de dados
- [ ] Revisar políticas de retenção
- [ ] Configurar logs de auditoria
- [ ] Testar com dados reais
- [ ] Validar LGPD compliance

## 🆘 Suporte

### Problemas Comuns

**Parser não reconhece meu arquivo**
- Verifique a extensão (.csv, .ofx)
- Confirme o formato dos headers
- Check console para logs

**Erro de autenticação**
- Confirme configuração do Clerk
- Verifique middleware.ts

**Duplicatas sendo criadas**
- Sistema valida automaticamente
- Ajuste lógica em `server/actions/invoices.ts`

### Documentação Completa

Consulte `docs/CREDIT_CARD_MODULE.md` para documentação técnica detalhada.

---

**🎉 Pronto! Seu sistema de gestão de cartões está funcionando!**
