# Cache Local E Expurgo - App Morador

Data de referencia: `2026-04-12`

## Objetivo

Registrar a politica local minima de cache, limpeza e reducao de permanencia de dados no `app-morador` enquanto o ecossistema ainda nao publicou uma politica canonica unica de `TTL`, `retencao` e `expurgo`.

## Ajustes Aplicados

- limpeza automatica de historico local de notificacoes antigas;
- poda de lista local de alertas resolvidos;
- poda de ids locais de visitas ja notificadas;
- poda conservadora do cadastro local em modo `mock`, removendo registros inativos/expirados muito antigos e limitando o historico de edicoes por registro;
- limpeza de estado sensivel no logout:
  - status facial local;
  - cache de registro do dispositivo;
  - ids locais de alertas resolvidos.
  - ids locais de visitas ja notificadas.

## Onde Foi Aplicado

- [services/localDataGovernance.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/localDataGovernance.ts)
- [services/localAlertState.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/localAlertState.ts)
- [services/facialStatus.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/facialStatus.ts)
- [services/visitForecasts.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/visitForecasts.ts)
- [store/useAuthStore.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/store/useAuthStore.ts)
- [app/_layout.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/_layout.tsx)
- [utils/peopleRegistry.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/peopleRegistry.ts)

## Regra Local Atual

- notificacoes locais antigas: `30 dias`;
- ids locais de alerta resolvido: manter somente os mais recentes;
- ids locais de visitas notificadas: manter somente os mais recentes;
- cadastro local em modo `mock`: remover registros `INATIVO` ou `EXPIRADO` muito antigos e limitar historico local de alteracoes por registro;
- estado facial local: limpar no logout;
- cache local de registro de dispositivo: limpar no logout.
- ids locais de visitas notificadas: limpar no logout.

## Observacao

Esta politica ainda e local e conservadora.

Ela deve ser substituida ou refinada quando o `backend` publicar:

- validade oficial de cache;
- politica de expurgo;
- reconciliacao offline;
- auditoria oficial de sincronizacao.
