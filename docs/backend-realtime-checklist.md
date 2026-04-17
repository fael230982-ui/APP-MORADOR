# Checklist backend para tempo real no app morador

Este app ja ficou preparado para evoluir de polling para tempo real. Para ativar SSE de forma segura, o backend e a infra ainda precisam fechar os pontos abaixo.

## Endpoints

Confirmar publicacao e permissao para `MORADOR`:

```text
GET /api/v1/events/stream
POST /api/v1/events/stream/confirm
```

## Contrato do stream

Definir payload oficial de cada evento com pelo menos:

- `eventId`
- `type`
- `occurredAt`
- `unitId`
- `entityId`
- `title`
- `body`
- `payload`

## Eventos uteis para o morador

Prioridade alta:

- `MESSAGE_CREATED`
- `DELIVERY_CREATED`
- `DELIVERY_UPDATED`
- `VISIT_ARRIVED`
- `ALERT_CREATED`
- `RESIDENT_NOTIFICATION_CREATED`

## Regras operacionais

Fechar comportamento de:

- autenticacao por `Authorization: Bearer <token>`;
- token expirado durante conexao longa;
- reconexao sem perder eventos;
- deduplicacao entre SSE, polling e push;
- heartbeat/keepalive para evitar timeout;
- escopo por unidade e por morador.

## Infra

Confirmar em producao:

- `Content-Type: text/event-stream`;
- proxy sem buffering indevido;
- timeout compativel com conexao persistente;
- logs e metricas de conexao, erro e reconexao.

## Push

SSE nao cobre app fechado ou em background. O backend ainda precisa manter push real para:

- mensagens;
- visitas;
- encomendas;
- alertas.
