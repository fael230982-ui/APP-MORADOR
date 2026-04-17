# Integracao API Sapinho 3.7

## O que mudou na 3.7

### Mensagens portaria/morador

A API 3.7 documenta:

```text
GET /api/v1/messages?unitId=<unitId>&limit=50
POST /api/v1/messages
PATCH /api/v1/messages/{id}/read
```

O app morador agora tem uma tela `Mensagens`, usando:

```json
{
  "unitId": "uuid",
  "body": "Mensagem do morador",
  "origin": "APP",
  "direction": "RESIDENT_TO_PORTARIA"
}
```

Mensagens recebidas da portaria usam `PORTARIA_TO_RESIDENT` e sao marcadas como lidas quando a conversa e carregada.

### Acessos previstos

A API 3.7 documenta:

```text
GET /api/v1/access-logs
GET /api/v1/access-logs/{id}
GET /api/v1/visit-forecasts/{id}
PATCH /api/v1/visit-forecasts/{id}/status
```

O app separa os conceitos:

```text
Acessos previstos = visit-forecasts, ou seja, acessos agendados que vao acontecer.
Ultimos acessos = access-logs, ou seja, entradas/saidas que ja aconteceram.
```

Na Home, `Ultimos acessos` usa `/api/v1/access-logs`.

Na tela `Acessos previstos`, o app continua usando `/api/v1/visit-forecasts`.

O app agora usa o detalhe real do acesso previsto ao abrir a tela de detalhe, incluindo:

```text
- status
- chegada validada
- saida registrada
- usuario que validou chegada/saida
- historico de eventos
```

Tambem foi ligado o cancelamento de acesso previsto via:

```json
{
  "status": "CANCELLED"
}
```

### Retirada de encomenda

A API 3.7 adicionou:

```text
GET /api/v1/deliveries/withdrawal-qr/{code}
```

O app ja usa o fluxo principal de validacao:

```text
POST /api/v1/deliveries/{id}/validate-withdrawal
```

E agora aceita a resposta `PublicDeliveryValidateWithdrawalResponse`, que retorna `deliveryId`, `valid`, `withdrawnAt` e `withdrawnByName`.

## Ainda nao veio na 3.7

Nao encontrei no arquivo 3.7:

```text
GET /api/v1/resident/cameras
POST /api/v1/resident/devices
PATCH /api/v1/resident/notifications/read-all
POST /api/v1/auth/forgot-password
```

Confirmacao posterior do backend em producao: para cameras do morador, o endpoint oficial ficou sendo o geral:

```text
GET /api/v1/cameras
GET /api/v1/cameras?unitId=<unitId>
```

Regra confirmada: `MORADOR` lista cameras pelo escopo de unidade (`camera.unit_id in user.unitIds`), sem depender de `visibilityScope` quando a camera pertence a propria unidade.

Os demais pontos continuam documentados em:

```text
docs/backend-pending-requirements.md
```
