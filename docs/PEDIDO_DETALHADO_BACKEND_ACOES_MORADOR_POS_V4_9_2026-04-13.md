# Pedido Detalhado Ao Backend - Acoes Do Morador Pos V4.9

Data: 2026-04-13

## Objetivo

Formalizar no backend o contrato oficial de duas funcionalidades novas do `App Morador`:

- `botao de panico`
- `entrada assistida`

O front ja esta preparado para:

- coletar localizacao atual do aparelho;
- validar raio localmente;
- descobrir a acao em `/api/v1/actions`;
- disparar `POST /api/v1/actions/{action_id}/execute`;
- mostrar retorno ao morador;
- registrar historico local de acionamento.

O que falta agora e o backend fechar a semantica oficial para que `App Morador`, `Portaria Web` e `Guarita` operem sobre o mesmo contrato.

## Estado Atual Confirmado Pela V4.9

Os seguintes blocos ja estao fechados e podem ser tratados como oficiais:

- `resident/profile` como fonte canonica do perfil do morador;
- `permissions-matrix` como fonte primaria oficial;
- `effectiveAccess` como companheiro oficial do usuario;
- `eventType` como campo canonico do stream;
- `occurredAt` como campo canonico do stream;
- `alerts/{id}/workflow` com `workflowStatus`;
- `clientRequestId`, `syncStatus`, `retryable`, `isFinal`, `isApplied`.

O que ainda nao esta fechado de forma explicita na `V4.9` e justamente o contrato destas duas acoes do morador.

## 1. Publicar a acao oficial de panico do morador

Precisamos que o backend feche:

- `action_id` canonico;
- `label` oficial;
- `category` oficial;
- `requiredPermission` oficial;
- se a acao sera sempre visivel ao morador ou condicionada por conta/condominio;
- se `available` sera usado para bloquear o front quando a conta nao puder usar.

Pedido objetivo:

- publicar em `/api/v1/actions` a entrada oficial da acao de `panico do morador`;
- informar explicitamente qual `requiredPermission` o front deve considerar como fonte de verdade;
- confirmar se a acao deve ser liberada apenas para perfis/residentes com permissao explicita na `permissions-matrix`.

## 2. Publicar a acao oficial de entrada assistida

Precisamos que o backend feche:

- `action_id` canonico;
- `label` oficial;
- `category` oficial;
- `requiredPermission` oficial;
- criterio de disponibilidade por conta/condominio;
- possivel janela minima entre reenvios;
- politica de reabertura ou novo disparo.

Pedido objetivo:

- publicar em `/api/v1/actions` a entrada oficial da acao de `entrada assistida do morador`;
- confirmar se `available` sera a forma canonica de o backend dizer que a conta atual pode ou nao usar o recurso;
- confirmar se o morador pode reenviar esse aviso mais de uma vez no mesmo trajeto.

## 3. Fechar o payload canonico do botao de panico

Hoje o front consegue mandar um payload generico. Precisamos do shape oficial.

Campos hoje preparados no app:

- `type`
- `unitId`
- `unitName`
- `condominiumId`
- `accountUserId`
- `requesterName`
- `requesterPhone`
- `distanceMeters`
- `location.latitude`
- `location.longitude`
- `location.accuracy`
- `location.capturedAt`

Pedido objetivo:

- confirmar o shape oficial esperado no `payload`;
- informar quais campos devem permanecer;
- informar quais campos o backend vai resolver pelo token e nao quer receber no payload;
- confirmar se `distanceMeters` deve ser enviado pelo front ou recalculado no backend.

## 4. Fechar o payload canonico da entrada assistida

Hoje o app esta pronto para enviar a mesma base de localizacao e contexto.

Precisamos que o backend confirme:

- shape oficial do payload;
- se a entrada assistida deve carregar algum campo adicional de intencao, como:
  - `estimatedArrivalMinutes`
  - `vehiclePlate`
  - `note`
  - `travelMode`
- se o backend quer `unitId` como obrigatorio;
- se o backend quer `selectedUnitId` como nome oficial diferente.

Pedido objetivo:

- publicar um exemplo oficial do payload da `entrada assistida`;
- dizer quais campos sao obrigatorios, opcionais e ignorados.

## 5. Expor a geografia oficial do condominio por API

Hoje o front esta usando configuracao local por ambiente para:

- `latitude` do centro do condominio;
- `longitude` do centro do condominio;
- `panicRadiusMeters`;
- `assistedEntryRadiusMeters`.

Isso serve para piloto, mas nao e a solucao correta para ecossistema.

Pedido objetivo:

- publicar por API os campos canonicos de geofence do condominio;
- preferencialmente em rota ja consumida pelo morador, como `resident/profile`, ou em endpoint dedicado de configuracao operacional;
- informar os nomes oficiais dos campos.

Sugestao de campos:

