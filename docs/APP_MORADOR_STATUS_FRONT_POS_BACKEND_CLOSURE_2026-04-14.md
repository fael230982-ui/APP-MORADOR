# App Morador - Status Do Front Pos Fechamento Do Backend

Data: `2026-04-14`

## Objetivo

Registrar, de forma objetiva, o que do fechamento informado pelo `Backend`:

- ja esta atendido no `App Morador`;
- ja esta parcialmente atendido;
- ainda resta como acabamento ou consolidacao fina do nosso front.

Este documento nao cobre `Portaria Web` nem `Guarita`.

## Leitura consolidada

O texto do `Backend` condiz com a nossa frente em linhas gerais, mas mistura itens de outros modulos com itens do `App Morador`.

Para o `App Morador`, o quadro atualizado ficou este.

## Ja Atendido No App Morador

### 1. visit-forecasts

No `App Morador`, essa feature ja esta plugada.

Arquivos:

- `services/visitForecasts.ts`
- `app/people/visits.tsx`
- `app/people/visit-detail.tsx`
- `services/residentOverview.ts`

Conclusao:

- nao e pendencia do `App Morador`;
- esse item restante citado pelo `Backend` pertence ao `Portaria Web`.

### 2. OCR documental com birthDate

O `App Morador` ja absorveu a parte de `birthDate` no fluxo de cadastro e esta preparado para usar os dados publicados pelo backend.

Arquivos:

- `types/person.ts`
- `services/persons.ts`
- `app/people/access-form.tsx`

Conclusao:

- `birthDate` ja entrou no contrato local do app;
- o formulario ja esta pronto para esse dado.

### 3. resident/profile como fonte principal da experiencia

O app ja passou a priorizar `resident/profile` no login, no bootstrap de sessao e no refresh visual da experiencia do morador.

Arquivos:

- `hooks/useAuth.tsx`
- `app/_layout.tsx`
- `services/residentProfile.ts`

Conclusao:

- `resident/profile` ja e a fonte principal da experiencia do morador;
- o fallback remanescente ficou apenas como compatibilidade tecnica de contingencia em ponto isolado de refresh.

### 4. enabledModules, residentManagementSettings e slimMode

O `App Morador` ja passou a consumir a configuracao canonica de condominio e usar isso na experiencia principal.

Arquivos:

- `services/residentAppConfig.ts`
- `store/useAuthStore.ts`
- `hooks/useAuth.tsx`
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/_layout.tsx`

Conclusao:

- o app ja respeita a configuracao canonica na tela inicial, no perfil e na navegacao principal;
- acessos, cameras e modo simplificado ja entram na experiencia do morador com base no contrato oficial.

### 5. stream-capabilities como contrato tecnico obrigatorio da camada local

O app ja carrega `stream-capabilities` no bootstrap e usa esse contrato para governar o estado da camada de tempo real.

Arquivos:

- `services/residentCapabilities.ts`
- `services/residentRealtime.ts`
- `app/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx`

Conclusao:

- sem `stream-capabilities`, a camada local entra em estado degradado;
- com `stream-capabilities`, a experiencia passa a reconhecer a preparacao oficial do tempo real.

## Parcialmente Atendido

### 1. resident/profile sem fallback tecnico

Hoje o `App Morador` ja trata `resident/profile` como fonte principal, mas ainda preserva um fallback tecnico pontual para contingencia.

Isso significa:

- direcao canonica ja fechada;
- residual pequeno apenas de endurecimento final do front.

### 2. stream operacional de verdade

O contrato normativo ja e respeitado pela camada local, mas o `App Morador` ainda nao consome um stream operacional residente com SSE ativa em tela.

Isso significa:

- governanca do contrato ja foi absorvida;
- o consumo operacional pleno de stream ainda depende de ser realmente necessario para a experiencia do morador.

## O Que Nao E Pendencia Do App Morador

### 1. visit-forecasts no front

Esse item, do jeito que veio no texto do backend, e pendencia do `Portaria Web`, nao do `App Morador`.

### 2. OCR de encomendas

No `App Morador`, isso nao e frente principal de UX.

O ponto de decisao de autopreenchimento por `confidence` pesa mais para:

- `Portaria Web`
- `Guarita`

No `App Morador`, o OCR relevante desta fase e o documental de pessoas.

## Residual Atual Do App Morador

O que ainda resta no nosso lado agora e fino, nao estrutural:

- decidir se o fallback tecnico de `resident/profile` sera removido por completo;
- expandir o respeito a `enabledModules` e `residentManagementSettings` para eventuais rotas secundarias ainda nao cobertas;
- manter a experiencia textual, visual e LGPD revisada a cada nova API.

## Conclusao

Para o `App Morador`, o fechamento do backend hoje esta majoritariamente absorvido.

O residual do front deixou de ser lacuna de contrato e passou a ser:

- endurecimento final de fonte canonica;
- acabamento de configuracao em rotas secundarias;
- e refinamento continuo da experiencia.

Ou seja:

- nao existe pendencia estrutural forte aberta no `App Morador`;
- o alinhamento com o backend ficou alto;
- o que resta agora e consolidacao fina, nao desbloqueio tecnico.
