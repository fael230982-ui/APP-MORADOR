# App Morador

Aplicativo Expo/React Native para a experiencia do morador no ecossistema V8/Sapinho.

## O que o app cobre hoje

- autenticacao e sessao do morador;
- painel da unidade ativa;
- pessoas, visitantes, veiculos e historico de acessos;
- encomendas, mensagens e notificacoes;
- cameras da unidade e cameras compartilhadas quando publicadas pelo backend;
- perfil, LGPD, termos e diagnosticos locais.

## Stack

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- Zustand
- Axios

## Executar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Ajuste as variaveis locais em `.env` sem commitar credenciais.

3. Inicie o app:

```bash
npm run start
```

## Estrutura funcional

- `app/(tabs)` concentra a experiencia principal do morador;
- `app/profile` reune perfil, suporte, legal e diagnosticos;
- `services` concentra integracoes com backend e normalizacao de payloads;
- `docs` registra leituras de API, backlog e homologacao.

## Governanca do repositorio

- autoria registrada em `AUTHORS.md` e `AUTHORSHIP.md`;
- historico de mudancas em `CHANGELOG.md`;
- regras de contribuicao em `CONTRIBUTING.md`;
- templates de issue e PR em `.github/`;
- checklist operacional em `CHECKLIST.md`.

## Roadmap e publicacao

- roadmap de plataformas automotivas, assistentes pessoais e automacao residencial em `docs/ROADMAP_APP_MORADOR_PLATAFORMAS_E_ASSISTENTES_2026-04-23.md`;
- backlog tecnico em `docs/BACKLOG_TECNICO_PLATAFORMAS_E_ASSISTENTES_2026-04-23.md`;
- checklist de pre-publicacao em `docs/PRE_PUBLICACAO_APP_MORADOR.md`.

## Seguranca

- nao publique `.env`, chaves privadas, service accounts ou credenciais;
- revise arquivos sensiveis antes de qualquer push inicial;
- use commits pequenos com `feat`, `fix`, `docs` e `chore`.