- `condominiumCenterLatitude`
- `condominiumCenterLongitude`
- `panicRadiusMeters`
- `assistedEntryRadiusMeters`

## 6. Fechar a regra de validacao de raio

O requisito funcional atual e:

- `panico`: so pode ser disparado dentro do raio do condominio;
- `entrada assistida`: pode ser iniciada a qualquer distancia como intencao local, mas so deve ser enviada para a portaria quando estiver dentro de `700 m`.

Pedido objetivo:

- confirmar se a validacao oficial de raio ficara no backend tambem;
- confirmar se o backend rejeitara execucao fora do raio mesmo que o front tente enviar;
- informar qual erro canonico o backend retornara nesses casos.

## 7. Fechar o contrato de rastreio da entrada assistida

Este e o maior gap funcional ainda aberto.

O requisito informado foi:

- o morador aciona;
- a portaria e avisada quando o morador estiver dentro do raio de envio;
- a portaria pode acompanhar o deslocamento ate a chegada no condominio.

Hoje a `V4.9` ainda nao descreve esse acompanhamento.

Pedido objetivo:

- definir se o rastreio sera uma entidade propria ou extensao da acao;
- definir a rota oficial para atualizacao de posicao;
- definir a frequencia recomendada de envio;
- definir o evento final de chegada;
- definir cancelamento pelo morador;
- definir timeout/inatividade;
- definir visibilidade para `Portaria` e `Guarita`.

Perguntas tecnicas objetivas:

- o rastreio sera via `POST /api/v1/actions/{action_id}/execute` repetido?
- havera endpoint proprio, por exemplo `.../tracking`?
- o stream publicara eventos proprios para esse deslocamento?
- o backend armazenara o ultimo ponto, trilha resumida ou ambos?

## 8. Publicar os eventType canonicos dessas acoes no stream

Como `eventType` e `occurredAt` ja estao fechados, precisamos agora da semantica desses eventos para integração cruzada.

Pedido objetivo:

- listar os `eventType` oficiais para `panico`;
- listar os `eventType` oficiais para `entrada assistida`;
- informar quais campos adicionais entram no `payload` desses eventos;
- informar se `snapshotUrl`, `liveUrl` ou `replayUrl` podem aparecer associados a essas ocorrencias.

Sugestao minima de eventos a arbitrar:

- `resident_panic.triggered`
- `resident_panic.registered`
- `resident_assisted_entry.requested`
- `resident_assisted_entry.tracking_updated`
- `resident_assisted_entry.arrived`
- `resident_assisted_entry.cancelled`

## 9. Fechar como essas acoes se materializam no dominio

Precisamos saber em que entidade cada acao passa a existir depois de disparada.

Pedido objetivo:

- confirmar se `panico` vira `alerta`;
- confirmar se `entrada assistida` vira `alerta`, `evento`, `mensagem` ou entidade propria;
- confirmar se o historico sera consultavel por rota propria ou apenas por `alerts`/`events`.

## 10. Fechar permissao e matriz oficial dessas acoes

Como a `permissions-matrix` ja e oficial e `snake_case`, precisamos que isso apareca tambem para essas funcionalidades.

Pedido objetivo:

- publicar os nomes oficiais em `snake_case` das permissoes relacionadas;
- confirmar como `effectiveAccess` refletira:
  - uso do `panico`;
  - uso da `entrada assistida`;
- informar se ha diferenca entre permissao de ver e permissao de executar.

## 11. Confirmar auditoria minima

Para operacao e LGPD, precisamos saber o minimo auditado.

Pedido objetivo:

- confirmar se ficam persistidos:
  - `userId`
  - `accountId`
  - `deviceId`
  - `unitId`
  - `condominiumId`
  - `capturedAt`
  - coordenadas recebidas
  - resultado da validacao de raio
  - data/hora do disparo
- confirmar se o backend registra a origem como `APP`.

## 12. Erros canonicos esperados pelo front

Para o front conseguir orientar o morador corretamente, precisamos padronizar alguns cenarios.

Pedido objetivo:

- listar os erros e codigos canonicos para:
  - acao nao publicada;
  - acao indisponivel para a conta;
  - acao fora do raio;
  - unidade nao selecionada;
  - localizacao ausente ou inconsistente;
  - rastreio encerrado;
  - rastreio cancelado;
  - limite de reenvio atingido.

## Conclusao

O `App Morador` ja esta tecnicamente pronto para encaixar o contrato final.

O que falta agora nao e UX local. O que falta e o backend arbitrar oficialmente:

- ids das acoes;
- payloads oficiais;
- geofence por API;
- rastreio da entrada assistida;
- eventos oficiais no stream;
- auditoria e erros canonicos.

Quando isso for fechado, a ativacao final dessas duas funcionalidades pode ser feita sem reestruturar a base do app.
