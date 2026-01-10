# Advanced Credit Card Management Module

## 📋 Visão Geral

Módulo completo de gerenciamento de cartões de crédito com sistema inteligente de importação de faturas bancárias. Implementa **Privacy by Design**, **Strategy Pattern** para parsers extensíveis e validação robusta.

## ✨ Funcionalidades Implementadas

### 1. CRUD de Cartões de Crédito
- ✅ Cadastro seguro (apenas últimos 4 dígitos)
- ✅ Listagem de cartões cadastrados
- ✅ Seletor inteligente de cartões
- ✅ Validação de duplicatas
- ✅ Soft delete

### 2. Gestão de Faturas por Competência
- ✅ Criação de faturas com mês/ano
- ✅ Navegação entre competências
- ✅ Visualização detalhada com breakdown por categoria
- ✅ Controle de pagamento (total/parcial)
- ✅ Dashboard de faturas

### 3. Motor de Importação Inteligente (Parser Strategy)
- ✅ **Nubank CSV Parser** - Detecta e processa faturas Nubank
- ✅ **Inter CSV Parser** - Processa faturas do Banco Inter
- ✅ **Generic OFX Parser** - Suporte universal para OFX/QFX
- ✅ Detecção automática do formato
- ✅ Validação de idempotência (anti-duplicatas)
- ✅ Drag & Drop para upload

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── types/
│   ├── card.ts              # Types + Zod schemas para cartões
│   └── invoice.ts           # Types + Zod schemas para faturas
│
├── lib/
│   └── parsers/
│       ├── index.ts         # Parser Factory (Strategy Pattern)
│       ├── types.ts         # Interfaces comuns
│       ├── nubank-parser.ts # Implementação Nubank
│       ├── inter-parser.ts  # Implementação Inter
│       └── generic-ofx.ts   # Implementação OFX genérica
│
├── server/
│   └── actions/
│       ├── cards.ts         # Server Actions: CRUD de cartões
│       └── invoices.ts      # Server Actions: gestão de faturas
│
├── components/
│   ├── cards/
│   │   ├── CardForm.tsx     # Formulário de cadastro
│   │   └── CardSelector.tsx # Seletor com preview
│   └── invoices/
│       ├── MonthYearPicker.tsx   # Navegação de competência
│       └── InvoiceImporter.tsx   # Upload com drag & drop
│
└── app/
    └── (dashboard)/
        ├── cards/
        │   ├── page.tsx     # Listagem de cartões
        │   └── new/
        │       └── page.tsx # Cadastro de cartão
        └── invoices/
            ├── page.tsx     # Dashboard de faturas
            ├── new/
            │   └── page.tsx # Criação/Importação de fatura
            └── [invoiceId]/
                └── page.tsx # Detalhes da fatura
