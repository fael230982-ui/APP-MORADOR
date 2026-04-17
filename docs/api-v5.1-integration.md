# API V5.1 - Integracao no App Morador

## Leitura geral

A `V5.1` trouxe um avanço relevante para o `App Morador` porque oficializou o fluxo de incidente ao vivo do morador, separando:

- `POST /api/v1/resident/panic/start`
- `PATCH /api/v1/resident/panic/{id}/location`
- `POST /api/v1/resident/panic/{id}/stop`
- `POST /api/v1/resident/arrival-monitoring/start`
- `PATCH /api/v1/resident/arrival-monitoring/{id}/location`
- `POST /api/v1/resident/arrival-monitoring/{id}/stop`

Também publicou:

- `GET /api/v1/resident/lgpd-policy`
- `GET /api/v1/auth/stream-capabilities`
- `GET /api/v1/auth/sync-capabilities`

## Ajustes aplicados no app

### 1. Incidente ao vivo do morador

O app deixou de depender apenas da heuristica de `actions` e passou a usar o contrato oficial de:

- `panic`
- `arrival-monitoring`

Arquivos ajustados:

- `services/panic.ts`
- `app/resident-actions.tsx`

O que mudou:

- `pânico` usa rota oficial dedicada;
- `entrada assistida` usa rota oficial dedicada;
- a resposta oficial agora expõe:
  - `operationNotified`
  - `notificationRadiusMeters`
  - `distanceToCondominiumMeters`
  - `unitContacts`
  - `latestLocation`

### 2. LGPD policy

Foi criada a leitura da política oficial:

- `services/residentLgpdPolicy.ts`

Campos absorvidos:

- `scopeType`
- `currentVersion`
- `revocationSupported`
- `historyVersioningSupported`
- `auditMode`
- `governanceDimensions`

### 3. Capacidades oficiais de stream e sync

Foi criada a leitura formal das capacidades publicadas:

- `services/residentCapabilities.ts`

Campos absorvidos:

- `canonicalTypeField`
- `canonicalTimeField`
- `fieldRules`
- `tokenHeaderName`
- `supportedAggregateTypes`
- `supportedSyncStatuses`
- `retryableSyncStatuses`
- `finalSyncStatuses`

## Compatibilidade mantida

- o app ainda preserva a validacao local por raio quando o centro do condominio estiver configurado por `env`;
- o historico visivel do morador ainda usa fallback por `alertas` porque a `V5.1` nao publicou leitura oficial de historico/listagem de incidentes do morador;
- o aceite LGPD local versionado continua existindo, agora com politica oficial disponivel para leitura.

## Leitura pratica

A `V5.1` reduz uma das maiores pendencias do app:

- `pânico`
- `entrada assistida`

Agora o backend ja fornece o contrato oficial de abertura, atualizacao de localizacao e encerramento desses fluxos.

## Pendencias residuais

Ainda restam pontos fora do app:

- endpoint canonico de consulta por CPF;
- `birthDate` publico para visitante/prestador;
- contrato estruturado de autorizacao facial para menor;
- endpoint oficial de leitura do incidente ativo / historico do morador;
- origem oficial do centro geografico do condominio para pre-validacao local de raio.
