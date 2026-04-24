# Roadmap App Morador - Plataformas e Assistentes

Data: 23/04/2026

## Objetivo

Registrar direcao de produto para tres temas levantados para o `App Morador`:

1. suporte a `Android Auto` e `Apple CarPlay`;
2. integracao com `Alexa` e caixas de assistente pessoal para avisos sonoros;
3. integracao futura com automacao residencial vinculada ao ecossistema do assistente.

## Parecer Consolidado

### 1. App no Android Auto e no CarPlay

Parecer: faz sentido como extensao do `App Morador`, mas com escopo reduzido.

O que faz sentido no carro:

- ouvir alertas criticos;
- ouvir avisos de encomenda e chegada de visitante;
- acionar leitura de notificacoes recentes;
- disparar acoes simples e seguras por voz, como:
  - "ligar para a portaria";
  - "abrir minhas mensagens";
  - "ler ultimo alerta";
  - "avisar chegada assistida", se houver fluxo seguro e confirmado.

O que nao faz sentido no carro:

- cadastro completo de pessoas;
- edicao de perfil;
- visualizacao de cameras;
- formularios extensos;
- qualquer fluxo que exija muita digitacao ou leitura detalhada.

Direcao recomendada:

- tratar `Android Auto` e `CarPlay` como canal de notificacao e acoes curtas;
- nao tentar portar o app inteiro para o painel do carro;
- priorizar comandos de voz, resumo da unidade e alertas de alto valor.

Conclusao:

`Sim`, vale entrar no roadmap do mesmo app, mas como `experiencia complementar automotiva`, nao como novo app principal.

### 2. Integracao com Alexa para aviso sonoro

Parecer: faz muito sentido e tem alto valor pratico.

Casos de uso fortes:

- "encomenda chegou para a unidade X";
- "visitante aguardando liberacao";
- "alerta de seguranca na unidade";
- "nova mensagem da portaria".

Modelo mais coerente:

- o backend dispara um evento;
- o morador escolhe os canais permitidos;
- `Alexa` ou outro assistente reproduz aviso sonoro em casa;
- o app continua sendo o centro de configuracao da preferencia.

Pontos importantes:

- consentimento explicito do morador;
- granularidade por tipo de evento;
- janela de silencio;
- controle por unidade e por dispositivo;
- logs de integracao;
- compatibilidade futura com Google Home e similares.

Conclusao:

`Sim`, esse item deveria entrar no roadmap com prioridade maior que carro, porque entrega valor util real mais cedo.

### 3. Automacao residencial via Alexa integrada ao nosso app

Parecer: faz sentido no longo prazo, mas exige cuidado de escopo.

Exemplos que fazem sentido:

- acionar rotina de chegada;
- acender luz da entrada;
- abrir automacoes vinculadas a visita esperada;
- integrar modo ausencia com alertas da unidade;
- centralizar status basico de dispositivos conectados.

Riscos:

- o app pode virar um hub domotico generico e perder foco;
- dependencia forte de ecossistemas externos;
- suporte complexo por marca, skill, conta e permissao;
- aumento relevante de responsabilidade operacional.

Direcao recomendada:

- nao tentar competir com a `Alexa`;
- usar o `App Morador` como orquestrador de contexto da unidade;
- integrar rotinas e automacoes de alto valor ligadas a seguranca, chegada, visitas e portaria.

Conclusao:

`Sim`, mas como `fase posterior` e focado em `rotinas contextuais da unidade`, nao em automacao residencial completa.

## Priorizacao Recomendada

### Curto prazo

- desenho de experiencia `Android Auto` e `CarPlay` para leitura de alertas e acoes curtas;
- definicao de superficies permitidas no carro:
  - alertas;
  - mensagens curtas;
  - chegada assistida;
  - contato rapido com a portaria;
- estudo de aderencia tecnica por plataforma.

### Medio prazo

- mapa de eventos para notificacoes sonoras;
- preferencias por canal;
- prova de conceito de avisos sonoros via assistente;
- configuracao do assistente pelo app;
- historico de entregas e falhas de notificacao.

### Longo prazo

- automacao contextual da unidade;
- rotinas de chegada, ausencia e visita;
- integracao com mais de um ecossistema:
  - Alexa;
  - Google Home;
  - outros hubs suportados;
- comandos de voz com confirmacao segura para acoes sensiveis.

## Recomendacao Final

Entre os tres temas, a ordem mais pragmatica para o `App Morador` e:

1. `Android Auto` e `CarPlay` com experiencia reduzida;
2. `Alexa` e assistentes para avisos sonoros;
3. automacao residencial integrada ao contexto da unidade.

O motivo e simples:

- `carro` pede menos integracao externa e pode nascer com escopo mais controlado;
- `avisos sonoros` dependem mais de ecossistema externo, conta vinculada e governanca de eventos;
- `automacao residencial` e poderosa, mas amplia muito o escopo e deve entrar depois.
