# Controle De Leitura Da DES-RAFIELS

Data de referencia: `2026-04-12`

## Objetivo

Registrar quais documentos relevantes da raiz da `DES-RAFIELS` ja entraram na leitura consolidada desta frente do `App Morador`.

## Estado Atual

Status:

- `sem documento novo pendente de leitura na raiz nesta rodada`

## Documentos Ja Consolidados

- `APP_MORADOR_*`
- `GUARITA_CHANGELOG_ECOSSISTEMA_2026-04-12.md`
- `GUARITA_MODO_OFFLINE_PLANO_2026-04-12.md`
- `GUARITA_DIVERGENCIAS_ECOSSISTEMA_2026-04-12.md`
- `GUARITA_HOMOLOGACAO_CRUZADA_ECOSSISTEMA_2026-04-12.md`
- `GUARITA_PENDENCIAS_BACKEND_ECOSSISTEMA_2026-04-12.md`
- `GUARITA_PROPOSTA_CAPTURA_AUTOMATICA_ECOSSISTEMA_2026-04-12.md`
- `PORTARIA_WEB_CHANGELOG_ECOSSISTEMA_2026-04-12.md`
- `PORTARIA_WEB_PENDENCIAS_BACKEND_OFFLINE_SYNC_2026-04-12.md`
- `PORTARIA_WEB_HOMOLOGACAO_LGPD_2026-04-12.md`
- `PORTARIA_WEB_LGPD_REQUISITOS_ECOSSISTEMA_2026-04-12.md`
- `PORTARIA_WEB_BACKLOG_LGPD_2026-04-12.md`
- `GUARITA_LGPD_AUDITORIA_INICIAL_2026-04-12.md`
- `GUARITA_LGPD_PENDENCIAS_EXTERNAS_2026-04-12.md`
- `PORTARIA_WEB_HOMOLOGACAO_CRUZADA_ECOSSISTEMA_2026-04-12.md`
- `PORTARIA_WEB_PEDIDO_BACKEND_V4_4_GAP_2026-04-12.md`
- `PORTARIA_WEB_RESUMO_INTEGRACAO_API_SAPINHO_V4_4_2026-04-12.md`
- `PORTARIA_WEB_RESUMO_INTEGRACAO_API_SAPINHO_V4_6_2026-04-13.md`
- `PORTARIA_WEB_PENDENCIAS_BACKEND_V4_6_2026-04-13.md`

## Leitura Desta Rodada

- entrou a nova API `API/API Sapinho V4.6.txt`;
- a `V4.6` publicou `resident/lgpd-consent` com `deviceId` e confirmou o caminho oficial de aceite LGPD por aparelho;
- a `V4.6` publicou `resident/notification-preferences` com preferencia remota global por `channel` e `priority`;
- a `V4.6` publicou `people/unit-residents` como lista enxuta oficial de moradores da unidade;
- a `V4.6` publicou `internal/sync/reconcile/{client_request_id}` com `syncStatus`, `retryable` e metadados de conciliacao;
- a `V4.6` enriqueceu o `events/stream` com `snapshotUrl`, `liveUrl`, `replayUrl`, `replayAvailable`, `eventTime`, `secondsBefore` e `secondsAfter`;
- a tensao `type` x `eventType` e `timestamp` x `occurredAt` continua aberta mesmo na `V4.6`;
- o `Portaria Web` confirmou convergencia em `LGPD`, `notification-preferences`, `people/unit-residents` e `clientRequestId`, mas reforcou pendencias de enumeracoes oficiais, `reconcile` e persistencia operacional de alertas;
- entrou a nova API `API/API Sapinho V4.5.txt`;
- a `V4.5` confirmou `withdrawalQrCodeUrl` no schema de encomendas;
- a `V4.5` ampliou `resident notifications` com `domain`, `replayUrl` e novos tipos oficiais;
- a `V4.5` enriqueceu o schema do `events/stream`, mas ainda manteve duplicidade entre `type`/`eventType` e `timestamp`/`occurredAt`.

## Regra De Uso

Em cada rodada nova:

1. listar a raiz da `DES-RAFIELS`;
2. identificar arquivos novos ou com `LastWriteTime` mais recente;
3. ler o que ainda nao entrou na consolidacao;
4. atualizar este controle se houver novidade relevante.
# 2026-04-13

- lido `API/API Sapinho V4.9.txt`
- lido `API/API Sapinho V4.8.txt`
- lido `API/API Sapinho V4.7.txt`
- lido `GUARITA_PLANO_WHITELABEL_2026-04-13.md`
- lido `GUARITA_GUIA_BUILD_WHITELABEL_2026-04-13.md`
- lido `PORTARIA_WEB_RESUMO_INTEGRACAO_API_SAPINHO_V4_7_2026-04-13.md`
- lido `PORTARIA_WEB_PEDIDO_BACKEND_V4_7_DETALHADO_2026-04-13.md`
- a `V4.8` oficializou `alerts/{id}/workflow`, `PublicAlertOperationalWorkflowStatus` e reforcou `eventType`/`occurredAt` como canonicos;
- a `V4.8` nao publicou ainda contrato dedicado para `panico` e `entrada assistida`; o caminho continua sendo `actions`;
- a `V4.9` manteve a mesma direcao e reforcou `resident/profile`, `permissions-matrix`, `effectiveAccess`, `clientRequestId`, `syncStatus` e `workflowStatus` como leitura oficial;
- pendente de leitura cruzada futura:
  - documentos `V4.8` que `Portaria Web` e `Guarita` ainda publicarem depois desta rodada

