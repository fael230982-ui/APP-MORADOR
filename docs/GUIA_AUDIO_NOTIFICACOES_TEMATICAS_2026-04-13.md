# Guia de Audio para Notificacoes Tematicas

Este documento define o padrao inicial de audio para notificacoes do `App Morador`.

## Objetivo

Cada categoria pode usar um audio proprio, curto e facilmente reconhecivel, sem depender apenas do som padrao do aparelho.

## Categorias

- `Encomendas`
  - arquivo: `delivery_arrived.wav`
  - sugestao: buzina curta de moto + voz `Entrega`

- `Visitas`
  - arquivo: `visit_arrived.wav`
  - sugestao: duas buzinas curtas de carro + voz `Visita`

- `Alertas`
  - arquivo: `security_alert.wav`
  - sugestao: sirene curta ou bip critico + voz `Alerta`

- `Mensagens`
  - arquivo: `operation_message.wav`
  - sugestao: toque curto + voz `Mensagem`

- `Cameras`
  - arquivo alvo recomendado: `camera_event.wav`
  - sugestao: bip eletronico de monitoramento + voz `Camera`
  - observacao: hoje a categoria ainda reutiliza `operation_message.wav`

## Regras de producao

- duracao alvo: `1,0s` a `2,5s`
- iniciar o audio sem silencio longo
- evitar volumes muito agressivos
- manter a voz curta, objetiva e clara
- preferir `wav`
- evitar musicas de fundo

## Proximo passo tecnico

Quando os audios finais estiverem prontos, eles devem ser colocados em:

- `assets/sounds/`

Depois disso, o app pode apontar cada categoria para seu arquivo definitivo.
