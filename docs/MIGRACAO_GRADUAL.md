# 🔄 Guia de Migração Gradual - Mobile-First

> **Documento histórico:** desde julho de 2026, `MobileLayout` e `MobileContainer` foram substituídos por `AppShell`, aplicado no layout das rotas protegidas. Os exemplos abaixo registram a migração anterior e não devem ser usados em código novo.

## 🎯 Objetivo

Este guia mostra como **migrar gradualmente** do layout Desktop-First para Mobile-First, permitindo que você teste cada etapa antes de prosseguir.

---

## 📋 Estratégia de Migração

### Opção A: Migração Total (Recomendado)
- ⏱️ **Tempo:** 5 minutos
- ⚡ **Impacto:** Imediato
- ✅ **Risco:** Baixo (tudo já testado)

### Opção B: Migração Gradual (Este Guia)
- ⏱️ **Tempo:** 30-60 minutos
- 🧪 **Impacto:** Incremental
- ✅ **Risco:** Muito Baixo (teste em cada etapa)

---

## 📊 Fases da Migração Gradual

```
Fase 1: Corrigir Lógica Financeira
  ↓ (teste e valide)
  
Fase 2: Adicionar Componentes Mobile
  ↓ (teste e valide)
  
Fase 3: Implementar Quick Add
  ↓ (teste e valide)
  
Fase 4: Ativar Layout Completo
  ✅ (deploy)
```

---

## 🔧 FASE 1: Corrigir Lógica Financeira

### Objetivo
Implementar cálculo correto de saldo sem alterar o layout atual.

### Passo 1.1: Adicionar a Lógica
```bash
# Arquivos já criados:
# ✅ src/lib/financial-calculations.ts
# ✅ src/hooks/use-financial-summary.ts
```

### Passo 1.2: Atualizar page.tsx (Apenas Lógica)
```typescript
// src/app/page.tsx

// No início do componente, adicionar:
import { useFinancialSummary } from '@/hooks/use-financial-summary'

// Dentro do componente HomePage:
const financialSummary = useFinancialSummary({
  incomes: currentMonthData.incomes,
  expenses: currentMonthData.expenses,
  cardBills: currentMonthData.cardBills,
})

// Substituir MonthlyBalance por:
import { CurrentBalanceCard, ProjectedBalanceCard } from '@/components/balance'

// No JSX:
<div className="mb-4 sm:mb-6 grid gap-4 lg:grid-cols-2">
  <CurrentBalanceCard summary={financialSummary} />
  <ProjectedBalanceCard summary={financialSummary} />
</div>
```

### Passo 1.3: Testar
```bash
npm run dev
```

**Validação:**
- [ ] Saldo Real mostra apenas valores paid/received
- [ ] Projeção mostra todos os valores
- [ ] Layout desktop ainda funciona
- [ ] Cores corretas (verde/vermelho)

**Se algo der errado:**
1. Verifique se os imports estão corretos
2. Confirme que os arquivos foram criados
3. Restart o servidor (Ctrl+C, npm run dev)

---

## 📱 FASE 2: Adicionar Componentes Mobile

### Objetivo
Adicionar Bottom Navigation e FAB sem quebrar nada.

### Passo 2.1: Importar Componentes Mobile
```typescript
// src/app/page.tsx

import { 
  BottomNavigation, 
  FloatingActionButton,
  MobileLayout,
  type NavigationTab 
} from '@/components/mobile'
import { useState } from 'react' // se já não tiver

// Adicionar estados:
const [activeNav, setActiveNav] = useState<NavigationTab>('home')
const [showQuickAdd, setShowQuickAdd] = useState(false)
```

### Passo 2.2: Envolver Conteúdo com MobileLayout
```typescript
// Trocar:
<div className="min-h-screen bg-background flex flex-col">

// Por:
<MobileLayout hasBottomNav hasFAB>
```

