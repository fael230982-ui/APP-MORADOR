# Offline E Privacidade No Ecossistema

Data de referencia: `2026-04-12`

## Objetivo

Registrar a relacao entre `modo offline`, `cache local`, `fila` e `LGPD` a partir da publicacao do plano de offline do `Guarita`.

## Leitura Consolidada

O plano de `modo offline` do `Guarita` confirma que o ecossistema caminha para manter dados locais no aparelho em cenarios de contingencia.

Isso aumenta a importancia de:

- regra oficial de `retencao`;
- regra oficial de `validade do cache`;
- criterio de `expurgo`;
- limite claro do que pode ser espelhado localmente;
- reconciliacao segura quando a internet voltar.

## Impacto Para O App Morador

Hoje o `app-morador` nao opera com a mesma profundidade offline do `Guarita`, mas deve observar a mesma diretriz:

- cache local so do necessario;
- sem ampliar exposicao de dados sensiveis;
- sem manter dado sensivel por tempo indefinido sem politica oficial;
- preferencia por exibicao parcial em dados nao essenciais.

## Pedido Objetivo Para Backend

1. Definir quais dados podem ser espelhados localmente com seguranca.
2. Definir `TTL` e validade do cache local por tipo de dado.
3. Definir estrategia de expurgo.
4. Definir reconciliacao para operacoes enfileiradas.
5. Definir campos de auditoria minimos para sincronizacao posterior.
