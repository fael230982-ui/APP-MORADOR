# Integracao da API v4.3

Este resumo registra o que mudou no app morador depois da analise da `API Sapinho V4.3`.

## O que a v4.3 acrescentou de relevante para o app morador

O contrato trouxe tres grupos de novidades que impactam o ecossistema:

```text
POST /api/v1/deliveries/ocr-label
POST /api/v1/deliveries/ocr
POST /api/v1/deliveries/photo/upload
POST /api/v1/events/stream/confirm
```

Tambem apareceram campos novos nas respostas de cadastros e acessos previstos:

- `serviceType`
- `serviceCompany`
- `vehiclePlate`

## O que ja foi absorvido no app

O app morador agora preserva e exibe os novos campos textuais quando o backend devolver esses dados:

- [types/person.ts](/C:/Users/Pc Rafa/Desktop/app-morador/types/person.ts)
- [services/persons.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/persons.ts)
- [services/visitForecasts.ts](/C:/Users/Pc Rafa/Desktop/app-morador/services/visitForecasts.ts)
- [app/people/view-person.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/people/view-person.tsx)
- [app/people/visit-detail.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/people/visit-detail.tsx)

Tambem foi atualizada a referencia visivel da versao de contrato em:

- [app/profile/about.tsx](/C:/Users/Pc Rafa/Desktop/app-morador/app/profile/about.tsx)

## O que ainda nao virou fluxo do app

O app morador ainda nao consome diretamente os endpoints novos de OCR e upload de foto de encomenda, porque esse fluxo pertence mais ao lado operacional/portaria do produto. Mesmo assim, a v4.3 e importante porque formaliza no contrato:

- OCR por JSON para etiqueta de encomenda;
- OCR multipart para envio de arquivo;
- upload dedicado de foto de encomenda;
- confirmacao do stream de eventos.

## O que ainda depende do backend em producao

Mesmo com a v4.3 documentada, ainda precisamos confirmar em ambiente real:

- permissao de `MORADOR` para todos os endpoints ja integrados;
- comportamento real do `events/stream` e do `events/stream/confirm`;
- payload final das notificacoes e eventos;
- se os novos campos de prestador e visita ja estao sendo retornados em producao;
- se os endpoints de OCR e foto de encomenda serao usados apenas pela portaria ou tambem por outros clientes.
