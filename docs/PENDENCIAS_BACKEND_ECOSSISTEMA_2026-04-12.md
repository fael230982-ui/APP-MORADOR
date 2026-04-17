# Pendencias Para O Backend - Ecossistema

Data de referencia: `2026-04-12`

Escopo:

- `App Morador`
- `Portaria Web`
- `Guarita`
- contrato oficial de `backend`

## Objetivo

Este documento consolida o que ainda precisa ser fechado no `backend` para o ecossistema parar de convergir por adaptacao local e passar a operar por contrato oficial unico.

Ele deve ser tratado como pauta viva de alinhamento entre os tres modulos e o `backend`.

## Prioridade Alta

### 1. Fechar contrato final de encomendas

Hoje ainda existe divergencia de nomenclatura e de semantica.

O `backend` precisa definir oficialmente:

- qual nome vence entre `pickupCode` e `withdrawalCode`;
- qual nome vence para o QR de retirada;
- se o status oficial vai incluir ou nao `READY_FOR_WITHDRAWAL`;
- qual tabela final de status de encomenda sera publicada para todos os canais.

Decisoes esperadas:

- uma nomenclatura unica para codigo de retirada;
- uma nomenclatura unica para QR de retirada;
- semantica unica entre `recebida`, `notificada`, `pronta para retirada` e `retirada`;
- garantia de compatibilidade temporaria enquanto os fronts migram.

### 2. Publicar matriz oficial de permissao

A `API v4.4` ja trouxe `GET /api/v1/auth/permissions-matrix`, mas ainda falta fechamento operacional.

O `backend` precisa definir:

- se essa rota e a fonte oficial unica para todos os fronts;
- quais permissoes sao validas por papel;
- quais aliases antigos ainda serao aceitos;
- como o `scope` entra na matriz;
- se havera `allowedClients`, `allowedProfiles` e recorte por canal.

Decisoes esperadas:

- matriz unica oficial por papel e acao;
- semantica oficial de escopo;
- regra clara para `App Morador`, `Portaria Web` e `Guarita`;
- descontinuacao controlada das regras locais por front.

### 3. Fechar contrato oficial de alertas

Hoje os fronts conseguem trabalhar com alertas, mas ainda sem tabela oficial unica de tipo, severidade e status.

O `backend` precisa publicar:

- tipos oficiais de alerta;
- severidades oficiais;
- status oficiais;
- campos obrigatorios quando houver evidencia ou camera associada.

Campos esperados:

- `alertId`
- `type`
- `severity`
- `status`
- `occurredAt`
- `cameraId` quando aplicavel
- `snapshotUrl` quando aplicavel
- `unitId`

### 4. Publicar contrato de eventos em tempo real como contrato implementado

O stream melhorou na `v4.4`, mas ainda falta fechar consumo real entre os canais.

O `backend` precisa definir:

- se `GET /api/v1/events/stream` sera liberado por canal;
- se o formato atual do evento ja e contrato definitivo;
- quais eventos cada app recebera;
- como funciona reconexao;
- quando usar `POST /api/v1/events/stream/confirm`;
- como ficam `heartbeat`, expiracao e deduplicacao.

Decisoes esperadas:

- tipagem oficial de evento;
- matriz de eventos por canal;
- garantia de autenticacao e reconexao;
- orientacao oficial de uso para `Portaria`, `Guarita` e `App Morador`.

## Prioridade Media

### 5. Confirmar publicacao efetiva de `faceStatus`

A `v4.4` oficializou a tabela de `PublicFaceStatus`, mas ainda precisa ficar claro em quais payloads isso chegara de forma consistente.

O `backend` precisa confirmar:

- em quais rotas `faceStatus` sera publicado;
- em quais rotas `faceUpdatedAt` sera publicado;
- se `hasFacialCredential` e `faceStatus` coexistem ou se um substitui o outro;
- quando um upload de foto passa para `PHOTO_ONLY`, `FACE_PENDING_SYNC`, `FACE_SYNCED` ou `FACE_ERROR`.

