# API V4.6 - Integracao Com App Morador

Data de referencia: `2026-04-13`

## Leitura Executiva

A `API Sapinho V4.6` fecha duas frentes que ainda estavam em modo de compatibilidade no `app-morador`:

- `LGPD` com rota oficial de aceite por morador e aparelho;
- `notification-preferences` com rota oficial de preferencia remota por conta.

Ela tambem enriquece o `events/stream` com midia e replay, mas ainda preserva a dupla leitura semantica que o ecossistema ja vinha apontando.

## Mudancas Relevantes Da V4.6

### 1. LGPD oficial para morador

A `V4.6` publicou:

- `GET /api/v1/resident/lgpd-consent`
- `PUT /api/v1/resident/lgpd-consent`

Com contrato:

- `accepted`
- `version`
- `acceptedAt`
- `accountId`
- `userId`
- `deviceId`

Leitura pratica:

- o `app-morador` deixa de depender prioritariamente de rotas especulativas antigas;
- o aceite versionado passa a ter caminho oficial por aparelho;
- o `deviceId` vira parte do contrato real.

### 2. Preferencia remota de notificacao

A `V4.6` publicou:

- `GET /api/v1/resident/notification-preferences`
- `PUT /api/v1/resident/notification-preferences`

Com shape atual:

- `channel`
- `priority`

Leitura pratica:

- existe agora um ajuste remoto oficial de notificacao por conta;
- ele ainda e mais amplo do que o modelo local do app;
- a granularidade por categoria continua sendo responsabilidade local do aparelho.

### 3. Stream operacional mais rico

O schema de `events/stream` agora traz de forma explicita:

- `snapshotUrl`
- `liveUrl`
- `replayUrl`
- `replayAvailable`
- `eventTime`
- `secondsBefore`
- `secondsAfter`

Leitura pratica:

- o contrato de evidencia e midia ficou mais util;
- mas a tensao `type` x `eventType` e `timestamp` x `occurredAt` continua aberta.

## Ajustes Aplicados No App Morador

- troca da leitura prioritaria de `LGPD` para a rota oficial `resident/lgpd-consent`;
- criacao de `deviceId` local estavel para aderencia ao contrato oficial;
- preparacao e integracao da rota oficial de `notification-preferences`;
- evolucao da tela de notificacoes para mostrar:
  - preferencia geral remota da conta;
  - canal remoto;
  - prioridade remota;
  - preservando os sons locais por categoria no aparelho.
- integracao do endpoint `GET /api/v1/people/unit-residents` no app para expor quantidade e amostra de moradores da unidade ativa no painel inicial e no resumo da unidade.
- formalizacao da base tecnica de `GET /api/v1/internal/sync/reconcile/{client_request_id}` em servico proprio, sem ativar fluxo operacional novo enquanto o backend nao arbitrar `X-Sync-Token`, `syncStatus`, `retryable` e semantica de conciliacao.

## Arquivos Ajustados

- [services/deviceIdentity.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/deviceIdentity.ts)
- [services/legalAcceptance.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/legalAcceptance.ts)
- [services/residentNotificationPreferences.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentNotificationPreferences.ts)
- [services/unitResidents.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/unitResidents.ts)
- [services/syncReconciliation.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/syncReconciliation.ts)
- [app/profile/notifications.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/notifications.tsx)
- [app/(tabs)/index.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/index.tsx)
- [app/unit-dashboard.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/unit-dashboard.tsx)

## O Que Continua Externo

- definicao oficial se `notification-preferences` ficara mesmo restrita a `channel` + `priority` ou se evoluira para categorias/dominios;
- fechamento canonico de `type` x `eventType` no stream;
- fechamento canonico de `timestamp` x `occurredAt`;
- tabela oficial de equivalencia entre preferencia remota global e configuracao local por categoria.
- confirmacao de estabilidade e escopo oficial de `people/unit-residents`;
- fechamento completo de `internal/sync/reconcile`, `X-Sync-Token`, `syncStatus`, `retryable` e criterios de confianca do item remoto.
