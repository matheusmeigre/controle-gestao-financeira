# 📱 Refatoração Mobile-First - Guia Completo

> **Documento histórico:** a versão atual centraliza layout, navegação e safe areas em `AppShell`. Os trechos com `MobileLayout` permanecem apenas como registro da refatoração anterior.

## 🎯 Visão Geral

Este documento detalha a refatoração completa da aplicação de gestão financeira, transformando de **Desktop-First para Mobile-First**, com lógica financeira correta seguindo princípios contábeis.

---

## 📊 Problema Identificado

### ❌ Antes da Refatoração

1. **UX Desktop-First**
   - Navegação via tabs horizontais
   - Ações principais no final da página (requer scroll)
   - Não otimizado para uso com o polegar
   - Bottom navigation ausente

2. **Lógica Financeira Incorreta**
   - `MonthlyBalance` somava TODAS as transações sem considerar status
   - Misturava **Regime de Caixa** (dinheiro real) com **Regime de Competência** (projeção)
   - Usuário via saldo irreal, quebrando confiança

### ✅ Depois da Refatoração

1. **UX Mobile-First**
   - Bottom Navigation fixa (4 seções)
   - FAB (Floating Action Button) sempre acessível
   - Bottom Sheet otimizado para teclado mobile
   - Thumb-friendly design

2. **Lógica Financeira Correta**
   - **Saldo Atual**: Apenas valores pagos/recebidos (Regime de Caixa)
   - **Projeção**: Todos os valores previstos (Regime de Competência)
   - Separação clara visual entre os dois conceitos

---

## 🏗️ Arquitetura de Componentes

### 1. **Componentes Mobile (`src/components/mobile/`)**

#### `BottomNavigation`
```typescript
// Navegação inferior fixa com 4 seções
<BottomNavigation 
  activeTab="home" 
  onTabChange={(tab) => setActiveTab(tab)} 
/>
```

**Funcionalidades:**
- 4 seções: Home, Extrato, Relatórios, Perfil
- Ícones Material Design 3
- Active state com animação
- Acessibilidade (aria-labels)

#### `FloatingActionButton`
```typescript
// Botão de ação principal flutuante
<FloatingActionButton 
  onClick={() => setShowQuickAdd(true)} 
  label="Nova transação"
/>
```

**Características:**
- Posicionado na zona do polegar (bottom-right)
- Animação active:scale
- Focus states para acessibilidade

#### `MobileLayout`
```typescript
// Layout wrapper que gerencia espaçamento
<MobileLayout hasBottomNav hasFAB>
  {children}
</MobileLayout>
```

**Responsabilidades:**
- Adiciona padding-bottom para bottom nav
- Previne conteúdo coberto
- Responsivo para desktop

---

### 2. **Componentes de Saldo (`src/components/balance/`)**

#### `CurrentBalanceCard`
```typescript
// 💰 Saldo Atual - Regime de Caixa
<CurrentBalanceCard summary={financialSummary} />
```

**Exibe:**
- Saldo disponível AGORA (receitas recebidas - despesas pagas)
- Tooltip explicativo do conceito
- Visual state (verde/vermelho)

**Regra de Negócio:**
```javascript
Saldo Atual = 
  (Receitas com status "received") 
  - 
  (Despesas com status "paid")
```

#### `ProjectedBalanceCard`
```typescript
// 📊 Projeção - Regime de Competência
<ProjectedBalanceCard summary={financialSummary} />
```

**Exibe:**
- Previsão de sobra/falta no mês
- Progress bar de gastos
- Valores pendentes (a receber/pagar)
- Alertas visuais

**Regra de Negócio:**
```javascript
Projeção = 
  (TODAS as Receitas previstas) 
  - 
  (TODAS as Despesas previstas)
```

---

### 3. **Modal de Transação Rápida**

#### `QuickTransactionModal`
```typescript
<QuickTransactionModal
  open={showQuickAdd}
  onOpenChange={setShowQuickAdd}
  onAddExpense={addExpense}
  onAddIncome={addIncome}
/>
```

**Características:**
- Drawer (Bottom Sheet) com 50% da altura
- Tabs: Despesa | Receita
- Campos otimizados (inputMode="decimal")
- Keyboard-aware (não sobrepõe campos)
- Autofocus inteligente

**Fluxo:**
1. Usuário clica no FAB
2. Abre bottom sheet
3. Seleciona tipo (Despesa/Receita)
4. Preenche campos essenciais
5. Confirma e retorna ao dashboard

---

### 4. **Sistema de Lógica Financeira**

