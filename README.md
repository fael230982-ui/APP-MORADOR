# App Morador

Aplicativo Expo/React Native para a experiência do morador no ecossistema Rafiels/Sapinho.

## O que o app cobre hoje

- autenticacao e sessao do morador;
- painel da unidade ativa;
- pessoas, visitantes, veículos e histórico de acessos;
- encomendas, mensagens e notificações;
- câmeras da unidade e câmeras compartilhadas quando publicadas pelo backend;
- perfil, LGPD, termos e diagnósticos locais.

## Stack

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- Zustand
- Axios

## Executar localmente

1. Instale as dependências:

```bash
npm install
```

2. Ajuste as variáveis locais em `.env` sem commitar credenciais.

3. Inicie o app:

```bash
npm run start
```

## Estrutura funcional

- `app/(tabs)` concentra a experiência principal do morador;
- `app/profile` reúne perfil, suporte, legal e diagnósticos;
- `services` concentra integrações com backend e normalização de payloads;
- `docs` registra leituras de API, backlog e homologação.

## Governanca do repositorio

- autoria registrada em `AUTHORS.md` e `AUTHORSHIP.md`;
- histórico de mudanças em `CHANGELOG.md`;
- regras de contribuição em `CONTRIBUTING.md`;
- templates de issue e PR em `.github/`;
- checklist operacional em `CHECKLIST.md`.

## Roadmap e publicacao

- roadmap de plataformas automotivas, assistentes pessoais e automação residencial em `docs/ROADMAP_APP_MORADOR_PLATAFORMAS_E_ASSISTENTES_2026-04-23.md`;
- backlog técnico em `docs/BACKLOG_TECNICO_PLATAFORMAS_E_ASSISTENTES_2026-04-23.md`;
- checklist de pré-publicação em `docs/PRE_PUBLICACAO_APP_MORADOR.md`.

## Seguranca

- não publique `.env`, chaves privadas, service accounts ou credenciais;
- revise arquivos sensíveis antes de qualquer push inicial;
- use commits pequenos com `feat`, `fix`, `docs` e `chore`.
