# API V4.7 Integration

## Leitura objetiva

A `API Sapinho V4.7` nao abriu uma ruptura grande de rota para o `app-morador`, mas formalizou melhor alguns contratos que ja tinham aparecido na `V4.6`.

Os ganhos mais relevantes para este app foram:

- `resident/devices` agora documenta `deviceId` e `appVersion`;
- `resident/lgpd-consent` deixa mais claro o escopo por `ACCOUNT_DEVICE`;
- `resident/notification-preferences` confirma `scopeType=ACCOUNT`;
- `internal/sync/reconcile` passou a documentar `isFinal`, `isApplied`, `syncedAt`, `createdAt` e `updatedAt`;
- entregas seguem com `recipientPersonName`, `withdrawalQrCodeUrl` e `notificationSentAt`;
- `auth/me` e `resident/profile` seguem confirmando campos de sessao e escopo como `scopeType`, `selectedUnitId`, `selectedUnitName` e `requiresUnitSelection`.

## Ajustes aplicados no app

### 1. Registro de dispositivo

O app agora envia tambem:

- `deviceId`
- `appVersion`

em [deviceRegistration.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/deviceRegistration.ts).

O cache local de registro tambem passou a considerar esses dois campos para evitar falso reaproveitamento de uma sessao antiga quando o identificador do aparelho ou a versao do app mudar.

### 2. LGPD

O parser de aceite passou a absorver tambem:

- `userId`
- `accountId`
- `deviceId`
- `scopeType`

em [legalAcceptance.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/legalAcceptance.ts).

### 3. Preferencia remota de notificacao

O contrato remoto passou a expor e preservar:

- `scopeType`
- `channel`
- `priority`

em [residentNotificationPreferences.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentNotificationPreferences.ts) e [notifications.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/notifications.tsx).

### 4. Reconcile

O tipo local passou a absorver:

- `isFinal`
- `isApplied`
- `syncedAt`
- `createdAt`
- `updatedAt`

em [syncReconciliation.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/syncReconciliation.ts).

## O que continua pendente no backend

- canon final do `stream`;
- uso pratico e oficial da `permissions-matrix`;
- semantica final de `renotify`;
- contrato final de alertas operacionais;
- governanca completa de `sync/reconcile`;
- lista oficial e politica de `syncStatus`;
- estabilidade oficial de `people/unit-residents` incluindo ou nao `locatarios`.

## Conclusao

A `V4.7` melhora a confiabilidade do contrato, mas nao exigiu refatoracao grande de interface no `app-morador`. O principal ganho foi reduzir interpretacao implícita em:

- `LGPD`
- `notification-preferences`
- `resident/devices`
- `sync/reconcile`
