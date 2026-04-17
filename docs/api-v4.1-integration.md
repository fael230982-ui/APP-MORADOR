# Integracao da API v4.1

Este resumo registra o que mudou no app morador depois da analise da `API Sapinho V4.1`.

## O que a v4.1 acrescentou de relevante para o app morador

O principal ganho novo da v4.1 foi a recuperacao de senha:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Tambem confirmei no contrato que `resident/devices` aceita campos uteis para o app:

```text
POST /api/v1/resident/devices
```

Campos identificados:

- `pushToken`
- `platform`
- `deviceId`
- `deviceName`
- `appVersion`
- `unitId`

## O que ja foi ligado no app

### Recuperacao de senha

O app agora ja usa:

```text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Pontos implementados:

- servico novo em [passwordRecovery.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/passwordRecovery.ts);
- botao `Esqueci minha senha` em [login.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/login.tsx) agora abre o fluxo real;
- tela [index.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/first-access/index.tsx) agora solicita o e-mail e pede o envio do token;
- tela [reset-password.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/first-access/reset-password.tsx) agora redefine a senha com `token + nova senha`;
- tela [success.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/first-access/success.tsx) foi ajustada para o contexto de recuperacao.

### Devices do morador

O contrato v4.1 confirma que o app pode continuar enviando dados mais completos do aparelho em:

- [deviceRegistration.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/deviceRegistration.ts)

Nao foi necessario mudar o payload principal do app nessa parte.

## O que continua valido da v4.0

Continuam integrados no app:

- `resident/profile`
- `resident/notifications/read-all`
- `resident/devices`
- `vehicles`

Ver tambem:

- [api-v4.0-integration.md](/C:/Users/Pc Rafa/Desktop/app-morador/docs/api-v4.0-integration.md)
- [backend-pending-requirements.md](/C:/Users/Pc Rafa/Desktop/app-morador/docs/backend-pending-requirements.md)

## O que ainda depende do backend

Mesmo com a v4.1, ainda dependemos de confirmacao funcional em producao para:

- permissoes reais de `MORADOR`;
- push real e payload oficial das notificacoes;
- `events/stream`;
- agenda estruturada de prestador;
- comportamento real do token de recuperacao:
  - como o token chega ao morador;
  - validade do token;
  - resposta para token expirado ou invalido.
