# Integração da API v4.0

Este resumo registra o que já foi ajustado no app morador após a chegada da `API Sapinho V4.0`.

## O que já foi ligado no app

### Perfil do morador

O app agora já usa:

```text
GET /api/v1/resident/profile
PUT /api/v1/resident/profile
```

Pontos implementados:

- nova camada em [residentProfile.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/residentProfile.ts);
- tela [edit.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/profile/edit.tsx) pronta para consultar e salvar perfil;
- `refreshMe()` em [useAuth.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/hooks/useAuth.tsx) tenta primeiro `resident/profile` e cai para `auth/me` se necessário.

### Notificações do morador

O app agora já usa:

```text
PATCH /api/v1/resident/notifications/read-all
```

Pontos implementados:

- `markAllAsRead()` em [residentNotifications.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/residentNotifications.ts);
- botão de marcar lidas em [resident-notifications.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/profile/resident-notifications.tsx) agora tenta o endpoint novo;
- se o ambiente ainda não estiver atualizado, há fallback para marcação individual.

### Devices do morador

O app já está preparado para:

```text
POST /api/v1/resident/devices
```

Implementado em:

- [deviceRegistration.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/deviceRegistration.ts)
- [_layout.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/_layout.tsx)

Fluxo atual:

- após login com token válido e unidade ativa, o app tenta registrar o device;
- enquanto o endpoint não estiver realmente liberado em produção, falhas `403`, `404` e `405` não derrubam o app.

### Veículos

O app já está alinhado com o contrato v4.0:

```text
GET /api/v1/vehicles
POST /api/v1/vehicles
PUT /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}
```

Implementado em:

- [vehicles.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/vehicles.ts)
- [vehicles.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/people/vehicles.tsx)

## Ajustes de UX feitos junto com a integração

- aba [profile.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/(tabs)/profile.tsx) reescrita e limpa;
- detalhe de encomenda em [[id].tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/deliveries/[id].tsx) refeito com textos mais humanos;
- detalhe de pessoa em [view-person.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/people/view-person.tsx) refeito com foco em status, validade e resumo de acesso.

## O que ainda depende do backend

Mesmo com a v4.0 publicada no contrato, ainda dependemos de confirmação em produção para:

- permissões reais de `MORADOR` em `resident/profile`, `resident/devices`, `vehicles` e `people/{id}/access-summary`;
- push real;
- payload oficial das notificações;
- agenda estruturada de prestador;
- recuperação de senha;
- confirmação do `events/stream`.

Ver também:

- [backend-pending-requirements.md](/C:/Users/Pc Rafa/Desktop/app-morador/docs/backend-pending-requirements.md)
- [proxima-api-checklist.md](/C:/Users/Pc Rafa/Desktop/app-morador/docs/proxima-api-checklist.md)
