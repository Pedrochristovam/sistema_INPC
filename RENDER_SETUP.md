# 🚀 Setup para Deploy no Render

## Configuração Rápida (5 minutos)

### 1. Preparar Repositório Git

```bash
# Se ainda não tem repositório Git
git init
git add .
git commit -m "Preparado para deploy no Render"
git branch -M main

# Conectar ao GitHub/GitLab
git remote add origin SEU_REPOSITORIO_URL
git push -u origin main
```

### 2. Criar Static Site no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Static Site"**
3. Conecte seu repositório Git
4. Configure:

   **Configurações Básicas:**
   - **Name**: `sistema-inpc`
   - **Branch**: `main`
   - **Root Directory**: (deixe vazio)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

   **Configurações Avançadas:**
   - **Node Version**: `18` (ou superior)
   - **Environment**: (nenhuma variável necessária)

5. Clique em **"Create Static Site"**

### 3. Aguardar Deploy

- O Render fará o build automaticamente
- Primeiro deploy pode levar 5-10 minutos
- Você receberá uma URL: `https://sistema-inpc.onrender.com`

## ✅ Verificação

Após o deploy, teste:

- ✅ Aplicação carrega: `https://sistema-inpc.onrender.com`
- ✅ Rotas funcionam: `https://sistema-inpc.onrender.com/#/inpc-update`
- ✅ Upload funciona
- ✅ Processamento funciona

## 🔄 Deploy Automático

Cada push na branch `main` gera um novo deploy automaticamente!

```bash
git add .
git commit -m "Atualização"
git push origin main
```

## 📋 Checklist Pré-Deploy

- [x] HashRouter configurado
- [x] Build funcionando (`npm run build`)
- [x] `render.yaml` criado
- [x] `.gitignore` atualizado
- [x] `package.json` com engines definidos
- [x] Documentação criada

## 🐛 Troubleshooting

### Build falha
```bash
# Teste localmente primeiro
npm install
npm run build
```

### Rotas não funcionam
- Verifique se está usando HashRouter (já configurado)
- URLs devem ter `#`: `/#/inpc-update`

### Erro de memória
- Upgrade para plano pago
- Ou otimize dependências

## 📞 Suporte

- [Render Docs](https://render.com/docs)
- [Render Support](https://render.com/docs/support)