#### `financial-calculations.ts`
```typescript
// Função principal de cálculo
export function calculateFinancialSummary(
  incomes: Income[],
  expenses: Expense[],
  cardBills: CardBill[]
): FinancialSummary
```

**Retorno:**
```typescript
interface FinancialSummary {
  // Regime de Caixa
  currentBalance: number
  paidExpenses: number
  receivedIncomes: number
  
  // Regime de Competência
  projectedBalance: number
  totalExpectedExpenses: number
  totalExpectedIncomes: number
  
  // Detalhamento
  details: {
    generalExpenses: { paid: number; expected: number }
    subscriptions: { paid: number; expected: number }
    cardBills: { paid: number; expected: number }
    incomes: { received: number; expected: number }
    pendingExpenses: number
    pendingIncomes: number
  }
}
```

**Regras Implementadas:**
1. ✅ Receitas com `status: "received"` entram no Saldo Atual
2. ✅ Despesas com `status: "paid"` entram no Saldo Atual
3. ✅ Assinaturas com `isActive: false` são ignoradas
4. ✅ Faturas de cartão (sem status) entram apenas na Projeção
5. ✅ Valores pendentes aparecem separados

#### `useFinancialSummary` Hook
```typescript
const financialSummary = useFinancialSummary({
  incomes: currentMonthData.incomes,
  expenses: currentMonthData.expenses,
  cardBills: currentMonthData.cardBills,
})
```

**Benefícios:**
- Memoização automática (useMemo)
- Evita recálculos desnecessários
- Performance otimizada

---

## 🎨 Padrões de Design

### Material Design 3
- Bottom Navigation com ripple effect
- FAB com shadow elevation
- Bottom Sheet com drag handle

### Color System
```css
/* Positivo (Verde) */
text-green-600 dark:text-green-500
bg-green-50 dark:bg-green-950/30

/* Negativo (Vermelho) */
text-red-600 dark:text-red-500
bg-red-50 dark:bg-red-950/30

/* Neutro */
text-muted-foreground
bg-muted
```

### Typography Scale
```css
/* Mobile */
text-xs  → 0.75rem (12px)
text-sm  → 0.875rem (14px)
text-base → 1rem (16px)
text-xl  → 1.25rem (20px)

/* Desktop (md:) */
text-sm  → 0.875rem (14px)
text-base → 1rem (16px)
text-lg  → 1.125rem (18px)
text-2xl → 1.5rem (24px)
```

---

## 📐 Layout & Spacing

### Grid System
```tsx
// 2 colunas mobile, 4 no tablet+
<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
```

### Spacing Scale
```css
gap-3     → 0.75rem (12px) - mobile
gap-4     → 1rem (16px) - tablet+
mb-4      → bottom margin
sm:mb-6   → maior espaçamento em telas maiores
```

### Breakpoints
```css
sm: 640px   (tablet)
md: 768px   (desktop)
lg: 1024px  (large desktop)
```

---

## 🚀 Como Usar

### 1. Ativar o Layout Mobile-First

**Opção A: Substituir page.tsx (Recomendado)**
```bash
# Backup do original
mv src/app/page.tsx src/app/page-desktop-old.tsx

# Ativar novo layout
mv src/app/page-mobile-first.tsx src/app/page.tsx
```

**Opção B: Testar em paralelo**
```tsx
// Criar uma rota separada para testar
// src/app/mobile/page.tsx
export { default } from '../page-mobile-first'
```

### 2. Adicionar Status às Faturas (Opcional)

Se quiser que faturas de cartão também tenham status:

```typescript
// src/types/expense.ts
export interface CardBill {
  // ... campos existentes
  status?: 'paid' | 'pending' // ← Adicionar
}
```

Depois atualizar a lógica:
```typescript
// src/lib/financial-calculations.ts
const paidCardBills = cardBills
  .filter(bill => bill.status === 'paid')
  .reduce((sum, bill) => sum + bill.totalAmount, 0)
```

### 3. Personalizar Navegação

```typescript
// Adicionar mais seções na bottom nav
const navItems = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'transactions', label: 'Extrato', icon: FileText },
  { id: 'planning', label: 'Viagens', icon: Plane }, // ← Nova seção
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'profile', label: 'Perfil', icon: User },
]
```

---

## 🧪 Testes Recomendados

