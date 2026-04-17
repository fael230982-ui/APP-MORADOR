# API V4.8 Integration

Data: 2026-04-13

## Leitura objetiva

A `V4.8` fechou melhor o contrato operacional em `alertas`, `stream`, `permissions-matrix` e `sync/reconcile`.

Para o `app-morador`, os impactos mais relevantes foram:

- `alerts/{id}/workflow` agora existe como endpoint explicito;
- `workflowStatus` de alerta passou a ter contrato oficial:
  - `NEW`
  - `ON_HOLD`
  - `RESOLVED`
- `stream` reforcou `eventType` e `occurredAt` como canonicos;
- `resident/profile` permanece como fonte canonica do perfil do morador;
- `cameras/{id}/streaming` segue compativel com a camada que o app ja vinha usando.

## O que foi absorvido no app

- busca por texto em `Alertas`;
- leitura de `workflowStatus` em alertas;
- infraestrutura de `acoes rapidas do morador`:
  - `botao de panico`
  - `entrada assistida`
- geofence local com `expo-location` e parametros por ambiente;
- uso da rota generica de `actions` como base de disparo operacional;
- ajuste de copy para nao prometer SSE onde ainda ha apenas preparo de atualizacao automatica.

## O que a V4.8 ainda nao fecha para estas novas funcionalidades

- id oficial da acao de `panico` para o morador;
- id oficial da acao de `entrada assistida` para o morador;
- shape oficial do `payload` dessas acoes;
- origem canonica das coordenadas e do raio do condominio por conta/unidade;
- contrato para atualizacao de deslocamento da `entrada assistida` ate a chegada.

## Direcao adotada no app

O app ficou preparado para:

- descobrir a acao publicada em `/api/v1/actions`;
- coletar localizacao atual do aparelho;
- validar raio antes do envio;
- disparar `POST /api/v1/actions/{action_id}/execute`.

Quando o backend publicar a semantica oficial dessas acoes, a camada local ja esta pronta para encaixar o contrato final sem refazer a UX.
