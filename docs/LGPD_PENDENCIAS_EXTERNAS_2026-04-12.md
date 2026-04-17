# LGPD - Pendencias Externas Do Ecossistema

Data de referencia: `2026-04-12`

## O Que Precisa Vir De Fora Do App

1. Texto oficial de `Termos de Uso` e `Politica de Privacidade` revisado por responsavel juridico.
2. Definicao de `controlador`, `operador` e `encarregado/DPO`, com canal de contato.
3. Mapa de `base legal` por tratamento:
   - autenticacao e conta;
   - notificacoes operacionais;
   - historico de acesso;
   - cameras e snapshots;
   - biometria facial;
   - visitantes, prestadores e locatarios.
4. Politica de `retencao` e descarte por tipo de dado.
5. Regra oficial de `mascaramento` e de exibicao completa por perfil.
6. Registro do `aceite de termo` no backend com:
   - `userId`
   - `versao`
   - `acceptedAt`
   - `client`
   - `device` ou equivalente
7. Procedimento para atender direitos do titular:
   - acesso
   - correcao
   - eliminacao quando aplicavel
   - oposicao/revisao quando aplicavel
8. Regra oficial para exclusao ou revogacao de `biometria facial`.

## Pedido Objetivo Para Backend

- criar endpoint ou campo oficial para registrar e consultar aceite de termo;
- publicar versao vigente do termo aceita por cada usuario;
- documentar quais payloads contem dados sensiveis;
- documentar prazos e estrategia de exclusao para biometria, fotos e logs.
