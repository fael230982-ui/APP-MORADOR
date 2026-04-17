# Pendencias Backend - Acoes Do Morador

Data: 2026-04-13

## Contexto

O `app-morador` ja ficou preparado para abrir duas acoes novas:

- `panico`
- `entrada assistida`

A UX, geolocalizacao, validacao de raio e disparo via `/api/v1/actions/{action_id}/execute` ja estao montados no front.

O que falta agora e o `backend` fechar o contrato operacional especifico dessas acoes para o morador.

## 1. Publicar a acao oficial de panico para o morador

Precisamos que o backend confirme:

- `action_id` canonico;
- `label` oficial;
- `category` oficial;
- `requiredPermission` oficial;
- se a acao sera sempre visivel ao morador ou condicionada por conta/condominio.

Pedido:

- documentar explicitamente qual entrada de `/api/v1/actions` o front deve reconhecer como `panico do morador`.

## 2. Publicar a acao oficial de entrada assistida

Precisamos que o backend confirme:

- `action_id` canonico;
- `label` oficial;
- `category` oficial;
- `requiredPermission` oficial;
- se a acao e habilitada por condominio;
- se existe janela minima entre reenvios.

Pedido:

- documentar explicitamente qual entrada de `/api/v1/actions` o front deve reconhecer como `entrada assistida do morador`.

## 3. Fechar o payload canonico das duas acoes

Hoje o front consegue enviar um `payload` generico, mas precisa do shape oficial.

Pontos para fechar:

- nome canonico do campo de localizacao;
- se a localizacao vai como:
  - `location.latitude/location.longitude`
  - ou `lat/lng`
  - ou outro shape;
- se `accuracy` deve ser enviada;
- se `capturedAt` deve ser enviada;
- se `unitId` e obrigatorio;
- se `condominiumId` e obrigatorio;
- se `requesterName`, `requesterPhone` e `accountUserId` entram no payload ou o backend resolve pelo token;
- se `distanceMeters` deve ser enviado pelo front ou recalculado no backend.

Pedido:

- publicar um exemplo oficial de payload para `panico`;
- publicar um exemplo oficial de payload para `entrada assistida`.

## 4. Expor a geografia oficial do condominio

Hoje o front precisou usar configuracao local por ambiente para:

- `latitude` do centro;
- `longitude` do centro;
- `raio de panico`;
- `raio de entrada assistida`.

Isso resolve teste e piloto, mas nao e o ideal para escala.

Precisamos que o backend exponha por conta/unidade:

- `condominiumCenterLatitude`
- `condominiumCenterLongitude`
- `panicRadiusMeters`
- `assistedEntryRadiusMeters`

Pedido:

- publicar esses campos em rota canonica ja consumida pelo morador, preferencialmente `resident/profile` ou endpoint dedicado de configuracao operacional do morador.

## 5. Fechar a semantica de rastreio da entrada assistida

O requisito funcional informado foi:

- o morador pode acionar de qualquer distancia;
- o envio para a portaria so deve ocorrer dentro de `700 m`;
- a portaria deve poder acompanhar o deslocamento ate a chegada.

Hoje a `V4.8` ainda nao descreve contrato publico para esse acompanhamento.

Precisamos que o backend feche:

- se o rastreio sera:
  - por novo endpoint;
  - por reuso de `/actions/{id}/execute`;
  - por stream;
  - ou por outra rota publica;
- frequencia esperada de atualizacao;
- criterio de encerramento;
- evento de chegada final;
- visibilidade para `Portaria` e `Guarita`;
- se o morador pode cancelar esse acompanhamento.

Pedido:

- publicar o contrato oficial do rastreio da `entrada assistida`.

## 6. Fechar os eventos canônicos do stream para estas acoes

Como o backend ja fechou `eventType` e `occurredAt` como canonicos, precisamos agora dos eventos destas duas acoes.

Pedido:

- listar os `eventType` canonicos para:
  - `panic triggered`
  - `panic received`
  - `assisted entry requested`
  - `assisted entry tracking updated`
  - `assisted entry arrived`
  - `assisted entry cancelled`

## 7. Confirmar persistencia e auditoria

Precisamos saber:

- se `panico` vira `alerta`;
- se `entrada assistida` vira `alerta`, `evento`, `mensagem` ou entidade propria;
- onde a auditoria fica registrada;
- se o morador podera consultar historico via API depois.

Pedido:

- documentar em qual entidade cada acao passa a existir no backend apos o disparo.

## Conclusao

O front ja esta pronto para:

- coletar localizacao;
- validar raio;
- descobrir a acao;
- disparar a acao;
- mostrar feedback ao morador.

O que falta agora e o backend fechar o contrato oficial dessas duas funcionalidades para que `App Morador`, `Portaria` e `Guarita` operem sobre a mesma semantica.