### 1. Testes de Lógica Financeira
```typescript
// tests/lib/financial-calculations.test.ts
describe('calculateFinancialSummary', () => {
  it('should only include paid expenses in currentBalance', () => {
    const expenses = [
      { status: 'paid', amount: 100 },
      { status: 'pending', amount: 200 },
    ]
    
    const summary = calculateFinancialSummary([], expenses, [])
    
    expect(summary.paidExpenses).toBe(100)
    expect(summary.currentBalance).toBe(-100)
    expect(summary.projectedBalance).toBe(-300)
  })
})
```

### 2. Testes de Componentes
```typescript
// tests/components/balance/current-balance-card.test.tsx
it('should display positive balance in green', () => {
  const summary = { currentBalance: 500, ... }
  
  render(<CurrentBalanceCard summary={summary} />)
  
  expect(screen.getByText(/500/)).toHaveClass('text-green-600')
})
```

### 3. Testes Mobile
- ✅ Bottom Navigation acessível com o polegar
- ✅ FAB não sobrepõe conteúdo importante
- ✅ Teclado não cobre campos do form
- ✅ Bottom Sheet fecha ao arrastar para baixo

---

## 📱 Boas Práticas Mobile

### Thumb Zone (Zona do Polegar)
```
┌─────────────────┐
│                 │ ← Difícil alcançar
│                 │
│     FÁCIL       │ ← Fácil alcançar
│                 │
│     [FAB]  [Nav]│ ← Zona ideal
└─────────────────┘
```

### Input Types
```tsx
// Use inputMode para teclado numérico
<Input 
  type="number" 
  inputMode="decimal" // ← Mostra teclado numérico
/>

// Date picker nativo mobile
<Input type="date" />
```

### Performance
```tsx
// Memoize cálculos pesados
const summary = useMemo(() => 
  calculateFinancialSummary(incomes, expenses, cardBills),
  [incomes, expenses, cardBills]
)
```

---

## 🔄 Migração Gradual

Se preferir migrar aos poucos:

### Fase 1: Adicionar Componentes Base
- ✅ Instalar componentes mobile
- ✅ Adicionar bottom navigation
- ⏸️ Manter layout desktop

### Fase 2: Corrigir Lógica Financeira
- ✅ Implementar `calculateFinancialSummary`
- ✅ Substituir `MonthlyBalance` pelos novos cards
- ⏸️ Manter navegação antiga

### Fase 3: Layout Completo Mobile-First
- ✅ Ativar bottom navigation
- ✅ Adicionar FAB
- ✅ Implementar quick add modal

---

## 🐛 Troubleshooting

### Problema: FAB cobrindo conteúdo
**Solução:**
```tsx
<MobileLayout hasBottomNav hasFAB>
  {/* Adiciona padding automático */}
</MobileLayout>
```

### Problema: Teclado cobrindo campos
**Solução:**
```tsx
// Usar Drawer com scroll interno
<DrawerContent className="max-h-[85vh]">
  <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
    {/* Campos aqui */}
  </div>
</DrawerContent>
```

### Problema: Saldo incorreto
**Checklist:**
1. Verifique se transações têm o campo `status`
2. Confirme valores: `paid`, `pending`, `received`
3. Verifique se assinaturas têm `isActive`

---

## 📚 Referências

- [Material Design 3 - Navigation](https://m3.material.io/components/navigation-bar)
- [Thumb Zone Research](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)
- [Regime de Caixa vs Competência](https://www.contabilizei.com.br/contabilidade-online/regime-de-caixa-e-regime-de-competencia/)

---

## ✅ Checklist de Implementação

- [x] Criar componentes mobile (BottomNav, FAB, MobileLayout)
- [x] Implementar lógica financeira correta
- [x] Criar CurrentBalanceCard e ProjectedBalanceCard
- [x] Implementar QuickTransactionModal
- [x] Refatorar page.tsx mobile-first
- [ ] Adicionar status às faturas de cartão (opcional)
- [ ] Implementar tela de Relatórios
- [ ] Implementar tela de Perfil
- [ ] Adicionar testes unitários
- [ ] Testar em dispositivos reais

---

## 🎉 Resultado Final

### Antes (Desktop-First)
- ❌ Scroll necessário para navegação
- ❌ Ações no final da página
- ❌ Saldo incorreto (mistura caixa + competência)
- ❌ Não otimizado para mobile

### Depois (Mobile-First)
- ✅ Bottom Navigation sempre visível
- ✅ FAB acessível com o polegar
- ✅ Saldo Real vs Projeção separados
- ✅ Lógica financeira correta
- ✅ Bottom Sheet otimizado
- ✅ Design thumb-friendly

---

**Desenvolvido com foco em UX mobile e regras de negócio financeiras corretas** 💰📱
