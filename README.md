# PWA GPS para GitHub

Site HTML instalável no Android que captura a localização após autorização e cria um TXT em um repositório GitHub por meio de um Cloudflare Worker. O token do GitHub não é colocado no HTML.

## 1. Criar o repositório

Crie um repositório no GitHub e envie para a raiz os arquivos `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `sw.js` e a pasta `icons`. A pasta `cloudflare-worker` não precisa ser publicada no GitHub Pages.

Em **Settings > Pages**, escolha **Deploy from a branch**, selecione `main` e `/ (root)`. Aguarde a publicação no endereço `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.

## 2. Criar credencial do GitHub

Crie um Fine-grained Personal Access Token limitado ao repositório que receberá os TXT, com somente `Contents: Read and write`. Nunca coloque esse token em `app.js`, HTML, localStorage ou no repositório.

## 3. Publicar o Worker

1. Instale Node.js e execute `npm install -g wrangler`.
2. Entre em `cloudflare-worker`.
3. Edite `wrangler.toml`: usuário, repositório, branch e `ALLOWED_ORIGIN`. A origem não contém o nome do repositório, por exemplo `https://usuario.github.io`.
4. Execute `wrangler login`.
5. Execute `wrangler secret put GITHUB_TOKEN` e informe o token.
6. Execute `wrangler secret put APP_KEY` e crie uma senha longa para autorizar o PWA.
7. Execute `wrangler deploy` e copie o endereço HTTPS.

## 4. Usar no Android

Abra o site pelo Chrome, informe o endereço do Worker e a chave APP_KEY. Toque em **Obter localização atual**, autorize o GPS, confira os dados e toque em **Enviar TXT para o GitHub**. Para instalar, use o botão do site ou o menu do Chrome > **Adicionar à tela inicial**.

## Segurança

A APP_KEY digitada fica somente na sessão do navegador, mas uma chave compartilhada ainda pode ser repassada. Para vários usuários ou aplicação pública, substitua-a por autenticação individual. O PWA não captura localização em segundo plano e não envia nada automaticamente.
