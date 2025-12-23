# Correção de Permissões no Safari/iOS

## Problema
As permissões de geolocalização não funcionam no Safari mesmo quando permitidas manualmente.

## Soluções Aplicadas

### 1. Código atualizado
- Adicionada verificação de permissão explícita antes de iniciar o tracking
- Implementado `getCurrentPosition()` como teste antes do `watchPosition()`
- Isso força o Safari a solicitar permissão corretamente

### 2. Manifest.json atualizado
- Adicionado `scope: "/"`
- Adicionado array de `permissions` com geolocation
- Adicionado `categories` para melhor identificação do app

## Instruções para o Usuário no Safari/iOS

### Se ainda não funcionar, siga estes passos:

1. **Limpar o cache do site**:
   - Vá em Configurações > Safari > Avançado > Dados de Sites
   - Procure por `v0-speedometer-pwa.vercel.app`
   - Deslize para esquerda e delete

2. **Reinstalar o PWA**:
   - Remova o app da tela inicial (se instalado)
   - Acesse https://v0-speedometer-pwa.vercel.app/ no Safari
   - Toque no botão "Compartilhar"
   - Selecione "Adicionar à Tela Inicial"

3. **Configurar permissões manualmente**:
   - Vá em Configurações > Safari > Localização
   - Certifique-se que está em "Perguntar" ou "Permitir"
   - OU vá em Configurações > Privacidade > Serviços de Localização
   - Ative "Serviços de Localização"
   - Role para baixo até "Safari" e selecione "Ao Usar o App"

4. **Verificar configurações específicas do site**:
   - No Safari, vá para https://v0-speedometer-pwa.vercel.app/
   - Toque no "AA" na barra de endereço
   - Toque em "Ajustes do Site"
   - Em "Localização", selecione "Permitir"

5. **Após fazer o deploy das alterações**:
   - Pressione "Iniciar" no app
   - O Safari deve mostrar um popup pedindo permissão de localização
   - Selecione "Permitir Ao Usar o App"

## Limitações conhecidas do Safari

- Safari não suporta `navigator.permissions.query()` para geolocation (foi adicionado fallback)
- Safari em modo privado pode bloquear geolocalização
- Safari requer interação do usuário (clique) para solicitar permissão
- Primeira vez sempre requer permitir o popup

## Teste após deploy

Após fazer o deploy, teste assim:
1. Abra o site no Safari
2. Clique em "Iniciar"
3. Deve aparecer um popup do iOS pedindo permissão
4. Selecione "Permitir Ao Usar o App"
