# Pedido Detalhado Ao Backend Pos API V4.6

Data de referencia: `2026-04-13`

Documento consolidado a partir da leitura cruzada entre:

- `App Morador`
- `Portaria Web`
- `Guarita`
- `API Sapinho V4.6`

## Leitura Executiva

A `V4.6` trouxe avancos reais e utilizaveis:

- `resident/lgpd-consent`
- `resident/notification-preferences`
- `people/unit-residents`
- `internal/sync/reconcile/{client_request_id}`
- enriquecimento do `events/stream`

Mesmo assim, os tres fronts ainda precisam compensar ausencia de arbitragem oficial em varios pontos. Este documento pede fechamento objetivo do que ainda esta aberto para que o ecossistema passe a operar por contrato unico, e nao por compatibilidade local.

## Como Responder

Para cada item abaixo, responder marcando:

- `vigente`
- `alvo`
- `legado temporario`
- `nao sera adotado`

Quando existir mais de um campo, endpoint ou semantica possivel, informar explicitamente:

- nome canonico;
- aliases aceitos temporariamente;
- condicao de deprecacao;
- impacto por modulo.

## Itens Que Precisam De Fechamento

### 1. Stream operacional

Hoje a `V4.6` ainda preserva:

- `type`
- `eventType`
- `timestamp`
- `occurredAt`
- `eventTime`

Pedido ao backend:

- definir qual campo e canonico para `tipo do evento`;
- definir qual campo e canonico para `tempo do evento`;
- declarar quais campos permanecem apenas como legado;
- publicar obrigatoriedade minima por evento, especialmente:
  - `eventType`
  - `occurredAt`
  - `entityType`
  - `entityId`
  - `unitId`
  - `cameraId`
- esclarecer uso de:
  - `snapshotUrl`
  - `liveUrl`
  - `replayUrl`
  - `replayAvailable`
  - `secondsBefore`
  - `secondsAfter`

Impacto atual:

- `App Morador` usa leitura defensiva;
- `Guarita` e `Portaria Web` dependem disso para operacao em tempo real e evidencia;
- o ecossistema ainda nao consegue assumir um shape unico sem fallback.

### 2. Notification preferences do morador

A `V4.6` publicou `GET/PUT /api/v1/resident/notification-preferences`, mas o shape atual ainda esta restrito a:

- `channel`
- `priority`

Pedido ao backend:

- publicar enumeracoes oficiais e fechadas para `channel`;
- publicar enumeracoes oficiais e fechadas para `priority`;
- definir a semantica pratica de:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
- esclarecer se a preferencia remota:
  - vale por conta;
  - vale por unidade ativa;
  - vale por dispositivo;
  - altera apenas canal;
  - ou altera tambem relevancia/urgencia.
- esclarecer se havera evolucao futura para:
  - `domain`
  - `category`
  - preferencia por tipo de evento

Impacto atual:

- `App Morador` ja sincroniza a preferencia remota global, mas continua mantendo sons por categoria no aparelho;
- `Portaria Web` tambem absorveu a rota e reforcou a necessidade de enums oficiais;
- sem esse fechamento, cada modulo pode interpretar `channel` e `priority` de forma ligeiramente diferente.

### 3. Consentimento LGPD por dispositivo

A `V4.6` publicou `GET/PUT /api/v1/resident/lgpd-consent` com:

- `accepted`
- `version`
- `acceptedAt`
- `accountId`
- `userId`
- `deviceId`

Pedido ao backend:

- declarar a versao legal canonica do ecossistema;
- definir o que acontece quando a versao muda;
- definir se aceite antigo perde validade automaticamente;
- definir se existe revogacao formal;
- definir a relacao entre:
  - aceite no `App Morador`
  - aceite no `Portaria Web`
  - eventual aceite no `Guarita`
- explicar o papel oficial do `deviceId`:
  - apenas auditoria;
  - aceite por aparelho;
  - multissessao;
  - reconciliacao entre dispositivos.
- confirmar se havera consulta historica de aceite ou somente estado atual.

Impacto atual:

- os tres fronts convergiram em `aceite versionado`;
- o contrato tecnico existe;
- ainda falta governanca oficial para conformidade forte.

### 4. Moradores por unidade

A `V4.6` publicou `GET /api/v1/people/unit-residents`.

Pedido ao backend:

- confirmar se este sera o caminho canonico para lista enxuta de moradores da unidade;
- confirmar se o retorno oficial e intencionalmente:
  - `id`
  - `name`
  - `unitId`
  - `unitName`
- esclarecer se havera campos adicionais controlados por perfil;
- confirmar se o endpoint respeita integralmente:
  - unidade ativa do escopo atual;
  - permissao do usuario;
  - perfis diferentes entre `App Morador`, `Portaria Web` e `Guarita`;
- confirmar estabilidade operacional do endpoint.

Impacto atual:

- `Portaria Web` e `Guarita` ja estao usando esse endpoint para reduzir erro operacional;
- `App Morador` passou a usar para mostrar quantidade e amostra de moradores da unidade ativa;
- ainda falta o backend declarar se isso ja pode ser tratado como contrato estavel.

### 5. Reconciliacao offline e sync

A `V4.6` publicou `GET /api/v1/internal/sync/reconcile/{client_request_id}` com campos como:

