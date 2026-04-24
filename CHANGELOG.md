# Changelog

## [Unreleased]

### Added

- padrao minimo de governanca do repositorio
- registro de autoria
- templates de issue e pull request
- leitura documental da `API V5.5` com copia local da especificacao
- roadmap de plataformas automotivas, assistentes pessoais e automacao residencial
- backlog tecnico de plataformas automotivas, assistentes e automacao contextual

### Changed

- historico de mensagens preparado para exibir origem `WHATSAPP`
- tipo `OperationMessage` alinhado com os novos campos documentados na `V5.5`
- perfil endurecido com fallback local para `phone`, `email`, `name` e `photoUri` quando `resident/profile` vier incompleto
- tela de `Pessoas` simplificada com CTA principal de `Autorizar acesso`
- tela de notificacoes reescrita em texto limpo e com fallback local quando a preferencia remota falha
- mensagens agora mostram estado mais claro para conversas do morador com a portaria
- telas de `Inicio`, `Perfil` e `Cameras` regravadas em texto seguro para eliminar codificacao quebrada
- `README.md` reorganizado para refletir o escopo atual do app e o momento de publicacao
- permissoes e descricoes de camera/fotos refinadas em `app.config.ts`

### Docs

- relatorio unico de validacao real do `App Morador` contra o backend em `docs/RELATORIO_UNICO_VALIDACAO_APP_MORADOR_BACKEND_2026-04-24.md`
- backlog consolidado de correcoes em `docs/BACKLOG_CORRECOES_APP_MORADOR_2026-04-24.md`
- relatorio pos-`V5.7` com testes reais e pendencias remanescentes em `docs/RELATORIO_POS_API_V5_7_2026-04-24.md`
- checklist de pre-publicacao em `docs/PRE_PUBLICACAO_APP_MORADOR.md`

### Backend

- `resident/profile` voltou a publicar `phone`, `photoUrl`, `photoUri`, `faceStatus` e `faceUpdatedAt`
- `resident/notification-preferences` voltou a responder `200`
- permanecem quebradas as imagens de encomenda publicadas em `photoUrl` e `snapshotUrl`, hoje em `404`

### Security

- reforco de bloqueio para `.env`, chaves e service accounts no `.gitignore`
