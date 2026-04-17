# App porteiro - encomendas com OCR e cadastro facial

Este documento descreve uma proposta de app simples para a portaria, separado do app morador.

## Objetivo

Permitir que o porteiro registre encomendas rapidamente pelo celular, com foto da etiqueta, leitura automática por OCR, foto do volume e envio de notificação para o morador.

Também deve permitir pré-cadastro ou atualização de face de moradores, visitantes, prestadores e locatários, respeitando aprovação e auditoria.

## Fluxo de encomenda

1. Porteiro abre "Nova encomenda".
2. App tira foto da etiqueta.
3. OCR extrai dados prováveis:
   - nome do destinatário;
   - unidade/casa/apartamento;
   - transportadora;
   - código de rastreio;
   - observações da etiqueta.
4. App mostra os campos preenchidos para conferência.
5. Porteiro tira foto do volume.
6. App envia cadastro da encomenda.
7. Backend grava a encomenda, gera código/QR de retirada e envia push para o app morador com a foto do volume.

## Endpoint recomendado

```text
POST /api/v1/portaria/deliveries
Content-Type: multipart/form-data
```

Campos:

```text
unitId
recipientName
recipientPersonId
deliveryCompany
trackingCode
notes
labelPhoto
packagePhoto
ocrRawText
ocrConfidence
```

Resposta:

```json
{
  "id": "delivery-uuid",
  "recipientUnitId": "unit-uuid",
  "deliveryCompany": "Correios",
  "trackingCode": "AA123456789BR",
  "status": "RECEIVED",
  "photoUrl": "https://...",
  "labelPhotoUrl": "https://...",
  "pickupCode": "123456",
  "qrCodeUrl": "https://...",
  "notificationStatus": "SENT"
}
```

## OCR

Opções técnicas:

- OCR no backend: app envia a foto, backend processa com Google Vision, AWS Textract, Azure Vision, Tesseract ou serviço equivalente.
- OCR no app: possível, mas aumenta complexidade no Expo Go e pode exigir build nativo.

Recomendação: OCR no backend. O app fica mais leve, e o backend consegue evoluir regras de extração sem publicar nova versão do app.

Endpoint opcional para pré-leitura:

```text
POST /api/v1/portaria/ocr/delivery-label
Content-Type: multipart/form-data
```

Resposta:

```json
{
  "rawText": "texto lido da etiqueta",
  "confidence": 0.91,
  "suggestions": {
    "recipientName": "João Silva",
    "unitName": "Casa20",
    "unitId": "unit-uuid",
    "deliveryCompany": "Correios",
    "trackingCode": "AA123456789BR"
  }
}
```

## Notificação para o morador

Ao cadastrar a encomenda, o backend deve enviar push para todos os usuários moradores vinculados à unidade.

Payload sugerido:

```json
{
  "type": "DELIVERY_RECEIVED",
  "deliveryId": "delivery-uuid",
  "unitId": "unit-uuid",
  "title": "Encomenda recebida",
  "body": "A portaria recebeu uma encomenda para sua unidade.",
  "imageUrl": "https://.../package-photo.jpg"
}
```

O app morador já está preparado para listar notificações e abrir o detalhe da encomenda quando receber `deliveryId`.

## Cadastro facial

O app da portaria pode ter uma área "Cadastrar face".

Fluxo sugerido:

1. Buscar pessoa por nome, documento ou unidade.
2. Tirar foto do rosto.
3. Conferir qualidade da imagem.
4. Enviar para backend.
5. Backend armazena, audita e sincroniza com o equipamento facial.

Endpoint recomendado:

```text
POST /api/v1/people/{id}/face
Content-Type: multipart/form-data
```

Campos:

```text
facePhoto
source=PORTARIA_APP
consentAccepted=true
unitId
```

Resposta:

```json
{
  "personId": "person-uuid",
  "faceId": "face-uuid",
  "status": "PENDING_SYNC",
  "quality": {
    "approved": true,
    "score": 0.94
  }
}
```

## Regras de segurança

- Somente usuário `OPERADOR`, `PORTARIA`, `ADMIN` ou equivalente deve acessar o app porteiro.
- Toda ação deve gerar auditoria com usuário, unidade, data/hora, dispositivo e IP.
- O app não deve conversar diretamente com equipamento Intelbras/Bio-T.
- Integração com equipamentos deve ficar no backend.
- Cadastro facial precisa de consentimento e política de retenção.

## MVP recomendado

1. Login do porteiro.
2. Nova encomenda com foto da etiqueta e foto do volume.
3. OCR via backend para sugerir unidade, destinatário e código de rastreio.
4. Conferência manual antes de salvar.
5. Push para morador com foto do volume.
6. Histórico de encomendas recebidas no dia.
7. Cadastro facial simples vinculado a uma pessoa existente.

## Dependências do backend

```text
POST /api/v1/portaria/ocr/delivery-label
POST /api/v1/portaria/deliveries
POST /api/v1/people/{id}/face
GET /api/v1/operation/search?q=<texto>
POST /api/v1/deliveries/{id}/notify
```

Sem esses endpoints, o app pode ter a tela pronta, mas não fecha o fluxo real de OCR, notificação com foto e sincronização facial.
