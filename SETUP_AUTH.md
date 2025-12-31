# 🔐 Guia de Configuração - Sistema de Autenticação Multi-Tenant

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Clerk](https://clerk.com) (gratuita)
- Acesso a uma conta Google e/ou Microsoft para testes

---

## 🚀 Passo a Passo de Configuração

### **1. Configurar o Clerk (5 minutos)**

#### 1.1. Criar conta e projeto
1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Clique em **"Sign up"** e crie sua conta
3. Crie um novo projeto com o nome `Minha Gestão Financeira`

#### 1.2. Habilitar provedores sociais
1. No menu lateral, vá em **"User & Authentication" → "Social Connections"**
2. Ative os provedores:
   - ✅ **Google** (Clerk fornece credenciais de desenvolvimento automáticas)
   - ✅ **Microsoft** (mesmo processo)
3. Para produção, você pode configurar suas próprias credenciais OAuth

#### 1.3. Copiar as chaves de API
1. No menu lateral, clique em **"API Keys"**
2. Você verá duas chaves:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

---

### **2. Configurar Variáveis de Ambiente**

1. Na raiz do projeto, copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edite `.env.local` e cole suas chaves:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_AQUI
   CLERK_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
   
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

---

### **3. Instalar Dependências e Rodar**

```bash
# Instale as dependências (se ainda não fez)
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🧪 Testando o Sistema

### **Primeiro Acesso**
1. Ao acessar `http://localhost:3000`, você será redirecionado para `/sign-in`
2. Clique em **"Continue with Google"** ou **"Continue with Microsoft"**
3. Autorize o acesso
4. Você será redirecionado automaticamente para o dashboard (`/`)

### **Segregação de Dados**
1. Faça login com o usuário A
2. Adicione algumas despesas/receitas
3. Faça logout
4. Faça login com o usuário B (outra conta Google/Microsoft)
5. **Resultado esperado:** O usuário B não verá os dados do usuário A

### **Persistência de Sessão**
1. Feche e abra o navegador
2. Acesse `http://localhost:3000`
3. **Resultado esperado:** Você ainda estará logado (sessão persistida)

---

## 🔒 Segurança Implementada

### ✅ **Autenticação (AuthN)**
- **OAuth 2.0** via Google e Microsoft
- Tokens JWT gerenciados automaticamente pelo Clerk
- Sessões seguras com cookies HTTP-only

### ✅ **Autorização (AuthZ)**
- Middleware Next.js protege rotas automaticamente
- Cada registro possui campo `userId` obrigatório
- localStorage usa chave única por usuário: `expenses_{userId}`
- Filtros de segurança impedem leitura de dados de outros usuários

### ✅ **Proteção de Rotas**
- Rotas públicas: `/sign-in`, `/sign-up`
- Rotas protegidas: `/` (dashboard) e todas as outras
- Redirecionamento automático para login se não autenticado

---

## 📦 Estrutura de Dados (Multi-Tenant)

### **Antes (sem autenticação)**
```typescript
interface Expense {
  id: string
  description: string
  amount: number
  // ...
}
```

### **Depois (com segregação)**
```typescript
interface Expense {
  id: string
  userId: string // ✅ Campo obrigatório
  description: string
  amount: number
  // ...
}
```

**Todos os novos registros** recebem automaticamente o `userId` do usuário logado.

---

## 🛠️ Migração de Dados Existentes (Opcional)

Se você já tinha dados no localStorage antes da autenticação:

```javascript
// Execute no console do navegador (apenas uma vez)
const userId = "SEU_USER_ID_AQUI"; // Pegue do Clerk Dashboard

// Migrar expenses
const oldExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
const migratedExpenses = oldExpenses.map(e => ({ ...e, userId }));
localStorage.setItem(`expenses_${userId}`, JSON.stringify(migratedExpenses));

// Repetir para cardBills e incomes
```

---

## 🎨 Customização Avançada

### **Alterar cores do Clerk**
Edite o [app/layout.tsx](app/layout.tsx#L44):
```tsx
<ClerkProvider appearance={{
  variables: { 
    colorPrimary: '#3b82f6', // Azul
    borderRadius: '0.5rem'
  }
}}>
```

### **Adicionar mais provedores**
No Clerk Dashboard:
- GitHub, Facebook, LinkedIn, Apple, etc.
- Basta ativar em "Social Connections"

---

## 🐛 Troubleshooting

### **Erro: "Clerk publishable key not found"**
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### **Redirecionamento infinito no login**
- Verifique se as URLs no `.env.local` estão corretas
- Certifique-se de que o `middleware.ts` está na raiz do projeto

### **Dados antigos ainda aparecem**
- Limpe o localStorage: `F12` → Console → `localStorage.clear()`
- Faça logout e login novamente

---

## 📚 Recursos Adicionais

- [Documentação Clerk](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Dashboard Clerk](https://dashboard.clerk.com)

---

## 🎯 Próximos Passos (Opcional)

1. **Banco de dados real**: Migrar de localStorage para PostgreSQL/Supabase
2. **Webhooks**: Sincronizar eventos de usuário (ex: deletar dados ao excluir conta)
3. **Roles & Permissions**: Adicionar papéis (admin, user) com Clerk Organizations
4. **Backup automático**: Exportar dados periodicamente

---

**🎉 Pronto! Seu sistema agora é multi-tenant e seguro.**
