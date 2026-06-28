# 💰 Controle de Gastos - Sistema de Gestão Financeira

> Sistema completo de gestão financeira pessoal desenvolvido com Next.js 14, TypeScript e arquitetura feature-based.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Feature--Based-green)](./docs/ARQUITETURA_V2.md)

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

- 💳 **Gestão de Cartões de Crédito** - Controle de múltiplos cartões
- 📄 **Faturas Inteligentes** - Upload e processamento automático (OCR, CSV, OFX)
- 💸 **Controle de Despesas** - Categorização e acompanhamento
- 💰 **Gestão de Rendas** - Controle de recebimentos
- 🔄 **Assinaturas** - Gerenciamento de gastos recorrentes
- 📊 **Relatórios** - Visualização de gastos por categoria e período
- 🔐 **Multi-tenant** - Isolamento de dados por usuário (Clerk Auth)
- 📱 **Responsivo** - Interface adaptável para mobile e desktop

## 🏗️ Arquitetura

### Feature-Based Architecture

```
src/
├── features/           # Domínios de negócio isolados
│   ├── expenses/       # Gestão de despesas
│   ├── cards/          # Cartões de crédito
│   ├── invoices/       # Faturas e parsers
│   ├── incomes/        # Rendas
│   └── subscriptions/  # Assinaturas
├── lib/
│   └── repositories/   # Repository Pattern
├── server/             # Server Actions (Next.js)
└── components/         # UI genérico
```

### Padrões Implementados

- **Repository Pattern**: Abstração da camada de dados
- **Service Layer**: Lógica de negócio centralizada
- **Custom Hooks**: Encapsulamento de estado
- **Barrel Exports**: APIs públicas limpas
- **Server Actions**: Backend-for-Frontend

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm/yarn/pnpm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/controle-de-gastos.git
cd controle-de-gastos

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Clerk

# Execute em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Configuração do Clerk

1. Crie uma conta em [clerk.com](https://clerk.com)
2. Crie uma nova aplicação
3. Copie as chaves para `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 📚 Documentação

- **[ARQUITETURA_V2.md](./docs/ARQUITETURA_V2.md)** - Arquitetura completa do sistema
- **[MIGRATION.md](./docs/MIGRATION.md)** - Guia de migração e onboarding
- **[CONVENTIONS.md](./docs/CONVENTIONS.md)** - Convenções de código
- **[tests/README.md](./tests/README.md)** - Guia de testes

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **React 19**
- **TypeScript 5**
- **TailwindCSS 4**
- **shadcn/ui** - Componentes

### Backend
- **Next.js Server Actions**
- **Clerk** - Autenticação
- **localStorage** - Persistência (migração futura para PostgreSQL)

### Testing (Configurado)
- **Vitest** - Test runner
- **Testing Library** - Testes de componentes
- **MSW** - Mock de APIs

### Features Especiais
- **OCR Service** - Processamento de faturas em PDF
- **Multi-parser** - Suporte a Nubank, Inter, OFX, QFX
- **Template Engine** - Templates bancários customizáveis

## 📁 Estrutura do Projeto

```
controle-de-gastos/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── features/               # Features isoladas
│   │   ├── expenses/
│   │   │   ├── components/     # UI da feature
│   │   │   ├── hooks/          # Hooks específicos
│   │   │   ├── services/       # Lógica de negócio
│   │   │   ├── types.ts        # Tipos
│   │   │   └── index.ts        # Barrel export
│   │   ├── cards/
│   │   ├── invoices/
│   │   │   ├── parsers/        # Parsers de faturas
│   │   │   └── templates/      # Templates bancários
│   │   └── incomes/
│   ├── components/             # Componentes genéricos
│   ├── lib/
│   │   └── repositories/       # Repository Pattern
│   ├── server/                 # Server Actions
│   └── hooks/                  # Hooks genéricos
├── tests/                      # Testes organizados
├── docs/                       # Documentação
└── public/                     # Assets estáticos
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm test -- --coverage

# Executar testes de uma feature específica
npm test -- features/expenses
```

## 📦 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linter
npm test             # Testes
```

## 🎯 Roadmap

- [x] Estrutura feature-based
- [x] Repository Pattern
- [x] Service Layer
- [x] Testes configurados
- [x] Documentação completa
- [ ] Migração para PostgreSQL/Supabase
- [ ] Implementação de tRPC
- [ ] React Query para cache
- [ ] SSR para SEO
- [ ] Storybook
- [ ] CI/CD com GitHub Actions

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções

- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Siga as [convenções do projeto](./docs/CONVENTIONS.md)
- Adicione testes para novas features
- Atualize a documentação

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

**⭐ Se este projeto te ajudou, considere dar uma estrela!**
