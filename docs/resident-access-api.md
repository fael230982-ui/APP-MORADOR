# Acesso do morador a recursos da unidade

## Contexto

O app morador usa token de perfil `MORADOR` e consulta recursos da unidade ativa. Para a Casa20, a unidade ativa observada no app foi:

```text
7db846ab-073a-4b09-b3ed-1d9242b6e19f
```

O painel web administrativo consegue visualizar encomendas e cameras porque usa um perfil administrativo, recebe uma lista ampla e filtra localmente por `unitId` ou `recipientUnitId`.

## Comportamento observado no app

Com token de morador:

```text
GET /api/v1/deliveries
GET /api/v1/deliveries?recipientUnitId=7db846ab-073a-4b09-b3ed-1d9242b6e19f
GET /api/v1/deliveries?unitId=7db846ab-073a-4b09-b3ed-1d9242b6e19f
```

Resultado:

```text
403 Permissao negada
```

Com token de morador:

```text
GET /api/v1/cameras
GET /api/v1/cameras?unitId=7db846ab-073a-4b09-b3ed-1d9242b6e19f
```

Resultado:

```text
200 OK, lista vazia
```

## Contrato esperado

Na API Sapinho 3.6, o backend passou a documentar:

```text
GET /api/v1/resident/deliveries
GET /api/v1/resident/notifications
PATCH /api/v1/resident/notifications/{id}/read
POST /api/v1/deliveries/{id}/validate-withdrawal
```

O app ja chama `resident/deliveries` antes dos fallbacks antigos e usa `resident/notifications` para a central de notificacoes recebidas.

Para o app morador funcionar sem depender de perfil administrativo, o backend deve garantir uma destas opcoes:

1. Liberar `MORADOR` para listar encomendas onde `recipientUnitId` pertence a `user.unitIds`.
2. Liberar `MORADOR` para listar cameras onde `unitId` pertence a `user.unitIds`.
3. Expor endpoints especificos para morador, por exemplo:

```text
GET /api/v1/resident/deliveries
GET /api/v1/resident/cameras
```

Esses endpoints devem aplicar o escopo pelo token do usuario e pela unidade ativa, sem exigir que o app consulte listas administrativas.

## Headers

O app envia:

```text
Authorization: Bearer <token>
X-Selected-Unit-Id: <selectedUnitId>
```

Quando necessario, o app tambem testa chamadas sem `X-Selected-Unit-Id` para diagnosticar diferencas de escopo.

## Pendencias na API 3.6

O PDF 3.6 ainda nao documenta um endpoint especifico para cameras de morador, como:

```text
GET /api/v1/resident/cameras
```

Enquanto isso nao existir, o app continua tentando `/api/v1/cameras` com o escopo da unidade ativa. Se a API retornar lista vazia para token `MORADOR`, o app nao tem como distinguir "sem cameras cadastradas" de "cameras nao liberadas para morador".
