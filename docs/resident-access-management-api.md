# Cadastros de acesso feitos pelo morador

## Objetivo

O app morador deve permitir que um morador vinculado a uma unidade cadastre:

- Outros moradores da mesma unidade.
- Visitantes.
- Prestadores de servico.
- Locatarios.

Tambem deve notificar o morador quando uma visita chegar na portaria e tiver o acesso validado.

## Funcionalidade implementada no app

O app ja possui tela unica de cadastro em:

```text
app/people/access-form.tsx
```

Regras de formulario:

- Morador: nome, documento, telefone, e-mail. Sem validade.
- Visitante: nome, documento, telefone, e-mail, data inicio e data fim.
- Locatario: nome, documento, telefone, e-mail, data inicio e data fim.
- Prestador de servico: nome, documento, telefone, e-mail, tipo de servico, data inicio, data fim, dias da semana autorizados, horario inicial e horario final.

Uso atual da API:

- Morador usa `POST /api/v1/people`.
- Visitante, prestador e locatario usam `POST /api/v1/visit-forecasts`.
- A agenda detalhada do prestador e enviada em `notes`, porque a API v3.5 ainda nao expoe campos estruturados para dias da semana e janela de horario.

## Requisitos para o backend

### 1. Permissao para perfil MORADOR

Permitir que usuario `MORADOR` crie cadastros apenas dentro das unidades de `user.unitIds` ou da unidade enviada em:

```text
X-Selected-Unit-Id: <unitId>
```

O backend deve rejeitar qualquer tentativa de cadastrar pessoa em unidade fora do vinculo do morador.

### 2. Moradores da mesma unidade

Endpoint esperado:

```text
POST /api/v1/people
```

Payload minimo:

```json
{
  "name": "Nome completo",
  "email": "email@exemplo.com",
  "document": "00000000000",
  "documentType": "CPF",
  "phone": "(00) 00000-0000",
  "category": "RESIDENT",
  "unitId": "uuid-da-unidade",
  "unitIds": ["uuid-da-unidade"]
}
```

Regra esperada:

- `MORADOR` pode cadastrar `RESIDENT` somente para a propria unidade.
- Se o novo morador tiver e-mail, o backend pode criar convite de acesso ao app ou deixar pendente para aprovacao.

### 3. Visitante e locatario

Endpoint atual usado:

```text
POST /api/v1/visit-forecasts
```

Payload:

```json
{
  "unitId": "uuid-da-unidade",
  "residentUserId": "uuid-do-morador",
  "visitorName": "Nome completo",
  "visitorDocument": "00000000000",
  "visitorPhone": "(00) 00000-0000",
  "category": "VISITOR",
  "expectedEntryAt": "2026-04-10T00:00:00.000Z",
  "expectedExitAt": "2026-04-10T23:59:00.000Z",
  "notes": "Observacoes opcionais"
}
```

Para locatario, usar:

```json
{
  "category": "RENTER"
}
```

### 4. Prestador de servico

Hoje o app envia a agenda em `notes`. Para ficar correto e pesquisavel, o backend deve aceitar campos estruturados:

```json
{
  "unitId": "uuid-da-unidade",
  "residentUserId": "uuid-do-morador",
  "visitorName": "Nome completo",
  "visitorDocument": "00000000000",
  "visitorPhone": "(00) 00000-0000",
  "category": "SERVICE_PROVIDER",
  "serviceType": "Limpeza",
  "validFrom": "2026-04-10T00:00:00.000Z",
  "validUntil": "2026-05-10T23:59:00.000Z",
  "authorizedWeekdays": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "accessStartTime": "08:00",
  "accessEndTime": "18:00",
  "notes": "Observacoes opcionais"
}
```

Regra esperada na validacao de acesso:

- Bloquear se estiver fora da validade.
- Bloquear se o dia da semana nao estiver autorizado.
- Bloquear se estiver fora do horario.

### 5. Notificacao de chegada validada

Quando a portaria validar a entrada de uma visita/prestador/locatario, o backend deve:

1. Atualizar a previsao com `arrivedAt`.
2. Registrar quem validou em `arrivedByUserId`.
3. Enviar push para o morador responsavel.
4. Preencher `residentNotifiedAt` quando o envio for concluido.

Payload sugerido para push:

```json
{
  "title": "Visita chegou",
  "body": "Nome da pessoa teve o acesso validado na portaria.",
  "data": {
    "type": "VISIT_ARRIVED",
    "visitForecastId": "uuid-da-previsao",
    "unitId": "uuid-da-unidade"
  }
}
```

### 6. Endpoint de consulta para o app

O app ja consegue consultar:

```text
GET /api/v1/visit-forecasts?unitId=<unitId>&limit=100
```

Para perfil `MORADOR`, o backend deve retornar apenas previsoes da propria unidade. Esse endpoint permite fallback local, mas a notificacao correta deve ser enviada pelo backend no momento da validacao.
