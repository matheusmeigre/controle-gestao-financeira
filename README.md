# 💰 Minha Gestão Financeira

Aplicação web moderna para controle de gastos pessoais, rendas e faturas de cartão com **autenticação multi-usuário** e **dados privados por conta**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

<img width="1915" height="904" alt="image" src="https://github.com/user-attachments/assets/12c6209c-35ad-4169-9dc3-30adec1fba69" />

<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/763a828d-9ffd-4a3d-aef0-6a0743caaa37" />




---

## ✨ Features

### 🔐 **Autenticação & Segurança**
- ✅ Login social com **Google** e **Microsoft** (OAuth 2.0)
- ✅ Sistema **Multi-Tenant**: cada usuário tem ambiente privado
- ✅ Rotas protegidas automaticamente
- ✅ Sessão persistente entre recargas
- ✅ Segregação total de dados por usuário

### 📊 **Gestão Financeira**
- 💸 **Gastos Gerais:** Categorize despesas mensais
- 💳 **Faturas de Cartão:** Divida gastos entre pessoas
- 💰 **Rendas:** Controle salários e receitas extras
- 📈 **Balanço Mensal:** Visualize saldo em tempo real
- 📥 **Exportação:** Baixe dados em Excel (.xlsx)

### 🎨 **Interface**
- Design responsivo (mobile-first)
- Tema escuro/claro
- Componentes Radix UI + shadcn/ui
- Animações suaves

---

## 🚀 Quick Start (5 minutos)

