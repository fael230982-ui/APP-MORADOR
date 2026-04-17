# API V5.3 - Integracao no App Morador

Data: `2026-04-16`

## Leitura objetiva

A `V5.3` publicou quatro rotas novas em relacao a `V5.2`:

- `GET /api/v1/resident/condominium`
- `GET /api/v1/resident/people/by-cpf`
- `POST /api/v1/operation/people/search-by-photo`
- `GET /api/v1/operation/people/search-by-photo/audit`

Para o `App Morador`, o ganho pratico ficou concentrado nas duas rotas de `resident`.

## Impacto real no app

O app ja estava preparado para consumir:

- `resident/condominium` em `services/residentAppConfig.ts`
- `resident/people/by-cpf` em `services/cpfLookup.ts`

Com a `V5.3`, essas leituras deixam de depender de acordo informal e passam a ter contrato oficial no documento da API.

Tambem entrou um contrato operacional novo para busca de pessoas por foto, com:

- `photoBase64` ou `photoUrl` como entrada;
- `matches` com `confidence`;
- `person` com `faceStatus`, `hasFacialCredential` e unidade;
- `activeVisitForecasts`;
- `possibleDestination`;
- trilha de auditoria em rota propria.

Isso e suficiente para:

- capturar uma foto pelo celular;
- identificar candidatos provaveis;
- mostrar unidade e destino provavel;
- apoiar triagem operacional humana.

Isso ainda nao fecha sozinho o comportamento de `leitor facial`.

Na `V5.3`, a busca por foto nao publica uma rota propria de:

- registrar evento de acesso aprovado;
- negar/liberar passagem;
- abrir porta;
- gravar `access-log` como efeito colateral explicito da busca.

Entao a leitura correta e:

- a `V5.3` ja entrega `identificacao reversa por foto`;
- ela ainda nao entrega, nesse endpoint, o `registro de acesso como leitor facial`.

## Escopo deste modulo

Mesmo com esse contrato novo, o `App Morador` nao vai expor `search-by-photo`.

Essa capacidade fica reservada para:

- `Portaria`
- `Guarita`

## Ajuste aplicado

Foi alinhado o tipo local de `status` de pessoa para aceitar tambem:

- `BLOCKED`

Arquivo:

- `types/person.ts`

Esse valor ja aparece no schema oficial de `PublicPersonResponse` da `V5.3`.

## Conclusao

A `V5.3` nao exigiu refatoracao grande no `App Morador`, mas foi relevante por dois motivos:

1. oficializou duas rotas que o app ja usava;
2. abriu oficialmente a capacidade de `reconhecimento reverso por foto`, que fica fora do escopo deste modulo.

Se a meta de produto for usar o celular como um pseudo `leitor facial`, ainda falta o fechamento do lado do `backend` para transformar a `identificacao` em `decisao e registro de acesso`.
