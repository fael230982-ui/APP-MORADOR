# Backlog Tecnico - Plataformas e Assistentes

Data: 23/04/2026

## MVP 1 - Android Auto e CarPlay

- mapear quais telas e acoes podem existir no carro sem ferir restricoes de plataforma;
- definir experiencia minima:
  - leitura de alertas;
  - leitura de mensagens curtas;
  - chegada assistida;
  - contato rapido com a portaria;
- revisar suporte real de `Expo` e dependencias nativas necessarias;
- validar requisitos de permissao, notificacao e comando por voz;
- desenhar modelo de navegacao automotiva separado da navegacao principal do app;
- listar eventos do backend que precisam de payload compacto para uso no carro.

Dependencias:

- estrategia mobile nativa para `Android Auto` e `CarPlay`;
- definicao de fluxos permitidos juridica e operacionalmente;
- aprovacao de UX para contexto automotivo.

## MVP 2 - Avisos sonoros com Alexa e similares

- modelar eventos elegiveis:
  - encomenda;
  - visitante;
  - alerta;
  - mensagem relevante;
- definir preferencia por canal no app;
- criar estrutura de consentimento do morador;
- desenhar payload de notificacao sonora para integracao externa;
- registrar falhas, tentativas e historico de entrega;
- prever suporte futuro para mais de um assistente.

Dependencias:

- backend de eventos;
- integracao com provedor externo;
- conta vinculada do morador;
- politica de privacidade e consentimento.

## Fase 3 - Automacao residencial contextual

- mapear automacoes de alto valor ligadas a unidade;
- desenhar rotinas:
  - chegada;
  - ausencia;
  - visita;
  - alerta;
- limitar o escopo a orquestracao contextual e nao a automacao generica;
- definir comandos sensiveis que exigem confirmacao;
- prever integracao com mais de um ecossistema.

Dependencias:

- conta vinculada a assistente;
- catalogo de dispositivos suportados;
- backend de rotinas e auditoria;
- modelo de permissao por unidade e morador.

## Ordem Recomendada

1. Android Auto e CarPlay
2. Avisos sonoros com Alexa e similares
3. Automacao residencial contextual
