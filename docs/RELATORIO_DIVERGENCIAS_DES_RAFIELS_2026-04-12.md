# Relatorio De Divergencias - DES-RAFIELS

Data de referencia: `2026-04-12`

Base consultada:

- `C:\Users\Pc Rafa\Desktop\DES-RAFIELS`

## Objetivo

Registrar inconsistencias e tensoes de contrato encontradas entre `Backend`, `Portaria Web`, `Guarita` e `App Morador` para resolucao oficial.

## Divergencias Encontradas

### 1. Permissoes com formatos diferentes

Hoje aparecem pelo menos tres estilos de nomenclatura:

- `people.view`
- `alerts.view`
- `deliveries:create`
- `cameras:read`

Impacto:

- os fronts precisam manter alias local;
- a `permissions-matrix` ainda nao funciona como contrato canonico unico.

Resolucao esperada:

- o `Backend` definir formato oficial unico para permissao por acao;
- publicar alias legados apenas como compatibilidade temporaria.

### 2. Evento em tempo real com tensao de nomes

No material compartilhado surgem referencias paralelas a:

- `type`
- `eventType`
- `occurredAt`
- `timestamp`

Impacto:

- risco de cada modulo interpretar o evento por nomes diferentes;
- risco de o stream virar contrato parcial em vez de contrato oficial.

Resolucao esperada:

- o `Backend` publicar tabela oficial minima de campos do evento;
- os quatro lados adotarem a mesma nomenclatura sem dupla leitura permanente.

### 3. Encomendas ainda sem nomenclatura final unica

Continua aberta a tensao entre:

- `pickupCode` x `withdrawalCode`
- `qrCodeUrl` x `withdrawalQrCodeUrl`
- `READY_FOR_WITHDRAWAL` como status oficial ou apenas alvo

Impacto:

- os modulos continuam corretos localmente, mas ainda nao convergiram globalmente.

Resolucao esperada:

- o `Backend` declarar a nomenclatura final oficial e a janela de migracao.

### 4. Cameras e evidencia ainda sem contrato totalmente fechado

Existe convergencia de direcao, mas ainda nao fechamento final de:

- prioridade oficial de midia;
- obrigatoriedade de `cameraId`;
- obrigatoriedade de `snapshotUrl`;
- consistencia disso entre alertas, access logs e stream.

Impacto:

- cada modulo ainda precisa fallback defensivo.

Resolucao esperada:

- contrato tecnico unico de camera e evidencia publicado pelo `Backend`.

### 5. Problema de encoding do Portaria foi resolvido

O `Portaria Web` registrou no proprio changelog da pasta compartilhada que corrigiu o problema de encoding e manteve a copia oficial atualizada na raiz da `DES-RAFIELS`.

Leitura:

- este ponto deixa de ser divergencia aberta;
- permanece apenas como historico de acabamento ja resolvido.

### 6. Nome de arquivo compartilhado com escopos diferentes

Havia dois arquivos com o mesmo nome em escopos diferentes:

- `APP_MORADOR_ECOSSISTEMA_PENDENCIAS_BACKEND_2026-04-12.md`
- `GUARITA_PENDENCIAS_BACKEND_ECOSSISTEMA_2026-04-12.md`

Impacto:

- o risco de colisao caiu bastante com o prefixo por modulo;
- ainda vale manter nomes curtos e semanticamente distintos para nao confundir consolidado com documento de origem.

Resolucao esperada:

- manter prefixo do modulo no inicio do nome;
- evitar referenciar subpastas antigas da `DES-RAFIELS` nos documentos novos.

### 7. Referencias antigas a subpastas da DES-RAFIELS

Alguns documentos mais antigos ainda fazem referencia a estruturas como:

- `DES-RAFIELS/Ecossistema`
- `DES-RAFIELS/App-Morador`
- `DES-RAFIELS/portaria-web/docs`

Impacto:

- gera leitura obsoleta da pasta compartilhada;
- pode induzir novos documentos a seguirem um padrao que ja foi abandonado.

Resolucao esperada:

- atualizar esses documentos conforme forem revisitados;
- adotar a raiz da `DES-RAFIELS` como local padrao para arquivos dos modulos;
- manter apenas a pasta `API` como excecao estrutural.

## Leitura Geral

O ecossistema esta convergindo bem.

Hoje, a maior parte das divergencias ja nao e de tela ou fluxo visual.

O principal ponto pendente e transformar alinhamento desejado em contrato oficial unico do `Backend`.
