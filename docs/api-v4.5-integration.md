# API V4.5 - Integracao Com App Morador

Data de referencia: `2026-04-13`

## Leitura Executiva

A `API Sapinho V4.5` melhora mais o contrato do que a interface do `app-morador`.

Os ganhos reais desta versao foram:

- `resident notifications` com contrato mais rico;
- `withdrawalQrCodeUrl` finalmente publicado no schema de encomendas;
- `deliveryRenotification` aparecendo no contrato;
- `events/stream` com schema mais completo;
- `faceStatus` mantido de forma estavel.
- `visitas previstas` com nova semantica de status e `releaseMode`.

## Mudancas Relevantes Da V4.5

### 1. Resident Notifications

A `V4.5` ampliou o contrato de `resident notifications`:

- novos tipos oficiais:
  - `ACCESS_ACTIVITY`
  - `DELIVERY_PENDING_WITHDRAWAL`
  - `DELIVERY_WITHDRAWN`
  - `HOUSEHOLD_ALERT`
  - `MESSAGE_RECEIVED`
  - `VISIT_FORECAST`
  - `GENERIC`
- novo campo `domain`;
- novo campo `replayUrl`;
- `read-all` segue retornando `updatedCount`.

### 2. Encomendas

O schema de entrega agora publica:

- `withdrawalCode`
- `qrCodeUrl`
- `withdrawalQrCodeUrl`
- `clientRequestId`
- `notificationSentAt`
- `deliveryRenotification`

Leitura pratica:

- `withdrawalQrCodeUrl` deixou de ser apenas nome alvo e passou a existir no contrato oficial;
- a tensao `pickupCode` x `withdrawalCode` continua parcialmente viva no ecossistema, mas o caminho oficial fica mais claro na `V4.5`.

### 3. Stream Operacional

O schema de `events/stream` ficou mais completo e agora inclui de forma oficial:

- `eventType`
- `type`
- `occurredAt`
- `timestamp`
- `entityType`
- `cameraId`
- `condominiumId`

Isso melhora a formalizacao, mas ainda nao elimina toda a duplicidade semantica entre:

- `type` x `eventType`
- `timestamp` x `occurredAt`

### 4. Facial

`faceStatus`, `faceUpdatedAt` e `faceErrorMessage` seguem presentes e coerentes com a `V4.4`.

Para o `app-morador`, isso significa:

- nenhum ajuste estrutural novo em facial;
- apenas confirmacao de que a linha adotada continua correta.

### 5. Visitas previstas

A `V4.5` oficializou a tabela:

- `PENDING_ARRIVAL`
- `ARRIVED`
- `EXPIRED`
- `CANCELLED`

E tambem passou a expor `releaseMode`.

Leitura pratica:

- o `app-morador` deixou de depender da semantica antiga baseada em `SCHEDULED`, `COMPLETED` e `NO_SHOW`;
- o app agora trata `EXPIRED` como encerramento de validade, sem inventar novo fluxo de fechamento local;
- `releaseMode` passou a ser exibido como contexto adicional.

## Ajustes Aplicados No App Morador

- ampliacao do parser de `resident notifications` para o contrato da `V4.5`;
- suporte a `domain` e `replayUrl`;
- mapeamento dos novos tipos oficiais para as categorias locais do app;
- ajuste de `markAllAsRead` para aceitar `updatedCount` como campo oficial de retorno.
- melhoria visual da lista de notificacoes para sinalizar `snapshot` e `replay` quando houver midia associada.
- integracao da rota `POST /api/v1/deliveries/{id}/renotify` na tela de detalhe da encomenda.
- absorcao de `recipientPersonName` e de campos de auditoria de encomenda no app.
- alinhamento da camada de `visitas previstas` com os status oficiais da `V4.5`.

## Arquivos Ajustados

- [types/residentNotification.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/residentNotification.ts)
- [services/residentNotifications.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentNotifications.ts)
- [app/profile/resident-notifications.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/resident-notifications.tsx)
- [services/deliveries.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/deliveries.ts)
- [app/(tabs)/deliveries.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/deliveries.tsx)
- [app/deliveries/[id].tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/deliveries/[id].tsx)
- [services/visitForecasts.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/visitForecasts.ts)
- [app/people/visits.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/people/visits.tsx)
- [app/people/visit-detail.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/people/visit-detail.tsx)
- [services/residentOverview.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentOverview.ts)

## O Que Ja Estava Pronto E Continua Valendo

- suporte local a `withdrawalQrCodeUrl`;
- suporte local a `faceStatus` oficial;
- leitura defensiva de notificacoes por tipo;
- sons por categoria e preferencias locais de notificacao.

## Pendencias Que Continuam Externas

- fechamento canonico de `type` x `eventType` no stream;
- fechamento canonico de `timestamp` x `occurredAt`;
- definicao final de sincronizacao de preferencias de notificacao por conta;
- governanca oficial de `deliveryRenotification` no frontend;
- resposta formal do `backend` sobre as decisoes pendentes do ecossistema.
