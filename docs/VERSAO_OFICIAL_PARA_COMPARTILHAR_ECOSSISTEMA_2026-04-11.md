# Versao Oficial Para Compartilhar Do Ecossistema

Data de referencia: `2026-04-11`

Escopo:

- `Guarita`
- `Portaria Web`
- `App Morador`
- `Backend`

## Finalidade

Este documento formaliza as regras de alinhamento do ecossistema para evitar divergencias entre os tres produtos e o backend.

Ele define:

- o que deve ser padrao oficial;
- o que pode variar por canal;
- como tratar conflitos;
- como fechar divergencias sem criar regras locais concorrentes.

## Principio Geral

Os tres produtos podem ter experiencias diferentes, mas nao podem ter regras de negocio diferentes para o mesmo dominio compartilhado.

Pode variar entre os canais:

- interface;
- densidade de informacao;
- linguagem por perfil;
- ordem de exibicao;
- profundidade operacional.

Nao pode variar entre os canais:

- significado de status;
- nome e semantica de campos canonicos;
- regra de permissao;
- regra de auditoria;
- regra de seguranca;
- prioridade de midia;
- semantica de eventos compartilhados.

## Padrões Oficiais Do Ecossistema

### 1. Identificadores canonicos

Devem ser unificados no ecossistema:

- `condominiumId`
- `unitId`
- `personId`
- `userId`
- `cameraId`
- `deliveryId`
- `alertId`
- `messageId`
- `notificationId`
- `visitId` ou `visitForecastId`

Regra:

- o contrato oficial deve ter um nome canonico por conceito;
- aliases legados podem existir apenas como compatibilidade temporaria.

### 2. Encomendas

Padrao vigente mais visivel hoje:

- `RECEIVED`
- `NOTIFIED`
- `WITHDRAWN`

Padrao alvo para convergencia:

- `RECEIVED`
- `NOTIFIED`
- `READY_FOR_WITHDRAWAL`
- `WITHDRAWN`

Regra:

- nenhum produto deve reinterpretar o significado dos status;
- enquanto `READY_FOR_WITHDRAWAL` nao estiver oficializado no backend, ele deve ser tratado como estado alvo de convergencia.

### 3. Retirada segura

Padrao vigente mais comum hoje:

- `withdrawalCode`
- `qrCodeUrl`
- `withdrawalValidatedAt`
- `withdrawalValidationMethod`

Padrao alvo:

- `withdrawalCode`
- `withdrawalQrCodeUrl`
- `withdrawalValidatedAt`
- `withdrawalValidationMethod`

Regra:

- eliminar duplicidade como `pickupCode` x `withdrawalCode`;
- eliminar ambiguidade de nome do QR de retirada;
- enquanto o backend nao publicar o nome final, o nome alvo deve ser tratado como objetivo de convergencia e nao como contrato vigente.

### 4. Facial

Com a `API v4.4`, passou a existir um `faceStatus` oficial no backend.

Padrao oficial publicado:

- `NO_PHOTO`
- `PHOTO_ONLY`
- `FACE_PENDING_SYNC`
- `FACE_SYNCED`
- `FACE_ERROR`

Regra:

- os produtos podem traduzir isso para linguagem humana;
- os produtos podem manter um mapeamento interno simplificado se precisarem;
- mas o contrato oficial publicado pelo backend agora deve respeitar essa tabela.

### 5. Alertas

Precisa existir padrao oficial para:

- `alertType`
- `alertSeverity`
- `alertStatus`

Padrao minimo esperado:

