# Parecer Consolidado Pos API V4.5

Data de referencia: `2026-04-13`

Origem consolidada:

- `App Morador`
- `Portaria Web`
- `Guarita`

## Objetivo

Consolidar em um unico documento a leitura cruzada dos tres modulos apos a publicacao da `API Sapinho V4.5`, separando:

- o que ja convergiu;
- o que continua pendente;
- o que deve ser encaminhado ao `Backend` como arbitragem oficial.

## Leitura Executiva

A `V4.5` foi positiva para o ecossistema.

Ela reduziu adaptacoes locais em pontos relevantes, especialmente:

- `encomendas`;
- `resident notifications`;
- `events/stream`;
- continuidade do contrato de `faceStatus`.

Ao mesmo tempo, a `V4.5` ainda nao encerrou o trabalho de contrato.

O principal gap restante agora continua sendo o `Backend` transformar os avancos recentes em contrato arbitral unico para os tres modulos.

## Consenso Entre Os Tres Modulos

### 1. Encomendas evoluiram de forma real

Os tres modulos convergem que a `V4.5` melhorou bastante `deliveries`, com destaque para:

- `POST /api/v1/deliveries/{id}/renotify`;
- `withdrawalQrCodeUrl` no schema;
- maior riqueza de campos operacionais no contrato.

Leitura comum:

- o contrato ficou melhor;
- os fronts conseguiram absorver a parte util sem quebra;
- mas ainda falta arbitragem final de nomenclatura e semantica.

### 2. O stream melhorou, mas ainda nao ficou canonico

Os tres modulos convergem que a `V4.5` melhorou o schema do `events/stream` com:

- `eventType`
- `type`
- `occurredAt`
- `timestamp`
- `entityType`
- `entityId`
- `cameraId`
- `condominiumId`

Leitura comum:

- o schema ficou mais rico;
- mas o `Backend` ainda precisa declarar o que e campo canonico e o que e legado.

### 3. Permissoes continuam dependentes de arbitragem oficial

Os tres modulos convergem que:

- `GET /api/v1/auth/permissions-matrix` existe;
- mas ainda nao foi declarada como fonte primaria oficial de forma inequívoca;
- o ecossistema continua usando normalizacao local de aliases.

### 4. LGPD e preferencias ainda dependem de backend oficial

Os modulos convergem que:

- aceite versionado local ja existe;
- minimizacao local ja existe;
- mas ainda faltam rotas oficiais para:
  - aceite remoto;
  - sincronizacao de preferencias de notificacao;
  - governanca definitiva de push por categoria.

## Pontos Em Que Um Modulo Trouxe Valor Adicional

### Portaria Web

O `Portaria Web` trouxe com mais clareza:

- `escopo de sessao` como dependencia forte do backend;
- `moradores por unidade` como caminho oficial leve;
- `offline sync`, `idempotencia` e `reconciliacao`;
- destaque para `recipientPersonName` em encomendas.

### Guarita

O `Guarita` trouxe com mais clareza:

- semantica de `visitas previstas` na `V4.5`;
- peso operacional de `releaseMode`;
- necessidade de `visitForecastId` como identificador canonico;
- maior detalhamento de campos ricos de auditoria em encomendas;
- reforco forte de `alertas`, `cameras` e operacao em tempo real.

### App Morador

O `App Morador` trouxe com mais clareza:

- convergencia de `resident notifications` com o novo contrato;
- consumo pratico de `renotify` no fluxo do morador;
- necessidade de sincronizacao oficial de preferencias remotas de notificacao;
- foco em LGPD, aceite versionado e minimizacao.

## Inconsistencias Encontradas

Nao foi encontrada contradicao grave de direcao entre os tres documentos.

As inconsistencias observadas foram de enfase e acabamento, nao de conflito tecnico central.

### 1. Diferenca de profundidade

Alguns temas aparecem com pesos diferentes entre os modulos:

