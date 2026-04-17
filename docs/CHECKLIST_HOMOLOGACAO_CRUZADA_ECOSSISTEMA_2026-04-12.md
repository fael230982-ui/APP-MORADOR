# Checklist De Homologacao Cruzada Do Ecossistema

Data de referencia: `2026-04-12`

## Objetivo

Esta checklist serve para validar se `App Morador`, `Portaria Web`, `Guarita` e `Backend` continuam coerentes entre si depois de:

- nova API;
- nova tela;
- nova regra operacional;
- mudanca de contrato;
- fechamento de divergencia.

## Como Usar

Para cada rodada relevante:

1. validar o `Backend`;
2. validar `Portaria Web`;
3. validar `Guarita`;
4. validar `App Morador`;
5. registrar divergencias encontradas na `DES-RAFIELS`.

## 1. Sessao E Escopo

- confirmar `role`, `scopeType`, `unitIds`, `selectedUnitId`, `selectedUnitName` e `requiresUnitSelection`;
- confirmar comportamento quando o usuario tem mais de uma unidade;
- confirmar que cada modulo respeita o mesmo escopo;
- confirmar que recurso fora do escopo retorna `403` e nao dado indevido.

## 2. Permissoes

- validar se `permissions-matrix` reflete o comportamento real;
- validar formato oficial das permissoes;
- confirmar se aliases legados ainda sao necessarios;
- confirmar se os tres fronts interpretam a mesma permissao do mesmo jeito.

## 3. Encomendas

- validar nomes oficiais de codigo e QR de retirada;
- validar status oficiais de encomenda;
- confirmar se `pickupCode`, `withdrawalCode`, `qrCodeUrl` e nomes alvo estao coerentes com a API vigente;
- validar retirada segura sem expor segredo em tela operacional;
- validar auditoria de recebimento e retirada.

## 4. Facial

- validar `faceStatus` oficial do backend;
- validar `faceUpdatedAt`;
- validar `faceErrorMessage` quando houver falha;
- confirmar se upload de foto nao e tratado como sincronizacao concluida antes da resposta oficial;
- confirmar mesma leitura semantica em todos os modulos.

## 5. Alertas

- validar `alertType`, `alertSeverity` e `alertStatus`;
- validar se `cameraId`, `snapshotUrl`, `unitId` e `occurredAt` chegam quando aplicavel;
- confirmar se os tres fronts leem o mesmo alerta com a mesma severidade;
- confirmar persistencia ou nao de triagem operacional.

## 6. Cameras

- validar consistencia de `liveUrl`, `hlsUrl`, `webRtcUrl`, `imageStreamUrl`, `mjpegUrl`, `snapshotUrl`, `thumbnailUrl`;
- validar prioridade oficial de midia;
- confirmar fallback coerente entre video e imagem;
- confirmar consistencia de `cameraId` em eventos, alertas e access logs.

## 7. Mensagens E Notificacoes

- validar diferenca oficial entre `message`, `notification` e `alert`;
- validar tipos oficiais de notificacao;
- validar quais eventos geram push;
- validar quais eventos geram inbox persistida;
- validar relacionamento com `messageId`, `deliveryId`, `visitForecastId`, `alertId` e `cameraId`.

## 8. Tempo Real

- validar `GET /api/v1/events/stream`;
- validar `POST /api/v1/events/stream/confirm`, se aplicavel;
- confirmar nomes oficiais dos campos do evento;
- confirmar reconexao, heartbeat e deduplicacao;
- confirmar quais eventos cada modulo deve receber.

## 9. Operacao E Busca

- validar `operation/units` e demais buscas operacionais;
- confirmar estabilidade de schemas usados em `Portaria Web` e `Guarita`;
- confirmar que o `App Morador` nao depende de rota operacional indevida.

## 10. Documentacao Compartilhada

- confirmar que o documento novo foi salvo com prefixo correto;
- confirmar que a copia compartilhada corresponde ao original do projeto;
- confirmar data no nome;
- confirmar se houve registro no changelog;
- confirmar se houve registro de divergencia quando necessario.

## Saida Esperada Da Rodada

Ao fim de cada homologacao cruzada, gerar um resumo curto com:

- `ok sem divergencia`
- `ok com compatibilidade temporaria`
- `divergencia aberta`
- `pedido para backend`

## Regra Final

Se dois modulos estiverem corretos localmente, mas diferentes entre si, o resultado nao e `ok`.

Nesse caso, o status correto e `divergencia aberta` ate o contrato oficial ser fechado.
