# Backend - Pendencia Tecnica Para Aceite Versionado

Data de referencia: `2026-04-12`

## Objetivo

Registrar o que o `backend` precisa expor para o ecossistema sair de `aceite local temporario` e passar para `aceite oficial persistido`.

## Minimo Tecnico Esperado

### Leitura

O `backend` deve permitir consultar se o usuario autenticado ja aceitou a versao vigente.

Campos minimos esperados:

- `accepted`
- `version`
- `acceptedAt`

### Escrita

O `backend` deve permitir registrar aceite da versao vigente.

Payload minimo esperado:

- `version`
- `accepted`
- `acceptedAt`

### Auditoria

Se aplicavel, o `backend` deve armazenar ou derivar:

- `userId`
- `client`
- `device` ou equivalente
- `updatedAt`

## Estado Atual Do App Morador

O `app-morador` ja esta preparado para:

- manter aceite local versionado;
- consultar aceite remoto quando houver rota oficial;
- persistir aceite remoto quando a rota existir;
- continuar funcionando sem quebra quando a API ainda nao suportar esse fluxo.

## Observacao

O nome final das rotas ainda nao esta fechado. O principal agora nao e a URI exata, e sim o contrato minimo de leitura e escrita.
