# API V5.5 - Integracao no App Morador

Data: `2026-04-20`

## Leitura objetiva

A `V5.5` adiciona um fluxo novo de `WhatsApp via QR` no modulo de mensagens, com tres pontos principais:

- `GET /api/v1/messages/whatsapp/connection?unitId={unitId}`
- `POST /api/v1/messages/whatsapp/connect?unitId={unitId}`
- `POST /api/v1/messages` com `origin=WHATSAPP`

O backend tambem passou a documentar no contrato de criacao de mensagem os campos:

- `recipientPersonId`
- `recipientPhone`

## Recorte correto deste modulo

O fluxo descrito pelo backend e operacional:

- um operador conecta um WhatsApp por QR;
- conversa com o morador sem sair da tela de mensagens;
- faz polling ate a instancia ficar `open`.

Esse comportamento pertence a modulos de:

- `Portaria`
- `Guarita`

Por isso, o `App Morador` nao deve expor a tela de conexao, o QR ou a acao de reconectar WhatsApp.

## Impacto real no App Morador

Mesmo sem expor o QR, a `V5.5` afeta este app em dois pontos:

1. mensagens do historico agora podem chegar com `origin=WHATSAPP`;
2. o payload oficial de `OperationMessage` ganhou `recipientPersonId`, `recipientPersonName`, `recipientPhone`, `externalMessageId` e `externalMetadata`.

## Ajustes aplicados

Foram absorvidos no app:

- copia local da especificacao em `api/API Sapinho V5.5.txt`;
- ampliacao do tipo `OperationMessage` em `services/operationMessages.ts`;
- normalizacao dos campos novos vindos do backend;
- diferenciacao visual de mensagens com origem `WHATSAPP` em `app/messages.tsx`.

## O que ficou explicitamente fora

Nao foi implementado neste modulo:

- consulta de estado da conexao WhatsApp;
- criacao/reconexao por QR;
- envio `origin=WHATSAPP` com `recipientPersonId` ou `recipientPhone`;
- polling da instancia ate `open`.

Esses itens devem ser implementados no front de operacao, nao no app do morador.

## Conclusao

A `V5.5` foi absorvida no `App Morador` no que e compativel com o perfil do modulo: leitura e exibicao correta do historico de mensagens, inclusive quando a portaria usar `WHATSAPP` como origem operacional.
