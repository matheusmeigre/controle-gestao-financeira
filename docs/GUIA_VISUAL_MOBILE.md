# 🎯 GUIA VISUAL RÁPIDO - MOBILE-FIRST

## 📱 NAVEGAÇÃO MOBILE

### Bottom Navigation (Sempre Visível)
```
┌─────────────────────────────────────┐
│                                     │
│         [CONTEÚDO DA TELA]          │
│                                     │
│                               [+]   │ ← FAB (Floating Action Button)
├─────────────────────────────────────┤
│  [🏠]    [📄]    [📊]    [👤]      │ ← Bottom Navigation
│ Início  Extrato Relatórios Perfil  │
└─────────────────────────────────────┘
```

---

## 🏠 TELA 1: HOME (Início)

### Layout Mobile:
```
┌────────────────────────────┐
│ 👋 Olá, Matheus            │
│ Controle de Gastos         │
├────────────────────────────┤
│ 💰 Saldo em Conta          │
│    R$ 2.000,00    ✓        │
│    Recebido: R$ 2.000      │
│    Pago: R$ 0,00           │
├────────────────────────────┤
│ 📊 Projeção do Mês         │
│    R$ 2.399,08    ⚠        │
│    Receitas: R$ 2.800      │
│    Despesas: R$ 400,92     │
│    A receber: R$ 800       │
├────────────────────────────┤
│ 📊 Resumo Rápido           │
│ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │  1  │ │  1  │ │  0  │   │
│ │ 🔴  │ │ 🟢  │ │ 💳  │   │
│ └─────┘ └─────┘ └─────┘   │
│ Despesas Receitas Faturas  │
├────────────────────────────┤
│ 🎯 Planning Alerts         │
│ (Se houver alertas)        │
├────────────────────────────┤
│ 💡 DICA: Clique no + para  │
│    adicionar transação     │
└────────────────────────────┘
│  [🏠]  [📄]  [📊]  [👤]  │
└────────────────────────────┘
```

### **AÇÕES:**
- Ver saldo real imediatamente ✓
- Ver projeção do mês ✓
- Ver resumo rápido (4 cards) ✓
- Clicar no **FAB (+)** para adicionar transação ✓

---

## 📄 TELA 2: EXTRATO (Transações)

### Layout Mobile:
```
┌────────────────────────────┐
│ 📄 Extrato Completo        │
│ Todas as transações do mês │
├────────────────────────────┤
│ [Despesas][Cartões][Renda] │ ← Tabs
├────────────────────────────┤
│ Filtro: Todas ▼            │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ 02/02  🍽️ Educação    │ │
│ │ Faculdade              │ │
│ │ R$ 400,92        [✏️][🗑️]│ │
│ │ ⚠️ Pendente  📆 Mensal │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ [+ Adicionar Despesa]  │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ [GASTOS DO MÊS]            │
│ Total de despesas...       │
└────────────────────────────┘
│  [🏠]  [📄]  [📊]  [👤]  │
└────────────────────────────┘
```

### **AÇÕES:**
- Ver TODAS as transações organizadas ✓
- Alternar entre Despesas, Cartões, Receitas ✓
- Filtrar por categoria ✓
- Editar/Deletar transações ✓
- Adicionar nova transação ✓

---

## 📊 TELA 3: RELATÓRIOS

### Layout Mobile:
```
┌────────────────────────────┐
│         📊                 │
│ Relatórios e Análises      │
│ Em breve você terá...      │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ 📈 Gastos por Categoria│ │
│ │ Em desenvolvimento     │ │
│ │ [  Gráfico Pizza  ]    │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 📉 Evolução Mensal     │ │
│ │ Em desenvolvimento     │ │
│ │ [  Gráfico Linha  ]    │ │
│ └────────────────────────┘ │
└────────────────────────────┘
│  [🏠]  [📄]  [📊]  [👤]  │
└────────────────────────────┘
```

### **AÇÕES:**
- Visualizar preview de features futuras ✓
- Manter expectativa do usuário ✓

---

## 👤 TELA 4: PERFIL

### Layout Mobile:
```
┌────────────────────────────┐
│         👤                 │
│       Matheus              │
│ matheus@gmail.com          │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ ⚙️ Configurações    ›  │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 🎨 Aparência        ›  │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ ℹ️ Sobre o App      ›  │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ 🚪 Sair da Conta       │ │ ← Vermelho
│ └────────────────────────┘ │
├────────────────────────────┤
│   Controle de Gastos v2.0  │
│   Desenvolvido com ❤️      │
└────────────────────────────┘
│  [🏠]  [📄]  [📊]  [👤]  │
└────────────────────────────┘
```

### **AÇÕES:**
- Ver informações da conta ✓
- Acessar configurações (futuro) ✓
- Mudar aparência (futuro) ✓
- Sair da conta ✓

---

## ➕ MODAL: ADICIONAR TRANSAÇÃO (FAB)

