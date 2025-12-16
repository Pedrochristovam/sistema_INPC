# Deploy no Render

## Configuração para Deploy

Este projeto está configurado para deploy no Render como **Static Site**.

### Passos para Deploy

1. **Criar conta no Render**
   - Acesse https://render.com
   - Faça login ou crie uma conta

2. **Criar novo Static Site**
   - Clique em "New +" → "Static Site"
   - Conecte seu repositório Git (GitHub, GitLab, etc.)

3. **Configurações do Build**
   - **Name**: `sistema-inpc` (ou o nome que preferir)
   - **Branch**: `main` (ou sua branch principal)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Node Version**: `18` ou superior

4. **Variáveis de Ambiente** (se necessário)
   - Por enquanto não há variáveis obrigatórias
   - Se adicionar API keys no futuro, configure aqui

5. **Deploy**
   - Clique em "Create Static Site"
   - O Render irá fazer o build automaticamente
   - Aguarde o deploy completar

### Configuração Alternativa (Web Service)

Se preferir usar como Web Service:

1. **Criar novo Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório

2. **Configurações**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`
   - **Environment**: `Node`

3. **Instalar serve** (adicionar ao package.json)
   ```json
   "dependencies": {
     "serve": "^14.2.0"
   }
   ```

### Arquivos de Configuração

- `render.yaml` - Configuração do Render (opcional, pode usar UI)
- `.npmrc` - Configuração do npm para evitar conflitos
- `package.json` - Scripts e dependências

### Notas Importantes

- O projeto usa **HashRouter** para compatibilidade com servidores estáticos
- Todas as rotas funcionam com `#` (ex: `/#/inpc-update`)
- O build gera arquivos estáticos na pasta `build/`
- Certifique-se de que o Node.js 18+ está disponível

### Troubleshooting

**Erro de build:**
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para testar

**Rotas não funcionam:**
- Certifique-se de usar HashRouter (já configurado)
- Verifique se o `render.yaml` tem a regra de rewrite

**Erro de memória:**
- Aumente o limite de memória no Render (plano pago)
- Ou otimize o build removendo dependências desnecessárias




