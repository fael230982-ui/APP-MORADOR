# Alinhamento Tecnico Do App Morador

Data de referencia: `2026-04-11`

## Objetivo

Este documento registra o que o `app-morador` ja passou a tratar no padrao do ecossistema e o que ainda permanece como compatibilidade temporaria com o backend atual.

## O Que Ja Foi Alinhado

### Auth, perfil e contrato de usuario

O app passou a preservar melhor campos contratuais vindos do backend no usuario autenticado, incluindo:

- `scopeType`
- `permissions`
- `streetIds`
- `hasFacialCredential`
- `faceStatus`
- `faceUpdatedAt`

Tambem foi preparada a sincronizacao do estado facial oficial do backend para o estado local usado pelas telas.

Na frente de governanca e conformidade, o app tambem passou a manter:

- aceite local versionado de termo;
- tentativa segura de leitura de aceite remoto quando existir API oficial;
- tentativa segura de persistencia de aceite remoto sem quebrar o fluxo atual se a rota ainda nao existir.

Arquivos principais:

- [services/authService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/authService.ts)
- [services/facialStatus.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/facialStatus.ts)
- [hooks/useAuth.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/hooks/useAuth.tsx)
- [services/legalAcceptance.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/legalAcceptance.ts)
- [constants/legal.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/legal.ts)
- [app/_layout.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/_layout.tsx)
- [utils/permissionsManager.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/permissionsManager.ts)

### Encomendas

O app passou a trabalhar com leitura canonica para:

- `withdrawalCode`
- `withdrawalQrCodeUrl`
- `READY_FOR_WITHDRAWAL` como status alvo aceito localmente

Compatibilidade mantida:

- `pickupCode`
- `qrCodeUrl`
- payloads antigos sem `READY_FOR_WITHDRAWAL`

Arquivos principais:

- [types/delivery.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/delivery.ts)
- [services/deliveries.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/deliveries.ts)
- [app/(tabs)/deliveries.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/deliveries.tsx)
- [app/deliveries/[id].tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/deliveries/[id].tsx)

### Notificacoes

O app passou a normalizar tipos legados para grupos canonicos:

- `DELIVERY_EVENT`
- `ACCESS_EVENT`
- `OPERATION_MESSAGE`
- `SECURITY_ALERT`
- `CAMERA_EVENT`

Compatibilidade mantida:

- `DELIVERY_RECEIVED`
- `DELIVERY_WITHDRAWN`
- `VISIT_FORECAST`
- `VISIT_ARRIVED`
- `MESSAGE_CREATED`
- `PORTARIA_MESSAGE`
- `ALERT_CREATED`
- `CAMERA_STATUS_CHANGED`

Tambem foi preparada uma camada local de som personalizado por tipo de notificacao, com canais/perfis separados para:

- `DELIVERY`
- `VISIT`
- `ALERT`
- `MESSAGE`
- `CAMERA`

Isso ja permite diferenciar notificacoes locais do app, como visita chegada, e deixa o projeto pronto para aplicar o mesmo padrao quando o `backend` enriquecer os payloads de push com tipo/categoria consistente.

Arquivos principais:

- [types/residentNotification.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/residentNotification.ts)
- [types/notificationSound.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/notificationSound.ts)
- [services/residentNotifications.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentNotifications.ts)
- [utils/notificationService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/notificationService.ts)
- [app/profile/resident-notifications.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/resident-notifications.tsx)

### Facial

O app passou a usar estados canonicos locais:

- `UNKNOWN`
- `NOT_REGISTERED`
- `PENDING_PROCESSING`
- `READY`
- `FAILED`
- `BLOCKED`

Observacao apos a `API v4.4`:

- o backend agora publicou um `faceStatus` oficial com os valores `NO_PHOTO`, `PHOTO_ONLY`, `FACE_PENDING_SYNC`, `FACE_SYNCED` e `FACE_ERROR`;
- o app foi preparado para reconhecer esse contrato oficial e mapear isso para a leitura local simplificada.
- o app deixou de afirmar sincronizacao completa logo apos o upload da foto e passou a tratar esse momento como `aguardando sincronizacao` ate o backend confirmar o estado oficial.

Compatibilidade mantida:

- leitura de estados antigos salvos como `registered`, `pending`, `skipped`, `unknown`

Arquivos principais:

- [services/facialStatus.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/facialStatus.ts)
- [hooks/useResidentPhoto.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/hooks/useResidentPhoto.ts)
- [app/profile/face-enrollment.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/face-enrollment.tsx)
- [app/profile/edit.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/edit.tsx)
- [app/(tabs)/profile.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/profile.tsx)
- [app/(tabs)/index.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/index.tsx)

### Alertas

O app passou a expor semantica mais canonica de alerta:

- `AlertType`
- `AlertSeverity`
- `AlertStatus`

Sem quebrar a leitura visual atual de:

- `UNAUTHORIZED`
- `AUTHORIZED`
- `UNDER_REVIEW`
- `RESOLVED`

Arquivos principais:

- [types/alarm.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/alarm.ts)
- [services/alarms.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/alarms.ts)

### Cameras

O app passou a expor prioridade de midia no modelo:

- `preferredMedia`

Ordem aplicada:

1. `liveUrl`
2. `hlsUrl`
3. `webRtcUrl`
4. `imageStreamUrl`
5. `mjpegUrl`
6. `snapshotUrl`
7. `thumbnailUrl`

Arquivos principais:

- [types/camera.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/camera.ts)
- [services/cameraService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/cameraService.ts)

### Permissoes

O app passou a ficar preparado para a `permissions-matrix` da `V4.4` com:

- tipo local para matriz de permissao;
- servico de consulta da rota oficial;
- mescla segura entre permissoes por papel e permissoes vindas do backend quando houver coincidencia de nome conhecida.

Arquivos principais:

- [types/permissionMatrix.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/types/permissionMatrix.ts)
- [services/permissionsMatrix.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/permissionsMatrix.ts)
- [utils/permissionsManager.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/permissionsManager.ts)
- [store/usePermissionStore.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/store/usePermissionStore.ts)

## O Que Ainda E Compatibilidade Temporaria

Os pontos abaixo continuam aceitos no `app-morador`, mas nao devem ser tratados como padrao final do ecossistema:

- `pickupCode`
- `qrCodeUrl`
- tipos antigos de notificacao
- estados faciais locais antigos
- payloads de alerta sem tabela oficial fechada de severidade/status
- payloads de camera sem garantia de publicacao uniforme de todos os campos de midia

## O Que Ainda Depende Do Backend

Para o alinhamento ficar completo, o backend ainda precisa oficializar ou consolidar:

- status final de encomenda, inclusive confirmando ou nao `READY_FOR_WITHDRAWAL`;
- nome final do campo de QR de retirada;
- matriz oficial de permissao por app e por acao;
- tipagem oficial de stream e eventos;
- contrato final de tipos e status de alertas;
- publicacao consistente dos campos de midia de camera.
- categoria/tipo consistente nos payloads de push para aplicar som personalizado tambem em notificacoes remotas em segundo plano.

## Regra De Manutencao

Enquanto o backend nao fechar o contrato final:

- o `app-morador` deve priorizar nomes canonicos internamente;
- manter compatibilidade de leitura com os campos legados;
- evitar criar novo alias;
- e remover compatibilidade temporaria assim que o contrato oficial ficar estavel.

## Validacao

As mudancas desta rodada foram validadas com:

- `npm run lint`

Estado atual:

- sem erros;
- sem warnings.
