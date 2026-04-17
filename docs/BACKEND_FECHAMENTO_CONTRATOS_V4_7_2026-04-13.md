# Backend Fechamento De Contratos V4.7

## Resumo

O backend confirmou o fechamento de blocos importantes do ecossistema. Para o `app-morador`, os pontos mais relevantes foram:

- `stream` canonico com `eventType` e `occurredAt`;
- `sync/reconcile` com tabela oficial de status;
- `encomendas` com `withdrawalCode` e `withdrawalQrCodeUrl` como nomes canonicos;
- `renotify` restrito a `OPERACIONAL` e `CENTRAL`;
- `visitas previstas` com semantica final fechada;
- `notification-preferences` com enums oficiais e escopo `ACCOUNT`;
- `LGPD` com escopo `ACCOUNT_DEVICE`;
- `people/unit-residents` como endpoint canonico;
- `alertas` com `READ_STATE`, sem triagem operacional persistida;
- `cameras` com `preferredStillUrl` e `preferredLiveUrl`.

## Ajustes aplicados no App Morador

### Encomendas

- a UI deixou de expor `renotify` ao morador em [app/deliveries/[id].tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/deliveries/[id].tsx), porque a acao ficou oficialmente restrita a perfis operacionais.

### Visitas previstas

- a compatibilidade legada foi corrigida para:
  - `COMPLETED -> ARRIVED`
  - `NO_SHOW -> EXPIRED`

em [services/visitForecasts.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/visitForecasts.ts).

### Alertas

- a experiencia foi alinhada ao workflow oficial `READ_STATE`;
- o app deixou de tratar `alerta` como `resolvido` e passou a tratar como `lido/nao lido`;
- a leitura local continua respeitando `READ/UNREAD` sem fingir trilha operacional inexistente.

Arquivos principais:

- [types/alarm.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/alarm.ts)
- [services/alarms.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/alarms.ts)
- [app/(tabs)/alerts.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/alerts.tsx)
- [services/panic.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/panic.ts)

### Cameras

- a preferencia oficial de midia foi alinhada:
  - still preferencial: `snapshotUrl`
  - live preferencial: `webRtcUrl > hlsUrl > imageStreamUrl`
- o app passou a preservar:
  - `preferredStillUrl`
  - `preferredLiveUrl`
  - `mediaAuthType`
  - `mediaExpirationSupported`
  - `replayUrl`
  - `replayExpiresAt`

Arquivos principais:

- [types/camera.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/camera.ts)
- [services/cameraService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/cameraService.ts)
- [app/(tabs)/cameras.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/cameras.tsx)

### LGPD, notificacoes e reconcile

Esses blocos ja tinham sido absorvidos na rodada da `V4.7` e permanecem coerentes com o fechamento final do backend:

- `LGPD` por `ACCOUNT_DEVICE`
- `notification-preferences` com `ACCOUNT`
- `sync/reconcile` com `retryable`, `isFinal`, `isApplied`

## Leitura final

O `app-morador` agora esta aderente ao que o backend fechou como contrato oficial nesta rodada.

O que resta daqui para frente tende a ser:

- nova API;
- nova decisao de produto;
- ou ajustes complementares de `Portaria` e `Guarita`.
