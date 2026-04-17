# Pendencias Para O Backend Apos API V4.5

Data de referencia: `2026-04-13`

Escopo:

- `App Morador`
- `Portaria Web`
- `Guarita`
- `Backend`

## Objetivo

Registrar somente o que continua pendente do lado do `backend` depois da leitura e da absorcao pratica da `API Sapinho V4.5`.

Este documento parte do principio de que a `V4.5` trouxe avancos reais, mas ainda nao fechou todo o contrato do ecossistema.

## O Que A V4.5 Ja Melhorou

- `withdrawalQrCodeUrl` passou a existir no schema de encomendas;
- `resident notifications` ganharam `domain`, `replayUrl` e novos tipos oficiais;
- `events/stream` ficou mais rico e tipado;
- `deliveries/{id}/renotify` passou a existir;
- `faceStatus` segue estavel.

## Pendencias Que Continuam No Backend

### 1. Fechar o canonico do stream

A `V4.5` melhorou o schema, mas ainda manteve duplicidade entre:

- `type` x `eventType`
- `timestamp` x `occurredAt`

O `backend` precisa declarar explicitamente:

- qual campo e canonico para tipo do evento;
- qual campo e canonico para data/hora do evento;
- quais campos ficam apenas como legado temporario;
- por quanto tempo os aliases coexistem.

### 2. Fechar o contrato final de permissoes

A rota `GET /api/v1/auth/permissions-matrix` continua sem declaracao operacional final.

O `backend` ainda precisa responder:

- se ela ja e a fonte primaria oficial;
- qual formato de permissao vence;
- quais aliases legados seguem aceitos;
- como `scope`, `allowedClients` e `allowedProfiles` entram no contrato final.

### 3. Fechar a nomenclatura final de encomendas

A `V4.5` melhorou o contrato, mas ainda nao encerrou tudo.

O `backend` ainda precisa definir oficialmente:

- se `withdrawalCode` substitui em definitivo `pickupCode`;
- se `pickupCode` segue apenas como alias legado;
- qual tabela final de status vence;
- se `READY_FOR_WITHDRAWAL` e contrato oficial ou apenas semantica local dos fronts.

### 4. Declarar governanca de `deliveryRenotification`

A `V4.5` trouxe:

- `deliveryRenotification` no contrato;
- `POST /api/v1/deliveries/{id}/renotify`.

Mas ainda falta fechar:

- se o `App Morador` pode usar essa rota oficialmente em producao;
- limites de repeticao;
- janela minima entre reenvios;
- comportamento por perfil e por canal;
- se o reenvio gera novo registro em `resident/notifications`;
- se havera auditoria oficial de reenvio.

### 5. Sincronizacao oficial de preferencias de notificacao

O `App Morador` ja tem preferencias locais por categoria, mas o `backend` ainda nao publicou contrato para sincronizacao por conta.

O `backend` precisa definir:

- se havera preferencia remota por usuario;
- qual sera o shape oficial;
- se a preferencia sera por categoria, canal, som ou prioridade;
- como isso conversa com push e `resident/notifications`.

### 6. Persistencia oficial de aceite LGPD

O app ja esta preparado para persistir aceite remoto, mas a rota oficial ainda nao foi publicada.

O `backend` precisa definir:

- rota oficial para leitura do aceite vigente;
- rota oficial para gravacao do aceite;
- shape oficial minimo:
  - `accepted`
  - `version`
  - `acceptedAt`
- politica de versionamento do termo;
- relacao entre aceite, conta, unidade e dispositivo.

### 7. Tipagem final de notificacoes e push

A `V4.5` melhorou `resident notifications`, mas ainda falta a convergencia total com payloads de push.

O `backend` precisa fechar:

- se `type`, `domain` e categoria de push serao equivalentes;
- qual campo do push sera a fonte oficial para o frontend;
- obrigatoriedade de `deliveryId`, `visitForecastId`, `alertId`, `cameraId`, `messageId` quando aplicavel;
- semantica oficial para roteamento e som por categoria.

### 8. Contrato minimo de alertas e cameras

Mesmo com a evolucao da `V4.5`, ainda falta declaracao final para:

- `alertType`
- `alertSeverity`
- `alertStatus`
- `cameraId`
- `snapshotUrl`
- `replayUrl`

O `backend` precisa declarar:

- shape minimo oficial;
- obrigatoriedade por contexto;
- consistencia entre `alert`, `event`, `resident notification` e `camera`.

## Ordem Recomendada De Fechamento

1. stream
2. permissoes
3. encomendas
4. `deliveryRenotification`
5. aceite LGPD
6. preferencias de notificacao
7. push/notificacoes
8. alertas e cameras

## Lista Objetiva Para Encaminhamento

1. Declarar campo canonico de tipo e de data/hora no `events/stream`.
2. Declarar status final da `permissions-matrix`.
3. Oficializar `withdrawalCode` x `pickupCode` e a tabela final de status de encomenda.
4. Declarar uso oficial, limites e auditoria de `deliveries/{id}/renotify`.
5. Publicar contrato oficial para aceite versionado de LGPD.
6. Publicar contrato oficial para preferencias remotas de notificacao por conta.
7. Fechar equivalencia entre `resident notifications` e payloads de push.
8. Declarar shape oficial de alertas, cameras, `snapshotUrl` e `replayUrl`.

## Observacao Final

A `V4.5` reduziu o numero de adaptacoes locais necessarias.

O principal gap restante agora nao e falta de tela no `App Morador`.

O principal gap restante e o `backend` transformar os avancos da `V4.5` em contrato oficialmente arbitrado para todo o ecossistema.
