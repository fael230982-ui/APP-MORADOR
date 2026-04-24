# Relatorio Pos API V5.7 - App Morador x Backend

Data da validacao: 24/04/2026  
Horario da bateria real: 12:55 BRT  
Ambiente validado: `https://sapinhoprod.v8seguranca.com.br/api/v1`  
Conta usada no teste real: morador com unidade ativa `CASA 20`  
Escopo: leitura real dos endpoints e prova objetiva das midias publicadas para o `App Morador`

## Resumo Executivo

- A `V5.7` resolveu os dois bloqueios mais importantes que estavam abertos no backend do `App Morador`.
- `GET /api/v1/resident/profile` agora publica corretamente:
  - `phone`
  - `photoUrl`
  - `photoUri`
  - `faceStatus`
  - `faceUpdatedAt`
- `GET /api/v1/resident/notification-preferences` deixou de retornar `500` e passou a responder `200`.
- A divergencia entre `resident/profile` e `people/{id}` para esta conta ficou resolvida.
- Permanece uma pendencia real de backend nas imagens de encomendas:
  - `photoUrl` da encomenda responde `404`
  - `snapshotUrl` da notificacao de encomenda responde `404`

## Delta Documental da V5.7

Comparando `V5.7` com `V5.6`, nao apareceu novo endpoint de produto que mude o fluxo principal do `App Morador`.

As novas rotas documentadas ficaram concentradas em:

- `/api/v1/jobs/photo-search/reindex`
- `/api/v1/master/partners`
- `/api/v1/master/partners/{partner_id}`
- `/api/v1/master/provisioning-keys`
- `/api/v1/master/provisioning-keys/{key_id}/revoke`
- `/api/v1/partner/clients`
- `/api/v1/partner/provisioning-keys`

Leitura objetiva:

- sao rotas de operacao administrativa, parceiros e provisionamento
- nao alteram diretamente `Home`, `Perfil`, `Pessoas`, `Mensagens`, `Encomendas` ou `Notificacoes` do morador

## Testes Reais Executados

### Contexto de autenticacao

`POST /api/v1/auth/login`
- `200`
- unidade ativa confirmada: `CASA 20`
- `scopeType: RESIDENT`

`GET /api/v1/auth/me`
- `200`

### Perfil canonico do morador

`GET /api/v1/resident/profile`
- `200`
- `profileSource: CANONICAL_RESIDENT_PROFILE`

Campos confirmados nesta rodada:

- `phone: 1399790243`
- `photoUrl: https://sapinhoprod.v8seguranca.com.br/media/people/f7a8f95d8a87490f9afd0638cfa56bad.jpg`
- `photoUri: https://sapinhoprod.v8seguranca.com.br/media/people/f7a8f95d8a87490f9afd0638cfa56bad.jpg`
- `faceStatus: PHOTO_ONLY`
- `faceUpdatedAt: 2026-04-24T14:44:04.662864Z`

Conclusao:

- o backend canonico do morador agora passou a refletir telefone e foto
- isso elimina o principal motivo estrutural para o perfil perder telefone ou foto no front

### Pessoa operacional vinculada

`GET /api/v1/people/{personId}`
- `200`

Campos confirmados:

- `phone: 1399790243`
- `photoUrl: https://sapinhoprod.v8seguranca.com.br/media/people/f7a8f95d8a87490f9afd0638cfa56bad.jpg`
- `faceStatus: PHOTO_ONLY`
- `status: ACTIVE`
- `category: RESIDENT`

Conclusao:

- `resident/profile` e `people/{id}` ficaram alinhados para esta conta

### Preferencias remotas de notificacao

`GET /api/v1/resident/notification-preferences`
- `200`

Conclusao:

- a falha `500` observada antes foi resolvida no backend

### Endpoints principais do App Morador

Todos abaixo responderam `200` nesta rodada:

- `GET /api/v1/resident/condominium`
- `GET /api/v1/resident/notifications?limit=10`
- `GET /api/v1/messages?unitId={unitId}&limit=10`
- `GET /api/v1/deliveries?page=1&limit=10&recipientUnitId={unitId}`
- `GET /api/v1/resident/deliveries?limit=10`
- `GET /api/v1/resident/lgpd-policy`
- `GET /api/v1/resident/live-incidents/active`

### Midias de encomenda e notificacao

Amostra real recebida do backend:

`delivery.photoUrl`
- `/media/deliveries/dc7814efe28c4fb497979c4ab47b9cb3.jpg`

`notification.snapshotUrl`
- `/media/deliveries/dc7814efe28c4fb497979c4ab47b9cb3.jpg`

Provas de carga com autenticacao valida:

`GET https://sapinhoprod.v8seguranca.com.br/media/deliveries/dc7814efe28c4fb497979c4ab47b9cb3.jpg`
- `404`
- `content-type: image/jpeg`
- corpo muito pequeno, compatível com placeholder de erro

`GET https://sapinhoprod.v8seguranca.com.br/api/v1/deliveries/withdrawal-qr/252372`
- `200`
- `content-type: image/png`

Conclusao:

- o backend publica corretamente o QR de retirada
- o backend ainda nao publica corretamente a imagem real da encomenda
- por isso `Encomendas` e `Notificacoes` continuam sem foto mesmo com o front preparado

## O Que Foi Resolvido Com a V5.7

Resolvido:

- perfil canonico agora traz telefone
- perfil canonico agora traz foto
- perfil canonico agora traz estado facial
- preferencias remotas de notificacao voltaram a responder
- alinhamento entre `resident/profile` e `people/{id}` melhorou

Impacto direto no app:

- o front pode reduzir dependencia de fallback local para `phone` e `photoUri`
- a tela de `Perfil` passa a ter base canônica suficiente para se sustentar melhor
- a tela de `Preferencias de aviso` volta a poder confiar no backend

## Pendencias Reais Apos a V5.7

Permanece pendente:

- `photoUrl` de encomendas responde `404`
- `snapshotUrl` de notificacoes de encomenda responde `404`

Impacto:

- `Encomendas` nao conseguem mostrar a foto real do pacote
- `Notificacoes` de encomenda nao conseguem mostrar a imagem

## Leitura Final

A `V5.7` foi positiva para o `App Morador`.

Os bloqueios que mais feriam a experiencia de perfil e preferencias remotas foram resolvidos no backend. O principal problema restante nao e mais perfil, nem notificacoes remotas: agora o ponto aberto esta concentrado na publicacao de midia de encomendas.

## Recomendacao Para Backend

Prioridade alta:

- corrigir a publicacao de `photoUrl`, `packagePhotoUrl`, `labelPhotoUrl` e `snapshotUrl` das encomendas
- garantir que as URLs retornadas por `deliveries` e `resident/notifications` estejam realmente acessiveis com autenticacao valida

Validacao sugerida pelo backend:

- registrar uma nova encomenda com foto
- abrir a URL publicada no payload final
- confirmar `200` real no recurso de imagem
