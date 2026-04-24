# Relatorio Unico de Validacao App Morador x Backend

Data da validacao: 24/04/2026  
Ambiente: `https://sapinhoprod.v8seguranca.com.br/api/v1`  
Perfil testado: morador real de homologacao/producao  
Unidade identificada: `CASA 20`  
Escopo: validacao funcional de leitura dos endpoints usados pelo `App Morador`, sem disparar operacoes destrutivas como envio de mensagem, marcacao de leitura, cadastro, exclusao ou alteracao deliberada de dados.

## Resumo Executivo

- O backend esta autenticando corretamente o morador e publicando o contexto principal de unidade.
- A maior parte dos endpoints de leitura usados pelo `App Morador` respondeu com `200`.
- Existe uma divergencia importante no perfil canonico do morador:
  - `GET /api/v1/resident/profile` nao publica `phone`
  - `GET /api/v1/resident/profile` nao publica `photoUrl` nem `photoUri`
  - mas `GET /api/v1/people/{id}` publica `phone`
- Isso confirma a origem do bug observado no app:
  - telefone reaparecendo como `Nao informado`
  - foto do perfil nao se sustentando apenas com o refresh do perfil canonico
- Existe ao menos uma falha real de backend em endpoint usado pelo app:
  - `GET /api/v1/resident/notification-preferences` retornou `500 Internal Server Error`
- Alguns `400` vistos em chamadas diretas nao eram defeito do backend; eram endpoints que exigem query params que o app ja envia corretamente, como `deviceId` e `unitId`.

## Contexto Real Confirmado

### Login e contexto do morador

`POST /api/v1/auth/login`
- `200`
- morador autenticado corretamente
- unidade ativa publicada: `CASA 20`
- `scopeType`: `RESIDENT`

`GET /api/v1/auth/me`
- `200`
- contexto de unidade e permissoes consistente com o login

### Perfil canonico do morador

`GET /api/v1/resident/profile`
- `200`
- `profileSource`: `CANONICAL_RESIDENT_PROFILE`
- campos publicados:
  - `id`
  - `name`
  - `email`
  - `personId`
  - `unitId`
  - `unitName`
  - `permissions`
  - `scopeType`
- campos relevantes ausentes:
  - `phone`
  - `photoUrl`
  - `photoUri`
  - `faceStatus`

### Pessoa vinculada ao morador

`GET /api/v1/people/{id}`
- `200`
- mesma pessoa do morador encontrada no backend operacional
- campos relevantes publicados:
  - `phone: 1399202099`
  - `photoUrl: null`
  - `faceStatus: NO_PHOTO`
  - `category: RESIDENT`

Conclusao objetiva:
- o backend operacional de pessoas conhece mais dados do morador do que o perfil canonico do app
- hoje existe inconsistência entre `resident/profile` e `people/{id}`

## Endpoints Validados

### OK em formato compativel com o app

- `POST /api/v1/auth/login` -> `200`
- `GET /api/v1/auth/me` -> `200`
- `GET /api/v1/resident/profile` -> `200`
- `GET /api/v1/resident/condominium` -> `200`
- `GET /api/v1/auth/permissions-matrix` -> `200`
- `GET /api/v1/auth/stream-capabilities` -> `200`
- `GET /api/v1/auth/sync-capabilities` -> `200`
- `GET /api/v1/resident/lgpd-policy` -> `200`
- `GET /api/v1/resident/lgpd-consent?deviceId=...` -> `200`
- `GET /api/v1/resident/lgpd-consent/history?deviceId=...` -> `200`
- `GET /api/v1/resident/notifications?limit=10` -> `200`
- `GET /api/v1/messages?unitId={unitId}&limit=10` -> `200`
- `GET /api/v1/alerts?limit=10` -> `200`
- `GET /api/v1/cameras` -> `200`
- `GET /api/v1/deliveries?limit=10` -> `200`
- `GET /api/v1/resident/deliveries?limit=10` -> `200`
- `GET /api/v1/people?limit=10` -> `200`
- `GET /api/v1/people/unit-residents?unitId={unitId}` -> `200`
- `GET /api/v1/visit-forecasts?limit=10` -> `200`
- `GET /api/v1/vehicles?limit=10` -> `200`
- `GET /api/v1/resident/live-incidents/active` -> `200`
- `GET /api/v1/resident/live-incidents/history?limit=10` -> `200`
- `GET /api/v1/alerts/{id}` -> `200`
- `GET /api/v1/cameras/{id}/streaming` -> `200`
- `GET /api/v1/people/{id}/access-summary` -> `200`

### OK, mas com observacoes de produto ou configuracao

