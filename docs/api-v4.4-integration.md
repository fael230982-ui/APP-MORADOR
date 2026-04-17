# Integracao da API v4.4

Data de referencia: `2026-04-12`

Arquivo analisado:

- `api/API Sapinho V4.4.txt`

Base de comparacao:

- `api/API Sapinho V4.3.txt`

## Resumo Executivo

A `V4.4` nao traz ruptura grande para o `app-morador`, mas traz tres novidades importantes para o ecossistema:

1. publica uma rota oficial de matriz de permissoes;
2. formaliza melhor o stream de eventos operacionais com confirmacao de conexao;
3. oficializa um `faceStatus` do backend, o que impacta diretamente o contrato de facial do ecossistema.

Para o `app-morador`, o impacto imediato de codigo e baixo.

O impacto principal desta versao e de contrato e governanca.

## O Que Mudou Da V4.3 Para A V4.4

### 1. Novo endpoint de matriz de permissoes

Novo endpoint:

- `GET /api/v1/auth/permissions-matrix`

Leitura:

- agora existe uma rota oficial para consultar matriz de permissao por papel;
- isso fortalece a direcao do contrato do ecossistema;
- mas o schema ainda e simples: `role` + lista de `permissions`.

Impacto:

- bom para `backend`, `portaria` e `guarita`;
- no `app-morador`, ainda nao exige mudanca imediata;
- no futuro, pode substituir parte das regras locais de permissao mantidas no front.

### 2. Novo endpoint interno de sync

Novo endpoint:

- `POST /api/v1/internal/sync/events`

Leitura:

- endpoint voltado a integracao interna e sincronizacao;
- nao parece ser rota de consumo direto do `app-morador`.

Impacto:

- relevancia maior para backend e processos internos;
- sem impacto imediato no app.

### 3. Stream operacional segue e agora esta melhor formalizado

Rotas relevantes:

- `GET /api/v1/events/stream`
- `POST /api/v1/events/stream/confirm`

Leitura:

- o stream SSE continua presente;
- a `V4.4` detalha melhor o schema do evento;
- a confirmacao de conexao agora tem request/response tipados.

Schema principal do evento:

- `eventId`
- `type`
- `occurredAt`
- `unitId`
- `entityId`
- `title`
- `body`
- `payload`
- `timestamp`

Impacto:

- isso valida a direcao que ja estavamos tratando como governanca de eventos;
- ainda e mais util para `portaria` e `guarita` do que para o `app-morador`;
- mesmo assim, confirma que vale manter o `residentRealtimeService` como infraestrutura preparada.

### 4. Face status agora esta oficial no backend

Schema novo relevante:

- `PublicFaceStatus`

Valores oficiais publicados na `V4.4`:

- `NO_PHOTO`
- `PHOTO_ONLY`
- `FACE_PENDING_SYNC`
- `FACE_SYNCED`
- `FACE_ERROR`

Leitura:

- esta e a maior novidade contratual da `V4.4`;
- antes, no nosso material interno, o facial ainda estava em fase de proposta de padrao;
- agora o backend oficializou sua propria tabela.

Impacto:

- os documentos do ecossistema precisam respeitar essa tabela como contrato oficial;
- os fronts podem manter uma leitura simplificada local, mas nao devem mais tratar outro conjunto como contrato oficial publicado;
- o `app-morador` foi preparado para reconhecer esse contrato e mapear para estados locais simplificados.

### 5. Encomendas nao fecharam ainda a convergencia que queriamos

Na `V4.4`, continuam aparecendo no schema:

- `pickupCode`
- `withdrawalCode`
- `qrCodeUrl`

E nao apareceu como contrato oficial:

- `withdrawalQrCodeUrl`
- `READY_FOR_WITHDRAWAL`

Leitura:

- a `V4.4` confirma que o backend ainda nao fechou a convergencia final de nomenclatura de encomenda;
- entao o `app-morador` deve continuar mantendo compatibilidade com os nomes legados.

Impacto:

- nenhum motivo para remover compatibilidade agora;
- o contrato alvo de encomendas continua sendo objetivo de convergencia, nao estado vigente do backend.

## O Que Continua Igual E Relevante Para O App Morador

Rotas que seguem importantes e continuam coerentes:

- `GET /api/v1/auth/me`
- `GET /api/v1/resident/deliveries`
- `GET /api/v1/resident/notifications`
- `PATCH /api/v1/resident/notifications/{id}/read`
- `PATCH /api/v1/resident/notifications/read-all`
- `GET /api/v1/messages`
- `POST /api/v1/messages`
- `PATCH /api/v1/messages/{id}/read`
- `GET /api/v1/cameras`
- `GET /api/v1/cameras/{id}/streaming`
- `GET /api/v1/alerts`
- `PATCH /api/v1/alerts/{id}/status`
- `GET /api/v1/operation/units`

## Impacto Pratico No App Morador

### Sem necessidade imediata de nova tela

A `V4.4` nao exigiu:

- nova navegacao;
- novo modulo visual;
- mudanca urgente de fluxo de morador.

### Ajustes de contrato ja absorvidos ou preparados

Ja foi absorvido/preparado no repo:

- reconhecimento do `faceStatus` oficial da `V4.4`;
- sincronizacao do `faceStatus` de perfil/auth para o estado local usado pelas telas;
- ajuste do fluxo local de foto para nao afirmar `sincronizada` antes do backend devolver o estado oficial;
- manutencao de compatibilidade com `pickupCode` e `qrCodeUrl`;
- manutencao da infraestrutura pronta para tempo real;
- servico preparado para `GET /api/v1/auth/permissions-matrix`;
- continuidade da separacao entre `message`, `notification` e `alert`.

## O Que Eu Recomendo Apos A V4.4

### Para o app-morador

- manter a compatibilidade de encomendas como esta;
- comecar a tratar `PublicFaceStatus` como referencia oficial quando o backend passar a devolver esse campo nos payloads efetivamente consumidos pelo app;
- nao migrar para `permissions-matrix` ainda sem confirmar como o backend quer que os fronts consumam isso em producao.

### Para o ecossistema

- atualizar o contrato e os documentos mestres para refletir o `PublicFaceStatus` oficial;
- manter como pendencia aberta a convergencia final de nomenclatura de encomendas;
- avaliar se `permissions-matrix` vai virar contrato operacional real para os tres canais;
- avaliar se o stream SSE e a confirmacao de conexao devem ser adotados de forma forte no `portaria` e no `guarita` antes do `app-morador`.

## Conclusao

A `V4.4` e uma versao mais importante para governanca do que para interface do `app-morador`.

Ela nao obriga uma refacao do app agora.

Mas ela faz duas coisas relevantes:

- oficializa o contrato de `faceStatus` do backend;
- e comeca a dar forma mais oficial para permissao e eventos em tempo real.

Hoje, o principal efeito pratico da `V4.4` para este repo e:

- manter compatibilidade em encomendas;
- respeitar o `faceStatus` oficial;
- e seguir preparado para uma futura consolidacao de permissao e stream.
