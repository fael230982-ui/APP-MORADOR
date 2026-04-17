# Integracao API Sapinho 3.6

## Implementado no app

### Encomendas do morador

Endpoint novo:

```text
GET /api/v1/resident/deliveries?page=1&limit=100
```

O app usa este endpoint como fonte principal para a aba de encomendas. Se a chamada falhar por endpoint indisponivel, ainda tenta os fluxos legados de `/api/v1/deliveries` para manter compatibilidade.

Campos novos normalizados:

```text
pickupCode
withdrawalCode
qrCodeUrl
withdrawnByName
withdrawalValidationMethod
withdrawalValidatedAt
```

### Validacao de retirada

Endpoint novo:

```text
POST /api/v1/deliveries/{id}/validate-withdrawal
```

Payload usado:

```json
{
  "code": "CODIGO",
  "validationMethod": "CODE"
}
```

A tela de detalhe da encomenda agora permite confirmar o codigo e atualizar os dados apos retorno da API.

### Notificacoes recebidas

Endpoints novos:

```text
GET /api/v1/resident/notifications
GET /api/v1/resident/notifications?unreadOnly=true
PATCH /api/v1/resident/notifications/{id}/read
```

O app ganhou uma central em `Perfil > Notificacoes recebidas`, e o sino da home abre essa central. Notificacoes com `deliveryId` levam para o detalhe da encomenda.

## Ainda pendente no backend

### Cameras do morador

O PDF 3.6 ainda nao trouxe endpoint publico/residencial para cameras. O app continua usando:

```text
GET /api/v1/cameras
```

Contrato recomendado:

```text
GET /api/v1/resident/cameras
```

Regras esperadas:

```text
- Respeitar Authorization do morador
- Respeitar X-Selected-Unit-Id
- Retornar apenas cameras liberadas para a unidade ativa
- Incluir unitId, name, status, snapshotUrl e streamUrl ou imageStreamUrl
```

### Prestador com agenda estruturada

O endpoint `/api/v1/visit-forecasts` existe, mas a agenda de prestador ainda precisa aceitar campos estruturados de autorizacao recorrente:

```json
{
  "authorizedWeekdays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "accessStartTime": "08:00",
  "accessEndTime": "17:00",
  "validFrom": "2026-04-10",
  "validUntil": "2026-05-10"
}
```

Enquanto esses campos nao forem confirmados pelo backend, o app envia tambem a regra no campo `notes`.
