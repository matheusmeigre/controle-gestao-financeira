# ⚡ Quick Start - 5 Minutos para Rodar

## 🎯 Configuração Rápida

### 1️⃣ Instale as dependências (se ainda não fez)
\`\`\`bash
npm install
\`\`\`

### 2️⃣ Configure o Clerk (3 minutos)

1. Acesse: https://dashboard.clerk.com
2. Crie conta gratuita
3. Crie novo projeto
4. Copie as chaves em **"API Keys"**

### 3️⃣ Configure as variáveis de ambiente

\`\`\`bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local
\`\`\`

Edite `.env.local` e cole suas chaves:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXX
\`\`\`

### 4️⃣ Habilite Google/Microsoft

No Clerk Dashboard:
- **User & Authentication** → **Social Connections**
- Ative **Google** ✅
- Ative **Microsoft** ✅
- (Clerk fornece credenciais de dev automaticamente)

### 5️⃣ Rode o projeto

\`\`\`bash
npm run dev
\`\`\`

Acesse: **http://localhost:3000**

---

## ✅ Resultado Esperado

1. Você será redirecionado para `/sign-in`
2. Verá os botões **"Continue with Google"** e **"Continue with Microsoft"**
3. Ao fazer login, verá o dashboard com seu nome no header
4. Modal de boas-vindas aparecerá no primeiro acesso

---

## 🐛 Problemas Comuns

### **Erro: "Clerk publishable key not found"**
- Certifique-se que o arquivo `.env.local` existe na raiz do projeto
- Reinicie o servidor: `Ctrl+C` e `npm run dev` novamente

### **Botões de login social não aparecem**
- Verifique se habilitou Google/Microsoft no Clerk Dashboard
- Aguarde 30 segundos e recarregue a página

### **Redirecionamento infinito**
- Verifique se o `middleware.ts` está na raiz do projeto
- Limpe o cache do navegador

---

## 📖 Próximos Passos

- Leia [SETUP_AUTH.md](./SETUP_AUTH.md) para configuração detalhada
- Leia [IMPLEMENTACAO_COMPLETA.md](./IMPLEMENTACAO_COMPLETA.md) para entender a arquitetura

---

## 🎉 Pronto!

Sua aplicação agora tem:
- ✅ Login com Google e Microsoft
- ✅ Dados privados por usuário
- ✅ Rotas protegidas
- ✅ Sessão persistente

**Tempo estimado:** 5 minutos ⏱️