### Passo 2.3: Adicionar Bottom Nav e FAB (Antes do Fechamento)
```typescript
// Antes de fechar o MobileLayout, adicionar:

{/* Bottom Navigation - Mobile Only */}
<BottomNavigation activeTab={activeNav} onTabChange={setActiveNav} />

{/* Floating Action Button */}
<FloatingActionButton onClick={() => setShowQuickAdd(true)} />

</MobileLayout>
```

### Passo 2.4: Testar
```bash
npm run dev
```

**Desktop (F12 → Device Toolbar OFF):**
- [ ] Bottom Nav não aparece
- [ ] FAB aparece mas não incomoda
- [ ] Layout normal funciona

**Mobile (F12 → Device Toolbar ON → iPhone 12):**
- [ ] Bottom Nav aparece na parte inferior
- [ ] FAB aparece no canto inferior direito
- [ ] Clicar no FAB não faz nada ainda (ok por enquanto)

---

## ⚡ FASE 3: Implementar Quick Add Modal

### Objetivo
Fazer o FAB abrir um modal funcional.

### Passo 3.1: Importar Modal
```typescript
// src/app/page.tsx

import { QuickTransactionModal } from '@/components/quick-transaction-modal'
```

### Passo 3.2: Adicionar Modal ao JSX
```typescript
// Logo após os modais existentes (WelcomeModal, TermsModal):

<QuickTransactionModal
  open={showQuickAdd}
  onOpenChange={setShowQuickAdd}
  onAddExpense={addExpense}
  onAddIncome={addIncome}
  onAddCardBill={addCardBill}
/>
```

### Passo 3.3: Testar
```bash
npm run dev
```

**Mobile:**
- [ ] Clicar no FAB abre o Bottom Sheet
- [ ] Bottom Sheet ocupa ~50% da tela
- [ ] Tabs Despesa/Receita funcionam
- [ ] Campos são preenchíveis
- [ ] Botão "Adicionar" funciona
- [ ] Modal fecha após adicionar

---

## 🎨 FASE 4: Ativar Layout Completo (Opcional)

### Objetivo
Usar navegação por seções em vez de tabs horizontais.

### Passo 4.1: Controlar Conteúdo por Navegação
```typescript
// Substituir a estrutura de tabs por:

{activeNav === 'home' && (
  <>
    <DashboardHeader />
    <div className="grid gap-3 mb-4 sm:gap-4 sm:mb-6 md:grid-cols-2">
      <CurrentBalanceCard summary={financialSummary} />
      <ProjectedBalanceCard summary={financialSummary} />
    </div>
    <PlanningAlerts />
    {/* ... */}
  </>
)}

{activeNav === 'transactions' && (
  <>
    <h2 className="text-xl font-bold mb-4">Extrato</h2>
    <ExpensesTabContent {...props} />
    <CardsTabContent {...props} />
    <IncomesTabContent {...props} />
  </>
)}

{activeNav === 'reports' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Relatórios</h2>
    <p className="text-muted-foreground">Em breve...</p>
  </div>
)}

{activeNav === 'profile' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Perfil</h2>
    <p className="text-muted-foreground">Configurações...</p>
  </div>
)}
```

### Passo 4.2: Remover Navegação Antiga (Opcional)
```typescript
// Comentar ou remover:
// <MainNavigation ... />
```

### Passo 4.3: Testar
```bash
npm run dev
```

**Mobile:**
- [ ] Bottom Nav muda o conteúdo
- [ ] Home mostra dashboard
- [ ] Transactions mostra extrato completo
- [ ] Reports e Profile mostram placeholders
- [ ] Navegação é fluida

---

## 🔄 Rollback Rápido

### Se algo der errado, reverter é fácil:

#### Reverter Fase 4 (Layout Completo)
```typescript
// Descomentar:
<MainNavigation ... />

// Remover:
{activeNav === ...}
```

#### Reverter Fase 3 (Modal)
```typescript
// Remover:
<QuickTransactionModal ... />
```

