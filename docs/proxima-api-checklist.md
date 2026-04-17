# Checklist pós-v4.0

Use este roteiro para validar rapidamente o que a `API Sapinho V4.0` já trouxe e o que ainda precisa ser confirmado em produção.

## Já integrado no app

1. `PATCH /api/v1/resident/notifications/read-all`
2. `GET /api/v1/resident/profile`
3. `PUT /api/v1/resident/profile`
4. `POST /api/v1/resident/devices`
5. CRUD de `vehicles` com `PUT` e `DELETE`

## 1. Device do morador

Confirmar em produção:

```text
POST /api/v1/resident/devices
```

Payload que o app já envia:

```json
{
  "pushToken": "ExponentPushToken[...]",
  "platform": "ios",
  "deviceName": "ios Expo Go",
  "unitId": "uuid"
}
```

Validar:

- retorno `200` ou `201`;
- múltiplos devices por usuário;
- atualização do mesmo token;
- se o endpoint já está aceitando token do Expo;
- se o cadastro depende de unidade selecionada.

## 2. Perfil do morador

Confirmar em produção:

```text
GET /api/v1/resident/profile
PUT /api/v1/resident/profile
```

O app já está pronto para:

- consultar perfil;
- editar nome;
- editar e-mail;
- editar telefone.

Validar:

- quais campos realmente podem ser alterados;
- se e-mail duplicado retorna `409` ou erro equivalente;
- se troca de unidade é bloqueada;
- se a resposta já devolve o usuário atualizado no mesmo formato esperado pelo app.

## 3. Notificações do morador

Confirmar em produção:

```text
GET /api/v1/resident/notifications
PATCH /api/v1/resident/notifications/{id}/read
PATCH /api/v1/resident/notifications/read-all
```

O app já aceita navegar por:

- `DELIVERY_RECEIVED`
- `DELIVERY_WITHDRAWN`
- `VISIT_FORECAST`
- `VISIT_ARRIVED`
- `MESSAGE_CREATED`
- `PORTARIA_MESSAGE`
- `ALERT_CREATED`
- `CAMERA_STATUS_CHANGED`

Validar:

- se `read-all` já está funcional;
- payload real dos tipos enviados;
- se `messageId`, `deliveryId`, `visitForecastId`, `alertId` e `cameraId` vêm preenchidos quando aplicável.

## 4. Push real

Mesmo com `resident/devices` publicado, ainda precisa validar:

- push de visita chegou;
- push de encomenda recebida;
- push de mensagem da portaria;
- push de alerta de segurança.

Payload ideal já suportado pelo app:

```json
{
  "id": "uuid",
  "type": "MESSAGE_CREATED",
  "title": "Nova mensagem",
  "body": "A portaria enviou uma mensagem",
  "messageId": "uuid",
  "deliveryId": null,
  "visitForecastId": null,
  "alertId": null,
  "cameraId": null,
  "readAt": null,
  "createdAt": "2026-04-10T12:00:00Z"
}
```

## 5. Veículos

Confirmar em produção:

```text
GET /api/v1/vehicles?unitId=<unitId>
POST /api/v1/vehicles
PUT /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}
```

Regras esperadas:

- `MORADOR` só opera veículos da própria unidade;
- `403` para unidade de terceiros;
- `404` para veículo inexistente;
- status inicial do veículo definido com clareza.

## 6. Validação manual após publicação

1. registrar device;
2. enviar push de teste;
3. validar chegada de visita;
4. validar mensagem da portaria;
5. validar encomenda;
6. validar câmera com evento;
7. validar criação, edição e remoção de veículo;
8. validar atualização real do perfil.