- `GET /api/v1/resident/arrival-monitoring/geo-fence` -> `409`
  - mensagem: `Condominio sem coordenadas configuradas para aviso de chegada`
  - leitura: endpoint existe e respondeu corretamente
  - impacto: recurso depende de configuracao geografica do condominio

- `GET /api/v1/resident/people/by-cpf?cpf=12345678909` -> `404`
  - mensagem: `Pessoa não encontrada`
  - leitura: endpoint existe; o CPF de teste consultado nao existe

- `GET /api/v1/actions` -> `403`
  - mensagem: `Permissão negada`
  - leitura: coerente com perfil morador; nao parece defeito

- `GET /api/v1/access-logs?limit=10` -> `403`
  - mensagem: `Permissão negada`
  - leitura: coerente com restricao de acesso para morador; nao parece defeito

### Falha real observada no backend

- `GET /api/v1/resident/notification-preferences` -> `500`
  - retorno: `Internal Server Error`
  - esta e uma falha real de backend em endpoint consumido pelo app
  - o front deve manter fallback defensivo, mas o backend precisa ser corrigido

## Diferencas Entre Chamada Generica e Chamada Real do App

Alguns endpoints retornaram `400 Field required` quando chamados manualmente sem os parametros que o app normalmente envia.

Esses casos foram retestados com o mesmo formato do app:

- `GET /api/v1/resident/lgpd-consent`
  - sem `deviceId`: `400`
  - com `deviceId`: `200`

- `GET /api/v1/resident/lgpd-consent/history`
  - sem `deviceId`: `400`
  - com `deviceId`: `200`

- `GET /api/v1/messages`
  - sem `unitId`: `400`
  - com `unitId`: `200`

- `GET /api/v1/people/unit-residents`
  - sem `unitId`: `400`
  - com `unitId`: `200`

Conclusao:
- nesses pontos o backend esta correto
- o contrato exige parametros obrigatorios
- o app ja esta chamando no formato adequado

## Achados que Impactam Diretamente o App Morador

### 1. Perfil canonico incompleto

Comparacao direta:

`resident/profile`
- `phone = null`
- `photoUrl = null`
- `photoUri = null`

`people/{id}`
- `phone = 1399202099`
- `photoUrl = null`
- `faceStatus = NO_PHOTO`

Impacto:
- o app nao pode confiar que `resident/profile` sempre trara telefone e foto
- qualquer tela baseada apenas em `resident/profile` pode perder informacao ja existente no backend operacional

### 2. Foto ainda nao refletida no perfil canonico

Durante a validacao:
- a foto passou a aparecer no app com o endurecimento local do front
- mas o backend canônico ainda nao demonstra publicar esse estado no `resident/profile`

Impacto:
- sem fallback local no app, a foto volta a sumir
- o backend deveria refletir a foto vinculada ao morador no perfil oficial do app

### 3. Preferencias de notificacao quebradas no backend

`GET /api/v1/resident/notification-preferences`
- `500 Internal Server Error`

Impacto:
- a tela correspondente depende de fallback local
- o backend precisa corrigir esse endpoint antes de o front poder confiar nele

## Medidas Ja Aplicadas no Front

Durante esta rodada, o `App Morador` foi endurecido para sobreviver a essas inconsistencias:

- merge defensivo do usuario local ao atualizar foto
- priorizacao de foto local imediatamente apos captura
- fallback local para telefone, nome e e-mail
- cache local minimo do perfil para nao perder telefone quando o backend devolver payload parcial
- correcoes de preview local de imagem no iPhone

Essas medidas reduzem o impacto no app, mas nao substituem a correcao do backend canonico.

## Recomendacao Para Backend

Prioridade alta:
- fazer `GET /api/v1/resident/profile` publicar, quando existirem:
  - `phone`
  - `photoUrl` ou `photoUri`
  - `faceStatus`
  - `faceUpdatedAt`

Prioridade alta:
- corrigir `GET /api/v1/resident/notification-preferences`, hoje em `500`

Prioridade media:
- revisar se o perfil canonico do morador deve ser montado a partir da mesma fonte de verdade usada em `people/{id}` para evitar divergencia de telefone e foto

## Conclusao Final

O backend do `App Morador` esta majoritariamente operacional, mas ainda nao entrega um `resident/profile` suficientemente completo para sustentar a experiencia de perfil sem fallback local.

O principal problema confirmado nao e mais hipotese:
- `resident/profile` nao publica telefone nem foto para esta conta

Tambem existe uma falha objetiva adicional:
- `resident/notification-preferences` esta quebrado com `500`

Fora isso, o restante da base de leitura principal do app respondeu bem, inclusive:
- mensagens
- pessoas
- cameras
- entregas
- visitantes previstos
- notificacoes
- incidentes ativos
- configuracao do condominio
