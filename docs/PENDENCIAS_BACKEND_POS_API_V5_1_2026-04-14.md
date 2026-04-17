# Pendencias do Backend Pos API V5.1

## Estado geral

A `V5.1` fechou a parte mais importante de `pânico` e `entrada assistida`.

No `App Morador`, o principal residual agora ficou concentrado em:

- `CPF`
- `menores`
- `facial`
- leitura oficial de incidente ativo
- georreferencia oficial do condominio

## Pendencias abertas

### 1. Consulta por CPF

Publicar o endpoint canonico de consulta por CPF com retorno minimo:

- `fullName`
- `birthDate`

### 2. Data de nascimento publica

Publicar `birthDate` no contrato publico de:

- visitante
- prestador
- visita prevista, quando aplicavel

### 3. Menor de idade e facial

Publicar contrato estruturado de autorizacao facial para menor, com pelo menos:

- `isMinor`
- `facialConsentGranted`
- `facialConsentGrantedAt`
- `facialConsentGrantedByName`
- `facialConsentGrantedByDocument`
- `facialConsentSource`

### 4. Regra de bloqueio no backend

Bloquear envio ao facial quando:

- `isMinor = true`
- `facialConsentGranted != true`

### 5. Incidente ao vivo do morador

Publicar leitura oficial para:

- incidente ativo atual do morador
- historico de incidentes do morador

Hoje o app ja consegue abrir o incidente oficial, mas ainda nao tem uma rota canonica para reidratar esse estado depois.

### 6. Georreferencia oficial do condominio

Publicar origem oficial para pre-validacao local:

- latitude do centro do condominio
- longitude do centro do condominio
- raio de panico
- raio de entrada assistida

Hoje o app ainda usa `env` para isso.

### 7. LGPD institucional mais ampla

A `V5.1` publicou `lgpd-policy`, mas ainda resta definir institucionalmente:

- historico versionado completo;
- endpoint oficial da versao vigente global do ecossistema;
- politica corporativa ampliada de auditoria legal.