#### Reverter Fase 2 (Componentes Mobile)
```typescript
// Remover:
<BottomNavigation ... />
<FloatingActionButton ... />

// Trocar MobileLayout por div:
<div className="min-h-screen bg-background flex flex-col">
```

#### Reverter Fase 1 (Lógica)
```typescript
// Remover:
const financialSummary = useFinancialSummary(...)

// Restaurar:
<MonthlyBalance ... />
```

---

## 📊 Checklist de Validação por Fase

### Fase 1 ✅
- [ ] Saldo Real correto
- [ ] Projeção correta
- [ ] Layout desktop intacto
- [ ] Sem erros no console

### Fase 2 ✅
- [ ] Bottom Nav funciona (mobile)
- [ ] FAB visível
- [ ] Desktop não afetado
- [ ] Sem erros no console

### Fase 3 ✅
- [ ] Modal abre/fecha
- [ ] Adicionar despesa funciona
- [ ] Adicionar receita funciona
- [ ] Dados persistem

### Fase 4 ✅
- [ ] Navegação por seções
- [ ] Todas as seções renderizam
- [ ] Transição suave
- [ ] Performance ok

---

## ⚠️ Problemas Conhecidos e Soluções

### Problema: "Cannot find module '@/components/mobile'"
**Solução:**
```bash
# Restart do servidor
Ctrl+C
npm run dev
```

### Problema: Bottom Nav não aparece no mobile
**Solução:**
```typescript
// Verificar se está usando DevTools mobile mode
// F12 → Toggle Device Toolbar (Ctrl+Shift+M)

// Verificar se MobileLayout está envolvendo tudo:
<MobileLayout hasBottomNav hasFAB>
  {children}
</MobileLayout>
```

### Problema: FAB cobre conteúdo
**Solução:**
```typescript
// MobileLayout adiciona padding automático
// Se ainda cobrir, ajustar:
<MobileLayout hasBottomNav hasFAB className="pb-20">
```

### Problema: Saldo ainda incorreto
**Solução:**
```typescript
// Verificar se todas as transações têm status:
expenses.forEach(e => {
  console.log(e.description, e.status) // deve ter "paid" ou "pending"
})

incomes.forEach(i => {
  console.log(i.description, i.status) // deve ter "received" ou "pending"
})
```

---

## 🎯 Recomendações

### Para Projetos Pequenos
- **Use Migração Total** (Opção A)
- Tempo: 5 minutos
- Risco: Baixo

### Para Projetos em Produção
- **Use Migração Gradual** (Opção B)
- Fase 1 → Deploy → Teste
- Fase 2 → Deploy → Teste
- Fase 3 → Deploy → Teste
- Fase 4 → Deploy → Validação Final

### Para Testes A/B
```typescript
// Feature flag simples
const useMobileFirst = process.env.NEXT_PUBLIC_MOBILE_FIRST === 'true'

return useMobileFirst 
  ? <PageMobileFirst />
  : <PageDesktop />
```

---

## ✅ Checklist Final

Antes de considerar concluído:

- [ ] Todas as 4 fases implementadas
- [ ] Testado em Desktop (Chrome)
- [ ] Testado em Mobile Simulator (DevTools)
- [ ] Testado em dispositivo real (opcional)
- [ ] Sem erros no console
- [ ] Performance ok
- [ ] Lógica financeira validada
- [ ] UX aprovado

---

## 📞 Suporte

Se encontrar dificuldades:

1. **Reverta a fase problemática** (rollback rápido)
2. **Consulte a documentação completa** (REFATORACAO_MOBILE_FIRST.md)
3. **Verifique os arquivos criados** (todos comentados)
4. **Teste em modo isolado** (criar rota /mobile separada)

---

## 🎉 Parabéns!

Se completou todas as fases, você tem:

✅ Layout Mobile-First funcional  
✅ Lógica financeira correta  
✅ UX excepcional  
✅ Código modular e escalável

---

**Boa sorte com a migração!** 🚀

*Desenvolvido com cuidado para garantir zero breaking changes*
