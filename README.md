# Sistema INPC

Sistema de gestão para processamento de planilhas INPC e identificação de créditos.

## 🚀 Deploy no Render

### Configuração Rápida

1. **Criar Static Site no Render**
   - Acesse https://render.com
   - New + → Static Site
   - Conecte seu repositório Git

2. **Configurações**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Node Version**: `18` ou superior

3. **Deploy Automático**
   - O Render fará o build automaticamente
   - Cada push na branch principal gera novo deploy

### Configuração Manual (via render.yaml)

O arquivo `render.yaml` já está configurado. Basta conectar o repositório e o Render detectará automaticamente.

## 📦 Instalação Local

```bash
npm install
npm start
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa testes

## 📁 Estrutura do Projeto

```
src/
├── api/              # APIs e clientes
├── components/       # Componentes React
├── Pages/           # Páginas principais
├── services/        # Serviços de processamento
├── utils/           # Utilitários
└── Layout.jsx      # Layout principal
```

## 🔧 Funcionalidades

### 1. Processamento INPC
- Upload de planilhas A e B
- Aplicação automática de índice INPC
- Preservação de formatação original
- Download de planilhas processadas

### 2. Identificação de Crédito
- Extração automática de dados (PDF/Excel)
- Geração de texto para AGE
- Histórico de consultas

## 🌐 Tecnologias

- React 18
- React Router (HashRouter para SPA)
- Tailwind CSS
- Framer Motion
- XLSX (processamento de planilhas)
- React Query

## 📝 Notas

- O projeto usa **HashRouter** para compatibilidade com servidores estáticos
- Todas as rotas funcionam com `#` (ex: `/#/inpc-update`)
- Dados são salvos em localStorage (mock) - em produção usar backend

## 🔗 Links

- [Render Dashboard](https://dashboard.render.com)
- [Documentação Render](https://render.com/docs)
