# Pendencias Backend Pos API V4.7

## Contexto

Boa parte das pendencias anteriores foi fechada pelo retorno formal do backend. O que resta agora ficou bem menor e mais residual.

## Pendencias principais

### 1. Stream canonico em producao real

O backend fechou que:

- canonico: `eventType`, `occurredAt`
- legados temporarios: `type`, `timestamp`, `eventTime`

O que ainda resta e validar consistencia pratica de producao para:

- `snapshotUrl`
- `liveUrl`
- `replayUrl`
- `replayAvailable`
- `eventTime`
- `secondsBefore`
- `secondsAfter`

### 2. Sync reconcile

O backend fechou a tabela oficial e a resposta expandida. O que ainda resta e governanca operacional completa:

- tabela oficial de `syncStatus`
- regra objetiva de `retryable`
- regra objetiva de `isFinal`
- regra objetiva de `isApplied`
- ciclo do `X-Sync-Token`
- quais agregados entram oficialmente no fluxo de reconcile

### 3. Alertas operacionais

O backend fechou que o workflow atual e `READ_STATE`, com `resolutionSupported = false`.

Nao ha pendencia de implementacao local no `app-morador` neste ponto.
O que resta e apenas evolucao futura, se o backend algum dia publicar triagem operacional persistida.

### 4. Permissions matrix

Ainda falta confirmar:

- se ela ja e fonte primaria oficial;
- formato canonico final da permissao;
- e relacionamento com `effectiveAccess`.

### 5. Renotify de encomendas

O backend fechou que `renotify` e restrito a `OPERACIONAL` e `CENTRAL`, com janela e limite por condominio.

Nao ha pendencia funcional no `app-morador` neste ponto, porque a acao foi removida da UI do morador.

### 6. Moradores por unidade

Ainda falta confirmar oficialmente:

- se `people/unit-residents` e o caminho canonico;
- se inclui ou nao `locatarios`;
- e se o payload enxuto sera mantido como contrato estavel.

### 7. LGPD

O contrato fechou o escopo `ACCOUNT_DEVICE`, com persistencia por `user + accountId + deviceId`.

O que ainda resta e governanca institucional fora do app:

- versao vigente de termos;
- politica interna de revogacao;
- politica de historico, ja que o backend confirmou `sem historico versionado`.

## Leitura final

A `V4.7` com retorno formal do backend reduziu bastante a ambiguidade do ecossistema.

Para o `app-morador`, o residual agora ficou pequeno e concentrado em:

- consistencia real do `stream` em producao;
- governanca operacional de `reconcile`;
- definicao final de `permissions-matrix`;
- e governanca institucional de LGPD fora do codigo.