- tipos como `UNKNOWN_PERSON`, `ACCESS_DENIED`, `CAMERA_OFFLINE`, `PANIC`
- severidades como `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- status como `OPEN`, `UNDER_REVIEW`, `RESOLVED`

### 6. Cameras e prioridade de midia

Ordem alvo de prioridade:

1. `liveUrl`
2. `hlsUrl`
3. `webRtcUrl`
4. `imageStreamUrl`
5. `mjpegUrl`
6. `snapshotUrl`
7. `thumbnailUrl`

Regra:

- `rtspUrl` pode existir como dado tecnico, mas nao como contrato principal de frontend;
- a oficializacao dessa ordem depende de publicacao consistente do backend nos cenarios suportados.

### 7. Mensagens, notificacoes e alertas

Esses conceitos devem permanecer separados:

- `message`: conversa entre pessoas e operacao
- `notification`: evento de inbox ou push
- `alert`: evento operacional ou de seguranca

Regra:

- payload, semantica e ciclo de vida de cada um devem ser independentes.

### 8. Permissoes por app e por acao

Padrao alvo de governanca:

- `allowedProfiles`
- `allowedClients`
- `scope`

Exemplo conceitual:

- `allowedClients = RESIDENT_APP | GUARD_APP | PORTARIA_WEB`

Regra:

- isso so deve ser tratado como contrato oficial quando o backend publicar e aplicar a matriz de forma centralizada.

### 9. Auditoria

Todo evento operacional relevante deve ter trilha minima padrao:

- `performedByUserId`
- `performedByUserName`
- `performedAt`
- `clientType`
- `deviceName`
- `condominiumId`
- `unitId` quando aplicavel
- `evidenceUrl` quando aplicavel

### 10. Tempo real e stream

Padrao alvo de tipagem:

- `eventId`
- `eventType`
- `occurredAt`
- `entityType`
- `entityId`
- `unitId` quando aplicavel
- `cameraId` quando aplicavel
- `payload`

Regra:

- isso representa governanca desejada;
- so vira contrato implementado quando o backend publicar o stream oficial nesse formato.

## Ownership Por Produto

### Portaria Web

Referencia principal para:

- operacao ampla;
- alertas;
- cameras;
- auditoria;
- monitoramento transversal;
- configuracao e visao administrativa.

### Guarita

Referencia principal para:

- operacao movel;
- captura rapida;
- evidencias de campo;
- OCR operacional;
- contingencia local;
- cadastro assistido em mobilidade.

### App Morador

Referencia principal para:

- relacionamento com residente;
- autosservico;
- visualizacao da propria unidade;
- mensagens com a portaria;
- notificacoes do residente;
- consulta e retirada no escopo da unidade.

Regra:

- os outros produtos podem refletir ou consumir o resultado do fluxo;
- mas nao devem redefinir a regra central de um fluxo cujo ownership seja de outro canal.

## Ordem De Precedencia Em Conflitos

Quando houver conflito, prevalece:

1. contrato oficial do `backend`
2. contrato padrao do ecossistema
3. ownership funcional do produto dono do fluxo
4. implementacao atual do front

Regra:

- implementacao local nao vence contrato oficial;
- conveniencia de um canal nao vence padrao compartilhado.

## Processo De Fechamento De Divergencia

Toda divergencia deve seguir este fluxo:

1. identificar o dominio afetado;
2. classificar a divergencia;
3. registrar estado atual de `Guarita`, `Portaria Web`, `App Morador` e `Backend`;
4. apontar risco causado;
5. propor regra canonica;
6. validar impacto nos quatro lados;
7. publicar decisao no documento mestre;
8. atualizar backlog tecnico dos modulos afetados;
9. remover legado quando a migracao terminar.

## Tipos De Divergencia

Toda divergencia deve ser classificada como:

- `semantica`
- `contrato`
- `ux`
- `escopo`
- `permissao`
- `backend`

## Quem Decide Cada Divergencia

- `semantica`: documento mestre do ecossistema com validacao conjunta
- `contrato`: backend como contrato oficial, ouvindo os tres fronts
- `ux`: produto dono do canal, sem quebrar o contrato comum
- `escopo`: matriz de ownership do ecossistema
- `permissao`: backend com validacao de negocio
- `backend`: contrato tecnico oficial publicado

## Critério Para Desempate

Se houver duas solucoes concorrentes, vence a opcao que:

1. preserva contrato unico;
2. reduz duplicidade de semantica;
3. evita alias permanentes;
4. respeita ownership do fluxo;
5. reduz risco de auditoria e seguranca;
6. reduz custo de manutencao futura do ecossistema.

## Regras Praticas Para Divergencias Comuns

### Nome de campo

Se houver nomes concorrentes para o mesmo conceito:

- escolher um nome canonico;
- manter alias apenas como compatibilidade temporaria;
- definir prazo de remocao do legado.

### Status

Se houver nomes ou leituras diferentes:

- o status tecnico deve ser unico;
- labels humanas podem variar, desde que a semantica tecnica continue igual.

### Fluxo

Se um canal tentar operar o que deveria ser apenas consulta:

- vence a matriz de ownership;
- o canal fora do ownership pode refletir, consultar ou iniciar pedido, mas nao redefinir a operacao principal.

### Permissao

Se um front liberar e outro bloquear:

- a permissao oficial deve vir do backend;
- os fronts devem adaptar interface a partir da mesma regra central.

## Documento Mestre

Deve existir um documento mestre unico do ecossistema contendo:

- tabela oficial de status;
- campos canonicos;
- matriz oficial de permissao;
- ownership por produto;
- regras de auditoria;
- regras de divergencia;
- historico de decisoes.

Toda decisao nova deve entrar nesse documento antes de virar regra definitiva nos produtos.

## Fechamento

Este documento deve ser usado como base comum entre `Guarita`, `Portaria Web`, `App Morador` e `Backend`.

Ele existe para garantir tres coisas:

- consistencia de regra;
- clareza de ownership;
- resolucao objetiva de divergencias.

Sem esse contrato, cada frente tende a acertar localmente e divergir globalmente.

Com esse contrato, o ecossistema consegue evoluir com padrao, previsibilidade e menor custo de manutencao.
