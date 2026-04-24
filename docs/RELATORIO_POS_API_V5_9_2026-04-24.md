# Relatorio Pos API V5.9

Data da validacao: `24/04/2026`

Conta usada na validacao real:

- escopo: morador
- unidade ativa: `CASA 20`

Arquivo de referencia local:

- `api/API Sapinho V5.9.txt`

## Leitura objetiva do contrato

A `V5.9` nao trouxe rotas novas nem removeu rotas em comparacao com a `V5.7` no conjunto de endpoints que afetam o `App Morador`.

O ganho real da versao ficou concentrado em:

- enriquecimento do contrato efetivo de autenticacao e perfil;
- estabilidade observada em endpoints que antes oscilavam;
- manutencao do contrato corrigido de `resident/profile` e `resident/notification-preferences`.

## Validacao real de backend

### Resolvido ou estavel

- `POST /api/v1/auth/login`
  agora publica `token` e um objeto `user` rico, incluindo:
  - `phone`
  - `photoUrl`
  - `photoUri`
  - `faceStatus`
  - `unitId`
  - `unitIds`
  - `unitName`
  - `unitNames`
  - `selectedUnitId`
  - `selectedUnitName`

- `GET /api/v1/auth/me`
  - respondeu `200`
  - publicou `unitIds` e `unitNames`
  - publicou `phone` e `photoUri`

- `GET /api/v1/auth/stream-capabilities`
  - respondeu `200`
  - em teste repetido `5/5` permaneceu estavel

- `GET /api/v1/resident/profile`
  - respondeu `200`
  - publicou `phone`
  - publicou `photoUri`
  - publicou `faceStatus`

- `GET /api/v1/resident/notification-preferences`
  - respondeu `200`
  - deixou de reproduzir o `500` antigo

- `GET /api/v1/messages?unitId={unitId}`
  - respondeu `200`
  - historico retornou normalmente para a unidade da conta

### Sem evidencia suficiente para concluir melhoria nova

- `GET /api/v1/resident/deliveries`
  - respondeu `200`
  - a conta estava sem encomendas ativas no momento da validacao
  - por isso nao houve como revalidar imagem de encomenda nesta rodada

### Pendencia remanescente

- `GET /api/v1/cameras`
  - respondeu `200`
  - continua retornando lista vazia para a conta de morador validada

Leitura:

- o front do `App Morador` continua preparado para consumir cameras;
- a pendencia restante segue no backend/publicacao da camera no escopo do morador.

## Conclusao pos-V5.9

Para o `App Morador`, a `V5.9` representa melhora real principalmente em:

- `auth/login`
- `auth/me`
- `auth/stream-capabilities`
- `resident/profile`
- `resident/notification-preferences`

O principal ponto ainda nao resolvido para esta conta continua sendo:

- cameras nao publicadas para o morador em `GET /api/v1/cameras`

## Impacto no app

Nao foi identificado delta obrigatorio de codigo no `App Morador` apenas por leitura do contrato `V5.9`.

O impacto pratico desta versao e:

- reduzir necessidade de fallback defensivo em autenticacao e perfil;
- confirmar que a base atual do app continua compativel;
- manter cameras como pendencia externa ao front para esta conta.
