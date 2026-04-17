# Pendencias do Backend Pos API V5.2

Data: `2026-04-14`

## Estado geral

A `V5.2` resolveu parte importante do backlog do `App Morador`.

Depois dela, o residual do `Backend` ficou menor e mais objetivo.

## Pendencias abertas

### 1. Consulta canônica por CPF

Publicar o endpoint oficial de consulta por `CPF` com retorno mínimo:

- `fullName`
- `birthDate`

Hoje o app mantém fallback defensivo, mas ainda não existe um caminho canônico único.

### 2. Menor de idade e facial

Publicar contrato estruturado para autorização facial de menor, com pelo menos:

- `isMinor`
- `facialConsentGranted`
- `facialConsentGrantedAt`
- `facialConsentGrantedByName`
- `facialConsentGrantedByDocument`
- `facialConsentSource`

### 3. Regra oficial de bloqueio facial

Bloquear envio ao facial quando:

- `isMinor = true`
- `facialConsentGranted != true`

### 4. OCR documental com data de nascimento

Confirmar oficialmente como o ecossistema deve usar:

- `suggestedBirthDate`
- `birthDateCandidates`

Pontos a fechar:

- se isso é apenas apoio visual;
- se pode preencher formulário automaticamente;
- qual campo vence quando houver múltiplas datas candidatas.

### 5. Política LGPD institucional mais ampla

O contrato técnico melhorou, mas ainda falta fechar institucionalmente:

- política global de versão vigente do ecossistema por endpoint próprio;
- política corporativa de auditoria legal ampliada;
- retenção oficial do histórico de aceite por dispositivo.

## Conclusao

Depois da `V5.2`, o `App Morador` ficou bem melhor alinhado.

As pendências que sobraram agora são pequenas em número, mas importantes em `LGPD`, `menores`, `facial` e `CPF`.
