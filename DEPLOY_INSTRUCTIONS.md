# 📦 Instruções de Deploy no Render

## Opção 1: Static Site (Recomendado)

### Passo a Passo:

1. **Acesse o Render Dashboard**
   - Vá para https://dashboard.render.com
   - Faça login ou crie uma conta

2. **Criar Novo Static Site**
   - Clique em **"New +"** no canto superior direito
   - Selecione **"Static Site"**

3. **Conectar Repositório**
   - Conecte seu repositório Git (GitHub, GitLab, Bitbucket)
   - Selecione o repositório `sistema-INPC`

4. **Configurar Build**
   - **Name**: `sistema-inpc` (ou o nome que preferir)
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: (deixe vazio)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

5. **Configurações Avançadas** (opcional)
   - **Node Version**: `18` ou superior
   - **Environment Variables**: (nenhuma necessária por enquanto)

6. **Criar Static Site**
   - Clique em **"Create Static Site"**
   - Aguarde o build completar (pode levar alguns minutos)

7. **Acessar Aplicação**
   - Após o build, você receberá uma URL: `https://sistema-inpc.onrender.com`
   - A aplicação estará disponível!

## Opção 2: Web Service (Alternativa)

Se preferir usar como Web Service:

1. **Criar Web Service**
   - Clique em **"New +"** → **"Web Service"**
   - Conecte o repositório

2. **Configurações**
   - **Name**: `sistema-inpc`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`
   - **Node Version**: `18`

3. **Adicionar dependência serve**
   - Adicione `"serve": "^14.2.0"` ao `package.json` em `dependencies`

## ✅ Verificações Pós-Deploy

Após o deploy, verifique:

- [ ] A aplicação carrega corretamente
- [ ] As rotas funcionam (`/#/inpc-update`, `/#/credit-identification`)
- [ ] Upload de arquivos funciona
- [ ] Processamento de planilhas funciona
- [ ] Histórico funciona

## 🔧 Troubleshooting

### Build Falha
- Verifique se o Node.js 18+ está disponível
- Confira os logs de build no Render
- Teste localmente: `npm run build`

### Rotas não funcionam
- Certifique-se de que o `render.yaml` tem a regra de rewrite
- Ou configure manualmente: todas as rotas devem redirecionar para `/index.html`

### Erro de memória
- Upgrade para plano pago (mais memória)
- Ou otimize o build removendo dependências desnecessárias

## 📝 Notas Importantes

- ✅ O projeto usa **HashRouter** - rotas funcionam com `#`
- ✅ Build gera arquivos estáticos na pasta `build/`
- ✅ Dados são salvos em localStorage (mock)
- ✅ Não requer variáveis de ambiente no momento

## 🚀 Deploy Automático

O Render faz deploy automático a cada push na branch principal!

Basta fazer:
```bash
git add .
git commit -m "Preparado para deploy"
git push origin main
```

O Render detectará automaticamente e fará novo deploy.