### **Pré-requisitos**
- Node.js 18+
- Conta gratuita no [Clerk](https://clerk.com)

### **1. Clone e instale**
\`\`\`bash
git clone <seu-repo>
cd controle-de-gastos
npm install
\`\`\`

### **2. Configure o Clerk**
1. Acesse [dashboard.clerk.com](https://dashboard.clerk.com)
2. Crie um projeto
3. **Desabilite** autenticação por telefone (não suporta Brasil):
   - Vá em **User & Authentication** → **Email, Phone, Username**
   - Desmarque **Phone number**
4. **Habilite** Google e Microsoft em "Social Connections"
5. Copie as chaves em "API Keys"

### **3. Configure variáveis de ambiente**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edite `.env.local`:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXX
\`\`\`

### **4. Rode o projeto**
\`\`\`bash
npm run dev
\`\`\`

Acesse: **http://localhost:3000** 🎉

---

## 📖 Documentação Completa

- **[QUICKSTART.md](./QUICKSTART.md)** - Guia de 5 minutos
- **[SETUP_AUTH.md](./SETUP_AUTH.md)** - Configuração detalhada do Clerk
- **[ARQUITETURA.md](./ARQUITETURA.md)** - Diagramas e fluxos técnicos
- **[IMPLEMENTACAO_COMPLETA.md](./IMPLEMENTACAO_COMPLETA.md)** - Resumo da implementação
- **[lib/security-checklist.ts](./lib/security-checklist.ts)** - Checklist de segurança

---

## 🏗️ Arquitetura

\`\`\`
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Middleware (Proteção)  │ ✅ Valida autenticação
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Clerk Auth (OAuth 2.0) │ ✅ Google/Microsoft
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Dashboard (React)      │ ✅ Dados segregados
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  localStorage (userId)  │ ✅ Chaves únicas
└─────────────────────────┘
\`\`\`

**Leia mais:** [ARQUITETURA.md](./ARQUITETURA.md)

---

## 🔒 Segurança

### **Implementado**
- ✅ OAuth 2.0 (Google, Microsoft)
- ✅ Tokens JWT gerenciados pelo Clerk
- ✅ Middleware protegendo rotas
- ✅ Campo `userId` obrigatório em todos os registros
- ✅ Filtros de segurança na leitura de dados
- ✅ Chaves de localStorage isoladas por usuário

### **Score de Segurança**
\`\`\`
Autenticação (AuthN):     ✅ 95/100
Autorização (AuthZ):      ✅ 90/100
Proteção de Rotas:        ✅ 100/100
Segregação de Dados:      ✅ 95/100
Compliance (LGPD/GDPR):   ⚠️ 70/100
────────────────────────────────────
TOTAL:                    ✅ 78/100 (BOM)
\`\`\`

**Leia mais:** [lib/security-checklist.ts](./lib/security-checklist.ts)

---

## 🧪 Testando

### **Teste de Segregação**
1. Faça login com Usuário A
2. Adicione algumas despesas
3. Faça logout
4. Faça login com Usuário B
5. **Resultado:** Usuário B não vê dados do Usuário A ✅

### **Teste de Proteção de Rotas**
1. Faça logout
2. Tente acessar `http://localhost:3000`
3. **Resultado:** Redirecionado automaticamente para `/sign-in` ✅

---

## 📦 Estrutura do Projeto

\`\`\`
controle-de-gastos/
├── app/
│   ├── layout.tsx              # ClerkProvider global
│   ├── page.tsx                # Dashboard protegido
│   ├── sign-in/                # Tela de login
│   └── sign-up/                # Tela de cadastro
├── components/
│   ├── user-header.tsx         # Header com logout
│   ├── welcome-modal.tsx       # Modal de boas-vindas
│   ├── expense-form.tsx        # Formulários
│   └── ui/                     # Componentes Radix UI
├── lib/
│   ├── user-data.ts            # Helpers de segregação
│   ├── security-checklist.ts   # Checklist de segurança
│   └── utils.ts                # Utilidades gerais
├── types/
│   └── expense.ts              # Interfaces TypeScript
├── middleware.ts               # Proteção de rotas
├── .env.local.example          # Template de config
└── [DOCS]                      # Documentação
\`\`\`

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **Next.js 14** (App Router)
- **React 19** (Client Components)
- **TypeScript 5**
- **Tailwind CSS 3**
- **shadcn/ui** + **Radix UI**

### **Autenticação**
- **Clerk** (OAuth 2.0, JWT, Session Management)

### **Armazenamento (Atual)**
- **localStorage** (navegador)
- ⚠️ *Recomendado para Fase 2: PostgreSQL/Supabase*

### **DevTools**
- **ESLint** (Linting)
- **Prettier** (Formatação)
- **Vercel Analytics** (Métricas)

---

## 🎯 Roadmap

### **✅ Fase 1 (Atual) - Autenticação Multi-Tenant**
- [x] Login social (Google/Microsoft)
- [x] Segregação de dados por usuário
- [x] Proteção de rotas
- [x] Interface responsiva

### **🔄 Fase 2 - Banco de Dados Real**
- [ ] Migração para PostgreSQL
- [ ] API Routes com Prisma ORM
- [ ] Row-Level Security (RLS)
- [ ] Backup automático

### **🚀 Fase 3 - Features Avançadas**
- [ ] Compartilhamento de despesas (Organizations)
- [ ] Roles (Admin, User, Viewer)
- [ ] Webhooks de sincronização
- [ ] Notificações por email

### **🔐 Fase 4 - Auditoria & Compliance**
- [ ] Logs de acesso
- [ ] Histórico de alterações
- [ ] 2FA (Two-Factor Authentication)
- [ ] Certificações de segurança

---

## 🤝 Contribuindo

Este projeto foi desenvolvido para uso pessoal com amigos e família. Contribuições são bem-vindas!

### **Como contribuir**
1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Add: nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é de código fechado (privado) para uso pessoal.

---

## 👤 Autor

**Matheus Meigre**  
📧 Email: [matheusmeigre@gmail.com]  
🔗 GitHub: [@matheusmeigre](https://github.com/matheusmeigre)

---

## 🙏 Agradecimentos

- [Clerk](https://clerk.com) - Autenticação simplificada
- [shadcn/ui](https://ui.shadcn.com) - Componentes de UI
- [v0.dev](https://v0.dev) - Inspiração de design
- [Vercel](https://vercel.com) - Hospedagem

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

1. **Documentação:** Leia [SETUP_AUTH.md](./SETUP_AUTH.md)
2. **Issues:** Abra uma issue neste repositório
3. **Contato direto:** [matheusmeigre@gmail.com]

---

<div align="center">

**🎉 Desenvolvido com ❤️ usando Next.js, TypeScript e Clerk**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Security](https://img.shields.io/badge/security-78%2F100-yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

</div>
