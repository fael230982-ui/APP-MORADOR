# Solicitacao para backend - App Morador apos API v4.1

Este documento lista apenas o que ainda precisa ser confirmado, publicado em producao ou ajustado no backend depois da analise da `API Sapinho V4.1`.

## O que a v4.1 ja resolveu no contrato

Na `v4.1`, o backend ja expoe no contrato:

```text
PATCH /api/v1/resident/notifications/read-all
POST /api/v1/resident/devices
GET /api/v1/resident/profile
PUT /api/v1/resident/profile
GET /api/v1/vehicles
POST /api/v1/vehicles
GET /api/v1/vehicles/{id}
PUT /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Com isso, deixam de ser pendencia de contrato:

- registro de device do morador;
- marcar todas as notificacoes como lidas;
- endpoint proprio para perfil do morador;
- CRUD completo de veiculos no OpenAPI;
- recuperacao de senha e redefinicao por token.

## O que ainda falta pedir ao backend

## 1. Confirmar permissoes reais de `MORADOR` em producao

O contrato existe, mas o ponto critico continua sendo permissao real no ambiente usado pelo app.

Confirmar em producao para `MORADOR`:

```text
GET /api/v1/people/{id}/access-summary
GET /api/v1/vehicles
POST /api/v1/vehicles
GET /api/v1/vehicles/{id}
PUT /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}
GET /api/v1/resident/profile
PUT /api/v1/resident/profile
PATCH /api/v1/resident/notifications/read-all
POST /api/v1/resident/devices
PATCH /api/v1/alerts/{id}/status
PATCH /api/v1/visit-forecasts/{id}/status
```

Regras esperadas:

- `MORADOR` so acessa dados da propria unidade;
- se tentar acessar recurso de outra unidade, retornar `403`;
- se o recurso nao existir, retornar `404`;
- nada administrativo deve vazar via lista geral.

## 2. Push real ainda depende de evento de negocio

A v4.1 ja trouxe:

```text
POST /api/v1/resident/devices
```

Isso resolve o cadastro do aparelho, mas ainda precisa confirmar o disparo real de push para:

- visita chegou;
- encomenda recebida;
- mensagem da portaria;
- alerta de seguranca;
- mudanca relevante de camera, se isso fizer parte do produto.

Eventos esperados para o app morador:

```text
VISIT_ARRIVED
DELIVERY_RECEIVED
MESSAGE_CREATED
ALERT_CREATED
CAMERA_STATUS_CHANGED
```

Pontos a confirmar:

- quais tipos oficiais o backend vai usar;
- se a criacao em `resident/notifications` acontece junto com o push;
- se havera fallback quando o usuario nao tiver device ativo;
- se `resident/devices` ja esta funcional em producao com token do Expo.

## 3. Mensagens portaria/morador ainda precisam de confirmacao funcional

Os endpoints continuam no contrato:

```text
GET /api/v1/messages
POST /api/v1/messages
PATCH /api/v1/messages/{id}/read
```

O app ja esta preparado para enviar:

```json
{
  "unitId": "uuid-da-unidade",
  "body": "Mensagem do morador",
  "origin": "APP",
  "direction": "RESIDENT_TO_PORTARIA"
}
```

Falta confirmar:

- `origin=APP` e valor oficial aceito em producao;
- `direction=RESIDENT_TO_PORTARIA` e valor oficial aceito em producao;
- mensagem da portaria para o morador dispara push;
- resposta do morador gera aviso no front da portaria;
- quais status oficiais existem: `SENT`, `DELIVERED`, `READ`, `FAILED` ou outro enum.

## 4. Push de visita chegada ainda depende da regra de chegada

O app ja usa `visit-forecasts` e ja consegue mostrar chegada quando `arrivedAt` vem preenchido.

O que ainda precisa do backend:

- disparar push quando a portaria validar a chegada;
- registrar isso tambem em `resident/notifications`;
- idealmente preencher um campo como `residentNotifiedAt`, se esse controle existir.

Payload esperado:

```json
{
  "type": "VISIT_ARRIVED",
  "visitForecastId": "visit-uuid",
  "unitId": "unit-uuid",
  "title": "Visita chegou",
  "body": "Joao teve o acesso validado na portaria."
}
```

## 5. Agenda estruturada para prestador ainda falta

O app ja permite cadastrar prestador com:

- validade inicial e final;
- dias da semana;
- horario inicial e final;
- tipo de servico.

Hoje, se o contrato ainda nao tiver esses campos no `visit-forecast`, o app precisa continuar consolidando isso em `notes`.

Campos desejados no backend:

```json
{
  "serviceType": "Limpeza",
  "authorizedWeekdays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "accessStartTime": "08:00",
  "accessEndTime": "17:00",
  "validFrom": "2026-04-10",
  "validUntil": "2026-05-10"
}
```

Regras esperadas:

- bloquear fora da validade;
- bloquear fora dos dias autorizados;
- bloquear fora da janela de horario;
- retornar motivo claro para a portaria.

## 6. `events/stream` ainda precisa de confirmacao operacional

O contrato continua trazendo:

```text
GET /api/v1/events/stream
```

Ainda falta confirmar:

- se e SSE real com `Content-Type: text/event-stream`;
- como autenticar no app mobile;
- se esse endpoint e permitido para `MORADOR`;
- quais eventos realmente serao publicados para o app morador.

Eventos uteis:

```text
ALERT_CREATED
ACCESS_REGISTERED
VISIT_ARRIVED
DELIVERY_CREATED
DELIVERY_UPDATED
CAMERA_STATUS_CHANGED
MESSAGE_CREATED
VEHICLE_CREATED
```

## 7. Recuperacao de senha agora precisa de confirmacao funcional

A v4.1 trouxe:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Agora o ponto pendente deixou de ser contrato e passou a ser comportamento real:

- como o token chega ao morador;
- qual a validade do token;
- qual resposta o backend retorna para token expirado;
- qual resposta o backend retorna para token invalido;
- se ha limite de tentativas ou cooldown por e-mail;
- se a mensagem de sucesso em `forgot-password` e neutra mesmo quando o e-mail nao existir.

## 8. Confirmar quais campos o `PUT /api/v1/resident/profile` realmente aceita

A v4.1 ja trouxe o endpoint:

```text
PUT /api/v1/resident/profile
```

Agora falta so confirmar o comportamento real em producao:

- quais campos sao editaveis pelo morador;
- se `phone` e `email` sao aceitos;
- se `name` pode ser alterado;
- se `photoUrl` esta liberado para o morador;
- se mudanca de e-mail exige validacao adicional;
- se alteracao de unidade e corretamente bloqueada;
- se a resposta ja devolve o usuario normalizado como o app precisa.
