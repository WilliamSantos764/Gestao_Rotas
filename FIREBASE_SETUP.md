# Firebase já integrado na V5.31

A configuração Web do projeto Firebase já está gravada no Gestão Logística V5.31.
Você não precisa mais copiar o JSON para o sistema.

Este arquivo permanece como referência para:
- habilitar Authentication Anonymous;
- publicar as regras;
- configurar GitHub Pages/HTTPS;
- diagnosticar erros.

# Configuração do rastreamento em tempo real

A V5.27 funciona sem Firebase para planejamento e roteirização local, mas o monitoramento do celular na central precisa de uma base online.

## 1. Criar um projeto Firebase

Acesse o console Firebase e crie um projeto.

## 2. Adicionar um App Web

No projeto, adicione um App Web. O Firebase mostrará uma configuração semelhante a:

```json
{
  "apiKey": "...",
  "authDomain": "seu-projeto.firebaseapp.com",
  "databaseURL": "https://seu-projeto-default-rtdb.firebaseio.com",
  "projectId": "seu-projeto",
  "appId": "..."
}
```

Cole esse JSON no campo **Rastreamento em tempo real** da aba **Análise inteligente de rotas**.

Não coloque chaves de service account, private keys ou credenciais administrativas no HTML.

## 3. Authentication

Em **Authentication > Sign-in method**, habilite **Anonymous**.

## 4. Realtime Database

Crie uma Realtime Database.

Para o protótipo, as regras precisam permitir usuários autenticados nos IDs aleatórios de Apps:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "driverApps": {
      "$appId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "tracking": {
      "$appId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

Essas regras são adequadas para validação/protótipo com IDs aleatórios e autenticação anônima. Para produção com controle de acesso por empresa/motorista, use autenticação nominal e regras por usuário/organização.

## 5. Publicar o projeto

Publique a pasta do projeto em HTTPS, por exemplo no GitHub Pages.

Na central, preencha **URL pública do sistema / GitHub Pages**.

Exemplo:

`https://usuario.github.io/gestao-logistica/`

## 6. Fluxo

1. Gere a rota.
2. O Gestão Logística publica todas as entregas no Firebase.
3. Envie o link para o motorista.
4. O motorista abre `motorista.html`.
5. O App carrega todas as entregas.
6. O motorista toca em **Ativar GPS e roteirizar**.
7. O navegador pede permissão de localização.
8. O App recalcula a rota a partir da posição atual.
9. O GPS é enviado para `tracking/<ID_DO_APP>`.
10. Na central clique em **Conectar caminhões ao vivo**.


## V5.31 — conferência do link

A central agora verifica a gravação em `driverApps/<appId>` antes de enviar o link ao motorista.
Se o WhatsApp não abrir, verifique primeiro:

1. Authentication > Anonymous habilitado.
2. Realtime Database Rules publicadas.
3. `index.html` e `motorista.html` V5.31 publicados no mesmo diretório HTTPS.


## V5.31 — link curto

O `motorista.html` agora contém a configuração Web Firebase usada pelo projeto.
Não existe mais necessidade de transportar `firebaseConfig` no link do WhatsApp.

Formato esperado do link:

`motorista.html?v=530#app=driver_xxx&rev=rev_xxx&orders=N&stops=N&driver=NOME`

A leitura das viagens continua sendo feita em:

`driverApps/<appId>`