Tabela oficial ja publicada:

- `NO_PHOTO`
- `PHOTO_ONLY`
- `FACE_PENDING_SYNC`
- `FACE_SYNCED`
- `FACE_ERROR`

### 6. Confirmar prioridade e consistencia de midia em cameras

Os fronts ja conseguem trabalhar com fallback, mas isso ainda nao equivale a contrato oficial estavel.

O `backend` precisa confirmar:

- quais campos de video/imagem serao publicados de forma consistente;
- se a prioridade oficial de midia sera sustentada em producao;
- quando um canal deve receber apenas imagem e quando pode receber video;
- se `rtspUrl` continuara apenas como dado tecnico de backend.

Campos relevantes:

- `liveUrl`
- `hlsUrl`
- `webRtcUrl`
- `imageStreamUrl`
- `mjpegUrl`
- `snapshotUrl`
- `thumbnailUrl`

### 7. Fechar tipos oficiais de mensagens e notificacoes

Hoje o ecossistema ja separa `message`, `notification` e `alert`, mas ainda falta o `backend` publicar a tabela oficial final.

O `backend` precisa definir:

- tipos oficiais de notificacao para residente;
- tipos oficiais de mensagem operacional;
- quais eventos geram push;
- quais eventos geram registro persistido em `resident/notifications`;
- quais relacionamentos obrigatorios devem vir preenchidos.

Campos esperados quando aplicavel:

- `messageId`
- `deliveryId`
- `visitForecastId`
- `alertId`
- `cameraId`
- `unitId`

### 8. Publicar tipo/categoria consistente nos payloads de push

Os fronts ja conseguem classificar eventos localmente, mas para tocar sons diferentes tambem em notificacoes remotas em segundo plano o `backend` precisa mandar semantica suficiente no proprio push.

O `backend` precisa definir:

- qual campo do push sera a fonte oficial de categoria, por exemplo `type`, `eventType` ou `notificationType`;
- se o payload trara `deliveryId`, `visitForecastId`, `alertId`, `cameraId` ou `messageId` quando aplicavel;
- se havera `channelId` ou `soundProfile` oficial por tipo;
- como essa semantica se mantera alinhada com `resident/notifications`.

## Prioridade Estrutural

### 9. Confirmar ownership funcional por rota e por fluxo

Nem tudo precisa ser consumido pelos tres canais.

O `backend` precisa registrar oficialmente:

- o que e contrato operacional de `Portaria Web`;
- o que e contrato operacional de `Guarita`;
- o que e contrato operacional de `App Morador`;
- o que e apenas rota interna ou tecnica.

### 10. Fechar estrategia de compatibilidade temporaria

Como ja existem campos legados e frentes em paralelo, o `backend` precisa definir:

- quais aliases antigos ainda seguem validos;
- por quanto tempo;
- como avisar os fronts sobre deprecacao;
- em qual versao cada alias deixa de existir.

## Lista Objetiva Para Envio Ao Backend

1. Definir contrato final de encomendas com nomes e status oficiais.
2. Oficializar uso real da `permissions-matrix` como fonte unica ou declarar que ainda nao e.
3. Publicar tabela oficial de tipos, severidade e status de alertas.
4. Formalizar o stream de eventos como contrato implementado por canal.
5. Confirmar onde `faceStatus` e `faceUpdatedAt` passam a aparecer de forma estavel.
6. Confirmar tabela oficial e consistencia dos campos de midia de cameras.
7. Fechar tipos oficiais de `message`, `notification` e eventos que geram push.
8. Publicar tipo/categoria consistente nos payloads de push para sons personalizados e roteamento semantico.
9. Registrar ownership funcional de cada grupo de rotas por produto.
10. Publicar plano de compatibilidade e deprecacao para aliases legados.

## Observacao Final

Os tres fronts ja conseguem operar com compatibilidade local.

O principal gap agora nao e tela.

O principal gap e o `backend` transformar convergencia desejada em contrato oficial publicado e sustentado.
