# App Morador

Aplicativo Expo/React Native para a experiencia do morador no ecossistema V8/Sapinho.

## Escopo

- autenticacao e sessao do morador;
- painel da unidade ativa;
- alertas, cameras, encomendas e mensagens;
- autorizacao de acessos;
- perfil, LGPD e preferencias do app.

## Stack

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- Zustand
- Axios

## Executar localmente

1. Instalar dependencias:

```bash
npm install
```

2. Ajustar variaveis locais em `.env` sem commitar credenciais.

3. Iniciar o app:

```bash
npm run start
```

## Governanca do repositorio

- autoria registrada em `AUTHORS.md` e `AUTHORSHIP.md`;
- historico de mudancas em `CHANGELOG.md`;
- regras de contribuicao em `CONTRIBUTING.md`;
- templates de issue e PR em `.github/`.

## Seguranca

- nao publique `.env`, chaves privadas, service accounts ou credenciais;
- revise arquivos sensiveis antes de qualquer push inicial;
- use commits pequenos com `feat`, `fix`, `docs` e `chore`.
