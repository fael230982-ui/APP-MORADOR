# Decisoes Pendentes Do Ecossistema

Data de referencia: `2026-04-12`

## Objetivo

Este documento resume apenas as decisoes que ainda precisam de resposta objetiva do `Backend`, `Portaria Web` e `Guarita`.

Ele deve ser lido como lista curta de fechamento.

## Decisoes Pendentes

### 1. Formato canonico de permissoes

Situacao atual:

- aparecem formatos mistos como `people.view`, `alerts.view`, `deliveries:create` e `cameras:read`.

Decisao necessaria:

- qual formato sera o padrao oficial unico para permissao por acao.

Saida esperada:

- um formato canonico oficial;
- lista de aliases legados permitidos temporariamente;
- prazo de descontinuacao dos aliases.

### 2. Status da `permissions-matrix`

Situacao atual:

- a rota existe;
- mas ainda nao ha definicao unica se ela e apoio, fallback ou fonte primaria.

Decisao necessaria:

- declarar se `GET /api/v1/auth/permissions-matrix` ja e fonte oficial primaria ou se ainda esta em fase de transicao.

Saida esperada:

- um status claro:
  - `experimental`
  - `fallback`
  - `fonte primaria`

### 3. Contrato canonico do stream

Situacao atual:

- os materiais ainda misturam `type` com `eventType` e `timestamp` com `occurredAt`.

Decisao necessaria:

- definir qual nome e canonico para tipo do evento;
- definir qual nome e canonico para data/hora do evento;
- definir se os nomes antigos seguem como legado temporario.

Saida esperada:

- tabela oficial minima do evento;
- politica de legado para campos antigos;
- orientacao unica para os tres fronts.

### 4. Identificador canonico de visita

Situacao atual:

- ainda aparece ambiguidade entre `visitId` e `visitForecastId`.

Decisao necessaria:

- definir um unico identificador canonico oficial para o conceito de visita prevista.

Saida esperada:

- um nome unico por conceito;
- alias legados apenas se realmente necessarios.

### 5. Nomenclatura final de encomendas

Situacao atual:

- continuam abertos `pickupCode` x `withdrawalCode`;
- `qrCodeUrl` x `withdrawalQrCodeUrl`;
- e `READY_FOR_WITHDRAWAL` como alvo ou contrato oficial.

Decisao necessaria:

- declarar a nomenclatura vigente final;
- declarar o que ainda e apenas alvo de convergencia.

Saida esperada:

- nomes finais oficiais;
- status finais oficiais;
- politica de migracao.

### 6. Publicacao estavel de `faceStatus`

Situacao atual:

- a `V4.4` oficializou `faceStatus`;
- mas ainda falta declarar em quais rotas ele sera publicado de forma estavel.

Decisao necessaria:

- confirmar onde `faceStatus`, `faceUpdatedAt` e `faceErrorMessage` serao obrigatorios.

Saida esperada:

- lista oficial de rotas que publicam esses campos;
- regra de coexistencia com campos legados como `hasFacialCredential`.

### 7. Contrato oficial de alertas e cameras

Situacao atual:

- os fronts ja usam fallback defensivo;
- mas ainda falta tabela oficial unica para `alertType`, `alertSeverity`, `alertStatus`, `cameraId` e `snapshotUrl`.

Decisao necessaria:

- declarar o contrato oficial de alertas e evidencia.

Saida esperada:

- shape minimo oficial;
- obrigatoriedade por contexto;
- consistencia entre alerta, evento e access log.

## Ordem Recomendada De Fechamento

1. permissoes
2. stream
3. visitas
4. encomendas
5. facial
6. alertas e cameras

## Observacao Final

O ecossistema ja tem boa convergencia de direcao.

O que falta agora e menos implementacao local e mais decisao oficial compartilhada.
