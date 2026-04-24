# Backlog de Correcoes App Morador

Data base: 24/04/2026

## Front

- consolidar o fallback local de perfil para `phone`, `email`, `name` e `photoUri` enquanto `resident/profile` continuar incompleto
- manter a foto local imediatamente visivel apos captura, sem depender de novo save de outros campos
- mostrar estado de entrega das mensagens do morador com linguagem simples:
  - `Aguardando leitura`
  - `Lida pela portaria`
- manter a tela de notificacoes operando com preferencias locais mesmo quando a preferencia remota falhar
- continuar a limpeza de textos antigos com codificacao quebrada sempre que aparecerem em novas telas

## Backend

- publicar `phone` em `GET /api/v1/resident/profile`
- publicar `photoUrl` ou `photoUri` em `GET /api/v1/resident/profile`
- publicar `faceStatus` e `faceUpdatedAt` em `GET /api/v1/resident/profile`
- corrigir `GET /api/v1/resident/notification-preferences`, hoje retornando `500`
- alinhar a fonte de verdade entre `resident/profile` e `people/{id}` para evitar divergencia de dados do mesmo morador

## Produto

- definir se o `App Morador` deve confiar apenas no perfil canonico ou se pode consumir complementarmente dados da pessoa vinculada
- definir qual e o estado esperado de foto logo apos upload:
  - refletir imediatamente no perfil canonico
  - ou assumir consistencia eventual com prazo conhecido
- definir se mensagens enviadas pelo morador devem exibir status de leitura operacional no contrato oficial
- definir se preferencias remotas de notificacao seguem opcionais ou obrigatorias para o modulo

## UX

- continuar refinando `Minha unidade` como hub principal para:
  - pessoas
  - visitantes
  - veiculos
  - encomendas
  - cameras da unidade
- manter `Pessoas` com entrada direta por tipo de cadastro, sem misturar CTA com filtros
- estudar CTA explicito de `Adicionar veiculo` dentro de `Minha unidade`
- revisar pequenos textos de apoio para ficar menos tecnico e mais orientado a acao

## Validacao

- repetir teste real com conta de morador apos correcao do backend em `resident/profile`
- repetir teste real do endpoint de preferencias remotas apos correção do `500`
- validar restart completo do app no celular para confirmar persistencia de telefone e foto