### Bottom Sheet (50% da tela):
```
┌────────────────────────────┐
│                            │ ← Background escurecido
│ ┌────────────────────────┐ │
│ │ ━━━━                   │ │ ← Drag handle
│ │ Nova Transação      [X]│ │
│ │ Adicione despesa/renda │ │
│ ├────────────────────────┤ │
│ │ [Despesa] [Receita]    │ │ ← Tabs
│ ├────────────────────────┤ │
│ │ Descrição *            │ │
│ │ [__________________]   │ │
│ │                        │ │
│ │ Valor (R$) *           │ │
│ │ [__________________]   │ │
│ │                        │ │
│ │ Categoria *            │ │
│ │ [Selecione... ▼]      │ │
│ │                        │ │
│ │ Data      Status       │ │
│ │ [____]    [____]       │ │
│ ├────────────────────────┤ │
│ │ [Adicionar Despesa]    │ │ ← Grande
│ │ [Cancelar]             │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### **AÇÕES:**
- Abrir pelo FAB (+) de qualquer tela ✓
- Escolher tipo: Despesa ou Receita ✓
- Preencher campos obrigatórios ✓
- Salvar e voltar automaticamente ✓
- Cancelar e fechar ✓

---

## 🎯 FLUXOS PRINCIPAIS

### **1. CONSULTA RÁPIDA (5 segundos)**
```
1. Abrir app
2. Ver saldo na home
   ↓
✓ Objetivo alcançado
```

### **2. ADICIONAR TRANSAÇÃO (10 segundos)**
```
1. De qualquer tela
2. Clicar no FAB (+)
3. Preencher 3 campos obrigatórios
4. Clicar "Adicionar"
   ↓
✓ Transação salva
```

### **3. VER DETALHES (3 cliques)**
```
1. Home
2. Clicar "Extrato" (Bottom Nav)
3. Navegar pelas tabs
   ↓
✓ Ver todas as transações
```

### **4. GERENCIAR TRANSAÇÃO (4 cliques)**
```
1. Extrato
2. Encontrar transação
3. Clicar [✏️] para editar
4. Salvar alterações
   ↓
✓ Transação atualizada
```

---

## 🎨 CORES E SIGNIFICADOS

### **Semântica Visual:**
```
🟢 VERDE:   Positivo, Receitas, Saldo positivo
🔴 VERMELHO: Negativo, Despesas, Atenção
🔵 AZUL:    Neutro, Faturas, Informação
🟠 LARANJA:  Alerta, Pendente, Ação necessária
⚪ CINZA:    Secundário, Menos importante
```

### **Estados:**
```
✓ Recebido/Pago:  Verde sólido
⚠ Pendente:       Laranja com badge
📅 Recorrente:    Ícone de repetição
🔄 Processando:   Animação
```

---

## 📏 ESPAÇAMENTOS

### **Hierarquia Visual:**
```
1️⃣ Cards de Saldo:        Gap: 12px (mobile)
2️⃣ Seções:                Margin: 16px
3️⃣ Elementos internos:    Gap: 8px
4️⃣ Textos:                Line-height: 1.5
```

### **Tamanhos de Fonte:**
```
Título principal:  20px (xl)
Subtítulo:        16px (base)
Corpo:            14px (sm)
Caption:          12px (xs)
```

---

## 🧪 TESTE EM 3 PASSOS

### **1. Navegação**
```bash
✓ Clicar em cada botão da Bottom Nav
✓ Verificar que conteúdo muda
✓ Verificar que botão ativo destaca
```

### **2. Ações**
```bash
✓ Clicar no FAB (+)
✓ Preencher modal
✓ Adicionar transação
✓ Ver atualização na home
```

### **3. Fluidez**
```bash
✓ Scroll suave
✓ Transições sem lag
✓ Touch responses rápidas
✓ Sem scroll horizontal
```

---

## 💡 DICAS DE USO

### **Para o Usuário:**
1. **Home:** Visão geral rápida (sem scroll!)
2. **Extrato:** Ver/gerenciar todas as transações
3. **FAB (+):** Ação mais comum sempre acessível
4. **Bottom Nav:** Navegação principal rápida

### **Para Desenvolvedores:**
1. Conteúdo controlado por `activeNav`
2. Renderização condicional por seção
3. Export Manager oculto no mobile
4. Responsive breakpoints: mobile < 768px < desktop

---

## 🎉 RESULTADO

### **Antes:**
- Scroll extensivo ❌
- Navegação confusa ❌
- Duplicação de elementos ❌
- Não mobile-friendly ❌

### **Depois:**
- Informação imediata ✅
- Navegação clara ✅
- Conteúdo otimizado ✅
- 100% mobile-first ✅

---

**Tempo para dominar:** 2 minutos  
**Curva de aprendizado:** Intuitiva  
**Padrão:** Material Design 3  
**Inspiração:** Nubank, Inter, PicPay

🚀 **APP PRONTO PARA USO!** 🚀