```

## 🔒 Privacy by Design

### O que é armazenado
- ✅ Apelido do cartão
- ✅ Instituição bancária
- ✅ Bandeira (Visa, Mastercard, etc.)
- ✅ **Apenas os últimos 4 dígitos**
- ✅ Dias de fechamento/vencimento

### O que NUNCA é armazenado
- ❌ Número completo do cartão
- ❌ CVV
- ❌ Senha do cartão
- ❌ Dados sensíveis de autenticação

## 🎯 Strategy Pattern - Sistema de Parsers

### Como Funciona

1. **Interface Comum** (`InvoiceParser`)
   ```typescript
   interface InvoiceParser {
     canParse(file: File): Promise<boolean>
     parse(file: File): Promise<ParseResult>
     readonly name: string
   }
   ```

2. **Factory Automática**
   - Detecta formato automaticamente
   - Testa parsers em ordem de prioridade
   - Retorna resultado estruturado

3. **Extensibilidade**
   Para adicionar um novo banco:
   ```typescript
   // 1. Crie a classe
   export class ItauParser implements InvoiceParser {
     // ... implementação
   }
   
   // 2. Registre no factory (lib/parsers/index.ts)
   private static readonly PARSERS: ParserConfig[] = [
     // ... outros parsers
     {
       type: 'itau',
       parser: new ItauParser(),
       supportedExtensions: ['.csv'],
       priority: 95,
     },
   ]
   ```

### Parsers Implementados

#### 1. Nubank CSV
- **Formato**: `date,category,title,amount`
- **Características**: Valores negativos para débitos
- **Detecção**: Headers específicos do Nubank

#### 2. Banco Inter CSV
- **Formato**: `Data,Descrição,Valor`
- **Características**: Data brasileira (DD/MM/YYYY)
- **Features**: Inferência inteligente de categorias

#### 3. Generic OFX/QFX
- **Formato**: Open Financial Exchange (XML)
- **Suporte**: Itaú, Bradesco, Santander, etc.
- **Robustez**: Parsing de tags OFX padrão

## 🛡️ Validações Implementadas

### Cartões
- ✅ Últimos 4 dígitos devem ser numéricos
- ✅ Apelido e banco obrigatórios
- ✅ Dia de fechamento/vencimento entre 1-31
- ✅ Validação de cartões duplicados

### Faturas
- ✅ Cartão obrigatório
- ✅ Competência válida (mês 1-12, ano 2020-2100)
- ✅ Pelo menos um item na fatura
- ✅ **Idempotência**: Detecta transações duplicadas (mesma data + descrição + valor)

### Parsers
- ✅ Tamanho máximo de arquivo (10MB)
- ✅ Extensões permitidas (.csv, .ofx, .qfx)
- ✅ Validação de estrutura de arquivo
- ✅ Tratamento de erros por linha

## 🚀 Como Usar

### 1. Cadastrar um Cartão
```
/cards/new
```
1. Preencha apelido, banco, bandeira
2. Informe **apenas os últimos 4 dígitos**
3. Configure dias de fechamento e vencimento

### 2. Criar Fatura Manualmente
```
/invoices/new
```
1. Selecione o cartão
2. Escolha a competência (mês/ano)
3. Configure datas
4. Adicione itens manualmente

### 3. Importar Fatura Automaticamente
```
/invoices/new
```
1. Selecione cartão e competência
2. Arraste o arquivo do banco (CSV/OFX)
3. Sistema detecta formato automaticamente
4. Revise os itens importados
5. Confirme a criação

### 4. Visualizar Fatura
```
/invoices/{id}
```
- Resumo financeiro
- Breakdown por categoria
- Lista completa de transações
- Progresso de pagamento

## 📦 Dependências Necessárias

Adicione ao `package.json`:

```json
{
  "dependencies": {
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "react-dropzone": "^14.2.3",
    "lucide-react": "^0.294.0"
  }
}
```

Instale:
```bash
pnpm install react-hook-form @hookform/resolvers zod react-dropzone lucide-react
```

## 🔄 Migrando para Banco de Dados Real

Atualmente usa mock in-memory. Para produção:

### Prisma Schema

```prisma
model CreditCard {
  id           String    @id @default(uuid())
  userId       String
  nickname     String
  bankName     String
  brand        String
  last4Digits  String
  closingDay   Int
  dueDay       Int
  creditLimit  Float?
  isActive     Boolean   @default(true)
  invoices     Invoice[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Invoice {
  id          String        @id @default(uuid())
  userId      String
  cardId      String
  card        CreditCard    @relation(fields: [cardId], references: [id])
  month       Int
  year        Int
  closingDate DateTime
  dueDate     DateTime
  totalAmount Float         @default(0)
  paidAmount  Float         @default(0)
  isPaid      Boolean       @default(false)
  items       InvoiceItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@unique([cardId, month, year])
}

model InvoiceItem {
  id          String   @id @default(uuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  date        DateTime
  description String
  amount      Float
  category    String
  installment String?
  notes       String?
  createdAt   DateTime @default(now())
}
```

### Substituir Server Actions

Nos arquivos `server/actions/*.ts`, substitua os arrays mock por queries Prisma:

```typescript
// Antes (Mock)
let cards: CreditCard[] = []

// Depois (Prisma)
import { prisma } from '@/lib/prisma'

export async function getCards() {
  const { userId } = await auth()
  
  const cards = await prisma.creditCard.findMany({
    where: { userId, isActive: true }
  })
  
  return { success: true, data: cards }
}
```

## 🧪 Testes Recomendados

### Testes Unitários (Parsers)
```typescript
describe('NubankParser', () => {
  it('deve detectar arquivo CSV do Nubank', async () => {
    const file = new File([csvContent], 'fatura.csv')
    const parser = new NubankParser()
    expect(await parser.canParse(file)).toBe(true)
  })
  
  it('deve rejeitar duplicatas', async () => {
    // ...
  })
})
```

### Testes E2E
- ✅ Fluxo completo de cadastro de cartão
- ✅ Importação de fatura válida
- ✅ Rejeição de arquivo inválido
- ✅ Navegação entre competências

## 📚 Boas Práticas Implementadas

### Segurança
- ✅ Validação server-side com Zod
- ✅ Sanitização de inputs
- ✅ Rate limiting recomendado (adicionar middleware)

### Performance
- ✅ Server Components para listagens
- ✅ Client Components apenas onde necessário
- ✅ Parallel data fetching com `Promise.all`

### UX
- ✅ Feedback visual de loading
- ✅ Mensagens de erro claras
- ✅ Drag & drop intuitivo
- ✅ Preview de cartão selecionado

### Manutenibilidade
- ✅ Código tipado (TypeScript)
- ✅ Separação de concerns
- ✅ Documentação inline
- ✅ Padrão Strategy para extensibilidade

## 🐛 Troubleshooting

### Parser não detecta meu arquivo
1. Verifique a extensão (.csv, .ofx, .qfx)
2. Confirme o tamanho (< 10MB)
3. Valide o formato dos headers
4. Check console para logs detalhados

### Duplicatas sendo criadas
- Sistema valida data + descrição + valor
- Ajuste o threshold de comparação se necessário

### Erro de autenticação
- Confirme que Clerk está configurado
- Verifique middleware.ts
- Teste `auth()` em outros Server Actions

## 🎓 Próximos Passos

### Features Sugeridas
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos de gastos mensais
- [ ] Alertas de vencimento
- [ ] Integração com Open Banking
- [ ] Parser para Bradesco, Itaú, C6, etc.
- [ ] OCR para faturas em PDF escaneado
- [ ] Categorização automática com ML
- [ ] Compartilhamento de faturas

### Melhorias Técnicas
- [ ] Migrar para banco de dados real
- [ ] Adicionar testes automatizados
- [ ] Implementar cache com React Query
- [ ] Otimizar bundle size
- [ ] PWA para upload mobile

## 📄 Licença

Este módulo segue a licença do projeto principal.

---

**Desenvolvido com ❤️ seguindo os mais altos padrões de segurança e arquitetura**
