# Pendencias Do Backend Apos API V4.6

Data de referencia: `2026-04-13`

## Leitura Executiva

A `V4.6` resolveu parte importante do gap de `LGPD` e `notification-preferences`, mas ainda nao fecha tudo o que o ecossistema precisa para operar com contrato unico e sem adaptacao local defensiva.

## Pendencias Objetivas

### 1. Stream ainda com dupla leitura

Fechar oficialmente:

- `type` x `eventType`
- `timestamp` x `occurredAt`
- quando usar `eventTime`
- quais campos sao obrigatorios por tipo de evento

### 2. Notification preferences ainda insuficiente para granularidade por categoria

Hoje a `V4.6` expoe:

- `channel`
- `priority`

Mas o `app-morador` ja trabalha com preferencia por categoria:

- `alertas`
- `encomendas`
- `visitas`
- `mensagens`
- `cameras`

O backend precisa responder se:

- a preferencia remota ficara global mesmo;
- havera evolucao para `domain` ou `category`;
- ou se a granularidade por categoria seguira sendo apenas local ao aparelho.
- e quais enumeracoes oficiais devem ser usadas para `channel` e `priority` sem deixar string aberta para interpretacao diferente entre modulos.

### 3. Semantica oficial de prioridade remota

Publicar a regra de negocio de:

- `LOW`
- `MEDIUM`
- `HIGH`

E como isso impacta:

- push
- in-app
- email
- som
- urgencia operacional

### 4. Relacao entre notification-preferences e resident notifications

Definir oficialmente:

- se a preferencia remota afeta apenas entrega de canal;
- ou se tambem altera priorizacao dos eventos em `resident notifications`;
- e como isso conversa com `domain`, `snapshotUrl` e `replayUrl`.

### 5. LGPD ainda precisa de confirmacao de governanca

A rota oficial existe, mas ainda falta resposta do backend sobre:

- politica de versionamento de termos;
- estrategia de invalidez quando a versao muda;
- consulta historica de aceite;
- uso do `deviceId` como identificador de aceite por aparelho;
- e relacao entre aceite do app e eventual aceite web.

### 6. Convergencia final de evidencias de midia no stream

A `V4.6` melhorou muito com:

- `snapshotUrl`
- `liveUrl`
- `replayUrl`
- `replayAvailable`

Mas ainda falta fechar:

- contrato minimo por evento com camera;
- expiracao das URLs;
- requisito de autenticacao;
- e regra oficial de fallback entre snapshot, live e replay.

## Encaminhamento Sugerido

Responder item a item, marcando:

- `vigente`
- `alvo`
- `legado temporario`
- `nao sera adotado`
