# API V4.9 Integration

Data: 2026-04-13

## Leitura objetiva

A `V4.9` nao muda a direcao do `app-morador`, mas consolida melhor o estado dos contratos operacionais que ja estavamos absorvendo.

Os pontos mais relevantes confirmados nesta versao foram:

- `resident/profile` continua como fonte canonica do perfil do morador;
- `permissions-matrix` permanece como fonte primaria oficial;
- `effectiveAccess` continua publicado junto do usuario;
- `stream` manteve `eventType` e `occurredAt` como campos canonicos;
- `alerts/{id}/workflow` segue oficial com `workflowStatus`;
- `sync/reconcile` segue com `clientRequestId`, `syncStatus`, `retryable`, `isFinal` e `isApplied`.

## O que mudou na leitura do app

Na pratica, a `V4.9` serviu mais para confirmar o que ja estava valido do que para exigir refatoracao.

Ela reforca como oficiais:

- `eventType`
- `occurredAt`
- `permissions-matrix`
- `effectiveAccess`
- `clientRequestId`
- `syncStatus`
- `resident/profile`
- `workflowStatus` operacional de alertas

## Ponto novo observado

O contrato de `alerts` segue mais rico e estavel:

- `workflowStatus`
- `openedAt`
- `resolvedAt`
- `returnedToQueueAt`
- `location`

Isso confirma que a tela de alertas do morador pode continuar tratando `status de leitura` e `workflow operacional` como camadas diferentes.

## O que continua pendente para as novas acoes do morador

A `V4.9` ainda nao publicou de forma explicita:

- acao oficial de `panico` do morador;
- acao oficial de `entrada assistida` do morador;
- payload canonico dessas acoes;
- geografia oficial do condominio por API;
- contrato de rastreio da `entrada assistida` ate a chegada.

## Conclusao

Do lado do `app-morador`, a `V4.9` nao exigiu nova mudanca estrutural imediata.

Ela valida a base que ja aplicamos no codigo e mantem aberta, principalmente, a pendencia de contrato especifico para:

- `panico`
- `entrada assistida`
- rastreio de deslocamento