# 2026-04-14

- lido `API/API Sapinho V5.2.txt`;
- a `V5.2` publicou `resident/live-incidents/active` e `resident/live-incidents/history`;
- a `V5.2` publicou `resident/arrival-monitoring/geo-fence`;
- a `V5.2` publicou `resident/lgpd-consent/history` por `deviceId`;
- `birthDate` entrou no contrato público de `people`;
- `PublicPersonDocumentOcrSuggestionResponse` passou a expor `suggestedBirthDate` e `birthDateCandidates`;
- revisada a raiz da `DES-RAFIELS` nesta rodada;
- não havia ainda documento `V5.2` novo de `Portaria Web` ou `Guarita` na raiz no momento desta leitura;
- prontos para publicação:
  - `APP_MORADOR_API_V5_2_INTEGRATION_2026-04-14.md`
  - `APP_MORADOR_PENDENCIAS_BACKEND_POS_API_V5_2_2026-04-14.md`

- revisada a raiz da `DES-RAFIELS` antes da publicacao do novo lote de documentos sobre `CPF`, `menores` e `facial`;
- nao apareceu documento novo conflitante com essa frente;
- prontos para publicacao:
  - `APP_MORADOR_FLUXO_CPF_MENORES_E_FACIAL_2026-04-14.md`
  - `APP_MORADOR_PENDENCIAS_BACKEND_CPF_MENORES_FACIAL_2026-04-14.md`
- lido `API/API Sapinho V5.1.txt`;
- a `V5.1` oficializou `resident/panic/*` e `resident/arrival-monitoring/*`;
- a `V5.1` publicou `resident/lgpd-policy`;
- a `V5.1` publicou `auth/stream-capabilities` e `auth/sync-capabilities`;
- prontos para publicacao:
  - `APP_MORADOR_API_V5_1_INTEGRATION_2026-04-14.md`
  - `APP_MORADOR_PENDENCIAS_BACKEND_POS_API_V5_1_2026-04-14.md`

- lido `GUARITA_RETORNO_AO_BACKEND_POS_FECHAMENTO_2026-04-14.md`;
- lido `PORTARIA_WEB_RETORNO_BACKEND_FECHAMENTO_2026-04-14.md`;
- `Guarita` e `Portaria Web` convergiram com a leitura do `App Morador` sobre o fechamento do backend;
- o residual de front ficou concentrado em consolidacao fina de `resident/profile`, configuracao canonica de condominio/cliente e governanca do stream;
- o `App Morador` absorveu nesta rodada:
  - uso de `enabledModules`, `residentManagementSettings` e `slimMode` na experiencia principal;
  - fortalecimento de `resident/profile` como fonte principal da sessao;
  - `stream-capabilities` como precondicao da camada local de tempo real.
- lido `PORTARIA_WEB_RESUMO_INTEGRACAO_API_SAPINHO_V5_2_2026-04-14.md`;
- lido `PORTARIA_WEB_PEDIDO_BACKEND_V5_2_DETALHADO_2026-04-14.md`;
- o `Portaria Web` confirmou convergencia com a mesma direcao ja aplicada no `App Morador`:
  - `resident/profile` como fonte principal;
  - `visit-forecasts` ligado;
  - `LGPD history` visivel;
  - `stream-capabilities` como contrato obrigatorio;
  - foco restante no proprio front, especialmente `confidence` do OCR e ampliacao de `enabledModules`, `residentManagementSettings` e `slimMode`.

# 2026-04-16

- lido `API/API Sapinho V5.3.txt`;
- a `V5.3` oficializou `resident/condominium`;
- a `V5.3` oficializou `resident/people/by-cpf`;
- a `V5.3` tambem publicou `operation/people/search-by-photo` e `operation/people/search-by-photo/audit`;
- a nova busca por foto ja e suficiente para identificacao reversa por celular, mas o contrato lido nao fecha sozinho o registro de acesso como `leitor facial`;
- no `App Morador`, essa capacidade ficou fora de escopo e nao sera exposta;
- validado que o app ja estava aderente nas duas rotas de `resident`;
- aplicado ajuste local de tipo para aceitar `Person.status = BLOCKED`;
- pronto para publicacao:
  - `APP_MORADOR_API_V5_3_INTEGRATION_2026-04-16.md`
  - `APP_MORADOR_CHECKLIST_HOMOLOGACAO_API_V5_3_2026-04-16.md`
