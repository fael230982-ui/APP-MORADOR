# Checklist De Homologacao Front x Backend

Data: `2026-04-15`

## Objetivo

Registrar uma pauta curta e objetiva para validar, em ambiente real, os contratos que deixaram de ser lacuna estrutural e passaram a ser integracao/homologacao.

## 1. Perfil E Configuracao Canonica

- login com conta valida e confirmacao de carga de `resident/profile`;
- refresh da conta confirmando que o app continua preso a `resident/profile`;
- carga de `resident/condominium`;
- validacao de:
  - `enabledModules`
  - `residentManagementSettings`
  - `slimMode`

## 2. LGPD

- leitura de `resident/lgpd-policy`;
- leitura de `resident/lgpd-consent` com `deviceId`;
- persistencia de aceite em `resident/lgpd-consent`;
- leitura de historico em `resident/lgpd-consent/history`;
- confirmacao de versao vigente e retorno de auditoria.

## 3. CPF E Menor

- consulta de `resident/people/by-cpf` com:
  - CPF valido com retorno
  - CPF valido sem retorno
  - CPF fora de escopo
- confirmacao de preenchimento de:
  - `fullName`
  - `birthDate`
- validacao do calculo de idade no front.

## 4. Facial De Menor

- cadastro de pessoa maior sem `minorFacialAuthorization`;
- cadastro de menor sem autorizacao;
- cadastro de menor com autorizacao;
- confirmacao do payload enviado pelo front:
  - `authorized`
  - `guardianName`
  - `guardianDocument`
  - `relationship`
  - `authorizationSource`
  - `authorizedAt`
- confirmacao de bloqueio do facial quando a autorizacao nao existir.

## 5. Tempo Real E Capacidades

- leitura de `stream-capabilities`;
- leitura de `sync-capabilities`;
- confirmacao do estado local:
  - `prepared` apenas quando o contrato operacional estiver pronto;
  - `degraded` quando faltar capability relevante.

## 6. Observabilidade Local

- verificar se falhas criticas aparecem no diagnostico local:
  - login
  - `resident/profile`
  - `resident/condominium`
  - CPF
  - LGPD
  - capabilities

## Conclusao Esperada

Se esta checklist passar, o residual deixa de ser contrato e passa a ser:

- bug concreto;
- ajuste fino de UX;
- ou melhoria heuristica.
