# API V5.2 - Integracao no App Morador

Data: `2026-04-14`

## Leitura objetiva

A `V5.2` fechou quatro pendências importantes para o `App Morador`:

- leitura oficial de `incidentes ao vivo` do morador;
- `geo-fence` oficial da `entrada assistida`;
- `historico de aceite LGPD` por dispositivo;
- `birthDate` no contrato publico de `people`.

Tambem apareceu evolucao em OCR documental, com:

- `suggestedBirthDate`
- `birthDateCandidates`

## Ajustes aplicados no app

### 1. Incidentes ao vivo do morador

O app passou a usar leitura oficial para:

- `GET /api/v1/resident/live-incidents/active`
- `GET /api/v1/resident/live-incidents/history`

Arquivos:

- `services/residentLiveIncidents.ts`
- `services/panic.ts`
- `app/resident-actions.tsx`

O que mudou:

- `pânico` e `entrada assistida` agora conseguem reidratar estado ativo e histórico real;
- o histórico local deixou de depender de inferência por `alertas`;
- a tela de `Ações rápidas` passou a exibir distâncias e bloqueios com base no contrato oficial.

### 2. Geo-fence oficial

O app passou a priorizar:

- `GET /api/v1/resident/arrival-monitoring/geo-fence`

Arquivo:

- `services/residentGeoFence.ts`

O que mudou:

- a validação local da `entrada assistida` agora usa o centro oficial do condomínio quando a API publicar esse dado;
- o fallback por `env` continua existindo apenas como compatibilidade.

### 3. Histórico LGPD por dispositivo

O app passou a absorver:

- `GET /api/v1/resident/lgpd-consent/history`

Arquivo:

- `services/residentLgpdHistory.ts`

Uso atual:

- a tela de `Privacidade` já consegue mostrar a quantidade de registros visíveis para o dispositivo atual.

### 4. Birth date em people

O contrato público de `people` passou a aceitar `birthDate`.

Arquivos:

- `types/person.ts`
- `services/persons.ts`
- `app/people/access-form.tsx`

O que mudou:

- o formulário foi regravado em UTF-8;
- `birthDate` agora entra no `createPerson` quando o tipo for `RESIDENT`;
- a tela mantém `CPF` opcional para `visitante` e `prestador`;
- o fluxo conservador de `menor de idade` foi preservado.

## O que ficou preparado, mas ainda não foi ligado

A `V5.2` enriqueceu OCR documental com:

- `suggestedBirthDate`
- `birthDateCandidates`

O `App Morador` ainda não ativou captura OCR nessa tela, então esse ganho ficou documentado, mas não exposto em UI.

## Conclusao

A `V5.2` foi relevante de verdade para o `App Morador`.

Ela reduziu fallback local em:

- `pânico`
- `entrada assistida`
- `LGPD`
- `cadastro com data de nascimento`

## Pendencias residuais

Ainda sobram pontos no `Backend`:

- endpoint canônico de consulta por `CPF`;
- contrato estruturado para autorização facial de menor;
- bloqueio oficial de facial para menor sem autorização;
- uso explícito de `suggestedBirthDate` e `birthDateCandidates` em fluxo operacional de OCR no morador, se isso entrar no escopo do produto.