- `found`
- `clientRequestId`
- `aggregateType`
- `aggregateId`
- `eventType`
- `syncStatus`
- `retryable`
- `errorType`
- `errorMessage`
- `originNodeId`
- `sourceUpdatedAt`

Pedido ao backend:

- definir a semantica oficial de `found`;
- definir quando um item reconciliado pode ser considerado confiavel no front;
- publicar tabela oficial de `syncStatus`;
- publicar regra oficial de `retryable`;
- separar erro temporario de erro definitivo;
- explicar o uso e ciclo de vida do `X-Sync-Token`;
- declarar quais agregados participam oficialmente da reconciliacao, alem de encomendas;
- esclarecer se `clientRequestId` sera o identificador canonico de idempotencia no ecossistema.

Impacto atual:

- `Portaria Web` puxou esse ponto com mais forca;
- `Guarita` tambem considera isso prioritario;
- `App Morador` formalizou a camada tecnica, mas ainda nao ativou fluxo operacional novo enquanto essa arbitragem nao vier.

### 6. Encomendas

A `V4.5` e a `V4.6` melhoraram esse contrato, mas ainda faltam fechamentos importantes.

Pedido ao backend:

- confirmar nome canonico entre:
  - `pickupCode`
  - `withdrawalCode`
- confirmar nome canonico entre:
  - `qrCodeUrl`
  - `withdrawalQrCodeUrl`
- confirmar publicacao consistente de:
  - `recipientPersonName`
  - `recipientUnitName`
  - `clientRequestId`
  - `performedAt`
  - `clientType`
  - `deviceName`
  - `evidenceUrl`
- confirmar tabela final de status;
- esclarecer governanca de `POST /api/v1/deliveries/{id}/renotify`:
  - quem pode usar;
  - quando pode usar;
  - se atualiza `notificationSentAt`;
  - se existe limite;
  - se existe antifraude ou bloqueio por status.

Impacto atual:

- os tres fronts ja absorveram parte relevante da melhoria;
- mas ainda existem pontos em que a leitura depende de compatibilidade local.

### 7. Visitas previstas

Pedido ao backend:

- confirmar oficialmente a semantica de:
  - `PENDING_ARRIVAL`
  - `ARRIVED`
  - `EXPIRED`
  - `CANCELLED`
- confirmar se `EXPIRED` substitui de vez o fechamento antigo tratado como `COMPLETED`;
- confirmar como o ecossistema deve tratar historico antigo com `NO_SHOW`;
- confirmar `visitForecastId` como identificador canonico obrigatorio;
- confirmar o papel de `releaseMode` na operacao e na exibicao.

Impacto atual:

- `Guarita` puxou isso com mais profundidade;
- `App Morador` ja ajustou tela e servicos para a nova semantica;
- o fechamento oficial ainda depende do backend.

### 8. Permissoes e matriz

Pedido ao backend:

- declarar se `GET /api/v1/auth/permissions-matrix` passa a ser a fonte primaria de permissao por acao;
- fechar formato canonico unico de permissao;
- declarar o papel de:
  - `permissions` no `login`
  - `permissions` no `auth/me`
  - `permissions-matrix`
- confirmar se `allowedClients`, `allowedProfiles` e `scope` faram parte do contrato estavel.

Impacto atual:

- o tema continua aberto desde antes da `V4.6`;
- `Guarita` reforcou que isso ainda precisa de arbitragem oficial.

### 9. Escopo de sessao

Pedido ao backend:

- confirmar contrato oficial de:
  - `scopeType`
  - `condominiumIds`
  - `unitIds`
  - `selectedUnitId`
  - `selectedUnitName`
  - `requiresUnitSelection`
- definir fluxo backend para selecao de unidade quando o usuario tiver varias unidades.

Impacto atual:

- o ecossistema inteiro usa esse conceito;
- ainda falta o backend registrar o contrato final sem ambiguidade.

### 10. Alertas operacionais e persistencia

Pedido ao backend:

- fechar contrato oficial de:
  - `alertType`
  - `alertSeverity`
  - `alertStatus`
- esclarecer se alerta operacional sera derivado de acesso negado ou se havera entidade propria;
- declarar se a triagem operacional sera persistida no backend;
- caso sim, publicar:
  - hora de abertura
  - hora de resolucao
  - quem abriu
  - quem resolveu
  - retorno para fila
  - observacao operacional

Impacto atual:

- `Portaria Web` puxou essa pendencia com mais forca;
- `Guarita` tambem depende disso na operacao;
- o `App Morador` consome alertas, mas nao e o modulo que arbitra o fluxo.

### 11. Cameras e evidencia

Pedido ao backend:

- fechar contrato oficial de:
  - `cameraId`
  - `snapshotUrl`
  - `liveUrl`
  - `hlsUrl`
  - `webRtcUrl`
  - `imageStreamUrl`
  - `mjpegUrl`
  - `thumbnailUrl`
- confirmar ordem oficial de prioridade de midia;
- confirmar expiracao e autenticacao das URLs.

Impacto atual:

- a `V4.6` melhorou o stream;
- ainda falta a politica oficial de evidencia e fallback entre midias.

## Ordem Sugerida De Resposta

1. `stream`
2. `notification-preferences`
3. `LGPD por dispositivo`
4. `sync/reconcile`
5. `unit-residents`
6. `encomendas`
7. `visitas previstas`
8. `permissoes`
9. `escopo de sessao`
10. `alertas`
11. `cameras e evidencia`
