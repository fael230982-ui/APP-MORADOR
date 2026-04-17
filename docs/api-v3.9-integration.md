# Integração API Sapinho 3.9

Análise feita em 10/04/2026 sobre `api/API Sapinho V3.9.txt`.

## Novidades identificadas

A v3.9 não removeu endpoints existentes da v3.8. Foram adicionadas rotas de:

- grupos de acesso;
- catálogo/eventos de integrações faciais;
- integrações Max Robot Camera IA;
- campos mais explícitos de câmera para preview e vídeo.

## Implementado no app morador

### Câmeras

O app passou a aceitar também estes campos vindos da câmera ou de `/api/v1/cameras/{id}/streaming`:

```text
frameUrl
previewUrl
mjpegUrl
liveUrl
hlsUrl
webRtcUrl
```

Regra usada:

- `hlsUrl` e `liveUrl`: vídeo ao vivo real, reproduzido com `expo-video`;
- `snapshotUrl`, `frameUrl`, `previewUrl`, `thumbnailUrl`, `imageStreamUrl` e `mjpegUrl`: imagem/preview/fallback.

### Pessoas

A v3.9 documenta em `PublicPersonResponse`:

```text
accessGroupIds
accessGroupNames
```

O app agora:

- normaliza esses campos;
- mostra grupos de acesso no card da pessoa quando existirem;
- mostra grupos de acesso no detalhe do cadastro.

### Resumo de acesso por pessoa

O app passou a consumir:

```text
GET /api/v1/people/{id}/access-summary
```

No detalhe da pessoa, quando o endpoint retorna dados, o app mostra:

- acessos hoje;
- entradas;
- saídas;
- acessos negados;
- situação atual;
- último acesso;
- local/câmera.

Se o backend retornar `403` ou `404`, o app simplesmente omite esse bloco.

### Veículos

A v3.9 documenta:

```text
PUT /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}
```

O app agora usa esses endpoints para:

- bloquear veículo;
- reativar veículo;
- remover veículo da unidade.

Todas as ações pedem confirmação antes de enviar a alteração.

## Novidades não ligadas diretamente no app morador

As rotas abaixo parecem ser de operação/admin/backend e não devem ser chamadas diretamente pelo app morador neste momento:

```text
GET/POST /api/v1/access-groups
GET/PUT/DELETE /api/v1/access-groups/{id}
/api/v1/integrations/face/*
```

O app morador apenas consome os nomes dos grupos já vinculados às pessoas/câmeras.

## Pendências que continuam

Mesmo na v3.9, ainda precisam de confirmação/publicação para fechar o app morador:

- endpoint oficial para registrar device/push do morador;
- push real para visita chegada, mensagem da portaria, encomenda e alerta;
- endpoint para marcar todas as notificações como lidas;
- contrato final de eventos em tempo real, se for usado no app;
- recuperação de senha;
- edição de dados do perfil do morador.
- confirmação de permissão `MORADOR` para editar/remover apenas veículos da própria unidade.