- `escopo de sessao`
- `moradores por unidade`
- `visitas previstas V4.5`
- `offline sync`

Isso nao gera conflito, mas indica que a pauta unica ao `Backend` deve absorver o melhor dos tres lados.

### 2. Diferenca de nomenclatura de arquivo

Os arquivos de pendencia pos-`V4.5` nao ficaram com o mesmo padrao entre os tres modulos.

Exemplo:

- `APP_MORADOR_PENDENCIAS_BACKEND_POS_API_V4_5_2026-04-13.md`
- `PORTARIA_WEB_PENDENCIAS_BACKEND_POS_API_V4_5_2026-04-13.md`
- `GUARITA_PENDENCIAS_BACKEND_ECOSSISTEMA_2026-04-13.md`

Isso nao compromete o conteudo, mas reduz uniformidade da pasta compartilhada.

## Pauta Consolidada Para O Backend

Com base na leitura cruzada, a pauta unificada mais forte fica assim:

### 1. Stream operacional

Fechar oficialmente:

- `type` x `eventType`
- `timestamp` x `occurredAt`
- campos obrigatorios por evento
- politica de legado dos aliases

### 2. Permissoes

Fechar oficialmente:

- status da `permissions-matrix`
- formato canonico de permissao
- aliases legados
- `scope`, `allowedClients` e `allowedProfiles`

### 3. Escopo de sessao

Fechar oficialmente:

- `scopeType`
- `condominiumIds`
- `unitIds`
- `selectedUnitId`
- `selectedUnitName`
- `requiresUnitSelection`

### 4. Encomendas

Fechar oficialmente:

- `withdrawalCode` x `pickupCode`
- `withdrawalQrCodeUrl` x `qrCodeUrl`
- tabela final de status
- semantica de `READY_FOR_WITHDRAWAL`
- `recipientPersonName`
- campos ricos de auditoria quando aplicavel

### 5. `deliveries/{id}/renotify`

Fechar oficialmente:

- quem pode usar
- limites de repeticao
- janela minima entre reenvios
- atualizacao obrigatoria de `notificationSentAt`
- auditoria oficial
- reflexo em `resident/notifications`

### 6. Moradores por unidade

Publicar caminho oficial e leve para:

- listar moradores por unidade;
- selecionar rapidamente destinatario em fluxos operacionais.

### 7. Visitas previstas V4.5

Fechar oficialmente:

- `visitForecastId` como identificador canonico;
- semantica de:
  - `PENDING_ARRIVAL`
  - `ARRIVED`
  - `EXPIRED`
  - `CANCELLED`
- papel de `releaseMode`

### 8. LGPD e aceite versionado

Publicar oficialmente:

- rota de leitura do aceite;
- rota de gravacao do aceite;
- shape minimo:
  - `accepted`
  - `version`
  - `acceptedAt`

### 9. Preferencias remotas de notificacao

Publicar oficialmente:

- shape por usuario;
- categoria/canal/som/prioridade;
- integracao com push e `resident notifications`.

### 10. Alertas, cameras e evidencia

Declarar oficialmente:

- `alertType`
- `alertSeverity`
- `alertStatus`
- `cameraId`
- `snapshotUrl`
- `replayUrl`
- prioridade oficial entre URLs de midia

### 11. Offline sync e reconciliacao

Fechar oficialmente:

- idempotencia;
- `clientRequestId` ou equivalente;
- endpoint de reconciliacao;
- replay seguro;
- classificacao oficial de erro temporario x definitivo.

## Conclusao

A leitura cruzada dos tres modulos mostra um ecossistema tecnicamente convergente.

O que resta agora nao e divergir em frontend.

O que resta agora e o `Backend` arbitrar oficialmente os pontos que continuam ambíguos, para que `App Morador`, `Portaria Web` e `Guarita` possam reduzir fallback local e operar em cima de contrato unico.
