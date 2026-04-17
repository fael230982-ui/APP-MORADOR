# Regra Local De Exibicao De Dados - App Morador

Data de referencia: `2026-04-12`

## Objetivo

Definir a regra local que o `app-morador` passa a seguir enquanto o ecossistema ainda nao fechou uma politica canonica unica de mascaramento por perfil.

## Regra Atual

### 1. Perfil do proprio morador

Contexto: `OWNER_PROFILE`

- pode exibir dado completo quando o proprio titular esta editando ou revisando seus dados da conta;
- exemplos: [app/profile/edit.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/edit.tsx)

### 2. Operacao do proprio morador

Contexto: `OWNER_OPERATION`

- pode exibir dado completo quando o morador precisa efetivamente usar o dado para concluir a propria acao;
- exemplos: codigo de retirada da propria encomenda, QR da propria retirada

### 3. Resumo compartilhado no proprio app

Contexto: `SHARED_SUMMARY`

- deve preferir exibicao parcial de `e-mail`, `telefone` e `documento`;
- objetivo: reduzir exposicao desnecessaria em telas de leitura rapida

### 4. Exportacao ou suporte

Contexto: `SUPPORT_EXPORT`

- deve preferir dado parcial sempre que a identificacao completa nao for essencial para abrir chamado;
- o identificador tecnico da conta pode seguir visivel

### 5. Listas operacionais

Contexto: `OPERATIONAL_LIST`

- deve priorizar `nome`, `unidade`, `tipo` e `status`;
- documento, telefone e e-mail nao devem aparecer completos por padrao

## Observacao Importante

Esta e uma regra local do `app-morador`.

Ela deve ser substituida ou ajustada quando o ecossistema publicar uma politica canonica unica por perfil e por tipo de tela.
