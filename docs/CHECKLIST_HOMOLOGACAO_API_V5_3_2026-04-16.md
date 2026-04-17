# Checklist De Homologacao API V5.3

Data: `2026-04-16`

## Foco

Validar no `App Morador` o que a `V5.3` trouxe de relevante sem misturar isso com backlog antigo.

## 1. Resident Condominium

- autenticar com conta real de `MORADOR`;
- confirmar resposta de `GET /api/v1/resident/condominium`;
- validar presenca e coerencia de:
  - `id`
  - `name`
  - `enabledModules`
  - `residentManagementSettings`
  - `slimMode`
- conferir se a navegacao por abas e a tela inicial respeitam esses campos;
- confirmar que ambientes sem permissao retornam degradacao segura no app.

## 2. Consulta Canonica Por CPF

- abrir o formulario de `Autorizar acesso`;
- testar `GET /api/v1/resident/people/by-cpf` com CPF valido e retorno existente;
- validar preenchimento automatico de `nome` e `birthDate`;
- testar CPF valido sem retorno;
- testar CPF fora de escopo ou sem permissao;
- confirmar que o app nao quebra e mantem fallback manual.

## 3. Pessoas E Status

- listar pessoas com casos em `ACTIVE`, `INACTIVE`, `EXPIRED` e `BLOCKED`, se existirem no ambiente;
- confirmar que o front nao quebra ao receber `BLOCKED`;
- validar retorno de `faceStatus`, `hasFacialCredential`, `faceUpdatedAt` e `faceErrorMessage` quando presentes.

## 4. Reconhecimento Facial Reverso

- autenticar com perfil que tenha permissao operacional real;
- testar `POST /api/v1/operation/people/search-by-photo` com `photoBase64`;
- repetir com foto sem correspondencia clara;
- validar:
  - `matched`
  - `matchStrategy`
  - `capturedPhotoUrl`
  - `matches[].confidence`
  - `matches[].person.id`
  - `matches[].person.name`
  - `matches[].person.faceStatus`
  - `matches[].person.hasFacialCredential`
  - `matches[].residentUnit`
  - `matches[].activeVisitForecasts`
  - `matches[].possibleDestination`
- confirmar comportamento com `maxMatches = 1`, `3` e `5`;
- confirmar se `cameraId` altera algo quando enviado.

## 5. Auditoria Da Busca Por Foto

- consultar `GET /api/v1/operation/people/search-by-photo/audit`;
- validar filtros por:
  - `matched`
  - `actorUserId`
  - `sourceType`
  - periodo `from/to`
- conferir se cada busca gera trilha com:
  - `createdAt`
  - `actorUserName`
  - `capturedPhotoUrl`
  - `matchStrategy`
  - `matchCount`
  - `matches`

## 6. Ponto Critico A Confirmar

Validar explicitamente se a busca por foto:

- apenas identifica pessoas; ou
- tambem registra acesso automaticamente.

Hoje, pela leitura do contrato `V5.3`, a expectativa correta e:

- `search-by-photo` identifica;
- o registro de acesso precisa de outro fechamento operacional do backend.

## 7. Resultado Esperado

Se tudo estiver aderente, a `V5.3` fica validada como:

- oficial para `resident/condominium`;
- oficial para `resident/people/by-cpf`;
- pronta para `identificacao reversa por foto`;
- ainda incompleta para emular um `leitor facial` fim a fim.
