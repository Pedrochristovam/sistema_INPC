# 🚀 Guia de Deploy no Render

## ✅ Pré-requisitos

- [x] Código commitado no GitHub
- [x] Build funcionando localmente (`npm run build`)
- [x] `render.yaml` configurado
- [x] Repositório: `https://github.com/Pedrochristovam/sistema_INPC.git`

## 📋 Passo a Passo

### 1. Acessar o Render Dashboard

1. Acesse: https://dashboard.render.com
2. Faça login (ou crie uma conta gratuita)
3. Conecte sua conta do GitHub se ainda não conectou

### 2. Criar Novo Static Site

1. Clique em **"New +"** no canto superior direito
2. Selecione **"Static Site"**

### 3. Conectar Repositório

1. Na seção **"Connect a repository"**:
   - Selecione seu repositório: `Pedrochristovam/sistema_INPC`
   - Ou cole a URL: `https://github.com/Pedrochristovam/sistema_INPC.git`

### 4. Configurar o Deploy

O Render detectará automaticamente o `render.yaml`, mas você pode verificar:

**Configurações Básicas:**
- **Name**: `sistema-inpc` (ou o nome que preferir)
- **Branch**: `main`
- **Root Directory**: (deixe vazio)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

**Configurações Avançadas (opcional):**
- **Node Version**: `18` ou superior
- **Environment Variables**: (nenhuma necessária por enquanto)

### 5. Criar e Aguardar

1. Clique em **"Create Static Site"**
2. O Render começará o build automaticamente
3. Aguarde 5-10 minutos para o primeiro deploy
4. Você verá o progresso em tempo real

### 6. Acessar sua Aplicação

Após o deploy concluir, você receberá uma URL:
- **URL**: `https://sistema-inpc.onrender.com` (ou o nome que você escolheu)

## ✅ Verificação Pós-Deploy

Teste os seguintes pontos:

- [ ] Aplicação carrega: `https://sistema-inpc.onrender.com`
- [ ] Página inicial funciona
- [ ] Navegação para INPC funciona: `/#/inpc-update`
- [ ] Upload de planilhas funciona
- [ ] Processamento funciona
- [ ] Download de planilhas funciona

## 🔄 Deploy Automático

A partir de agora, **cada push na branch `main`** gerará um novo deploy automaticamente!

```bash
# Fazer alterações
git add .
git commit -m "Sua mensagem"
git push origin main

# O Render fará o deploy automaticamente em 2-5 minutos
```

## 🐛 Troubleshooting

### Build Falha

1. Verifique os logs no Render Dashboard
2. Teste localmente primeiro:
   ```bash
   npm install
   npm run build
   ```

### Rotas não funcionam

- Certifique-se de que está usando HashRouter (já configurado)
- URLs devem ter `#`: `/#/inpc-update`

### Erro de memória no build

- O plano gratuito tem limitações
- Considere otimizar dependências ou upgrade para plano pago

### Site não atualiza

- Aguarde alguns minutos após o push
- Verifique se o deploy foi concluído no dashboard
- Limpe o cache do navegador

## 📊 Monitoramento

No Render Dashboard você pode:
- Ver logs em tempo real
- Ver histórico de deploys
- Configurar notificações
- Ver estatísticas de uso

## 💡 Dicas

1. **Primeiro deploy**: Pode levar mais tempo (10-15 minutos)
2. **Deploys subsequentes**: Mais rápidos (2-5 minutos)
3. **Plano gratuito**: Site pode "dormir" após inatividade (primeira requisição pode ser lenta)
4. **Custom Domain**: Você pode adicionar seu próprio domínio nas configurações

## 🎉 Pronto!

Sua aplicação estará online e acessível publicamente!

