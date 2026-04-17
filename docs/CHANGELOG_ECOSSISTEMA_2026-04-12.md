# Changelog Do Ecossistema

Data de criacao: `2026-04-12`

## Objetivo

Este arquivo registra mudancas oficiais de contrato, alinhamento, integracao e governanca entre:

- `App Morador`
- `Portaria Web`
- `Guarita`
- `Backend`

Ele deve ser usado como trilha curta de decisao.

Os documentos detalhados continuam existindo em cada projeto.

## Como Registrar

Cada entrada deve informar:

- `data`
- `origem`
- `tema`
- `tipo`
- `mudanca`
- `impacta contrato`
- `quem precisa agir`
- `documento base`

## Tipos Recomendados

- `contrato`
- `api`
- `frontend`
- `backend`
- `governanca`
- `compatibilidade`
- `homologacao`

## Entradas

### 2026-04-16 | App Morador | Leitura objetiva da API V5.3 | api

- `mudanca`: a `V5.3` oficializou `resident/condominium` e `resident/people/by-cpf`, que o `app-morador` ja vinha consumindo por compatibilidade; tambem publicou `operation/people/search-by-photo` com auditoria propria, mas essa capacidade ficou explicitamente fora do escopo do `App Morador`, reservada para `Portaria` e `Guarita`. No app, foi alinhado o tipo local de `status` de pessoa para aceitar `BLOCKED`.
- `impacta contrato`: sim, porque reduz ambiguidade em duas rotas ja usadas pelo app e fecha um desalinhamento de tipo no front.
- `quem precisa agir`: `App Morador` ja ajustou; `Backend` apenas manter o contrato publicado.
- `documento base`: `api-v5.3-integration.md`, `CHECKLIST_HOMOLOGACAO_API_V5_3_2026-04-16.md`

### 2026-04-14 | App Morador | Fechamento do residual de front apos retorno do backend | frontend

- `mudanca`: o `app-morador` passou a refletir a configuracao canonica de condominio/cliente na experiencia principal, consumindo `enabledModules`, `residentManagementSettings` e `slimMode` para ajustar painel inicial, perfil e navegacao por abas; tambem reforcou `resident/profile` como fonte principal da experiencia e passou a tratar `stream-capabilities` como precondicao da camada local de tempo real.
- `impacta contrato`: sim, porque reduz fallback local e aproxima o app do contrato oficial ja arbitrado pelo `backend`.
- `quem precisa agir`: `App Morador` ja aplicou; `Portaria Web` e `Guarita` publicaram leitura convergente do fechamento do backend.
- `documento base`: `APP_MORADOR_STATUS_FRONT_POS_BACKEND_CLOSURE_2026-04-14.md`, `GUARITA_RETORNO_AO_BACKEND_POS_FECHAMENTO_2026-04-14.md`, `PORTARIA_WEB_RETORNO_BACKEND_FECHAMENTO_2026-04-14.md`

### 2026-04-13 | App Morador | Leitura consolidada da API V4.9 | api

- `mudanca`: a `V4.9` confirmou como oficiais os contratos de `resident/profile`, `permissions-matrix`, `effectiveAccess`, `eventType`, `occurredAt`, `clientRequestId`, `syncStatus` e `workflowStatus` operacional de alertas, sem exigir refatoracao grande no `app-morador`.
- `impacta contrato`: sim.
- `quem precisa agir`: `App Morador` ja estava aderente ao essencial; `Backend` ainda precisa fechar especificamente o contrato de `panico`, `entrada assistida`, geofence oficial e rastreio ate a chegada.
- `documento base`: `api-v4.9-integration.md`, `PENDENCIAS_BACKEND_ACOES_MORADOR_2026-04-13.md`

### 2026-04-13 | App Morador | Integracao inicial com API V4.8 e acoes do morador | api

- `mudanca`: a `V4.8` oficializou `alerts/{id}/workflow`, consolidou `workflowStatus` operacional (`NEW`, `ON_HOLD`, `RESOLVED`), reforcou `eventType` e `occurredAt` como canonicos no `stream` e manteve `resident/profile` como fonte canonica do perfil. O `app-morador` absorveu a busca em alertas, leitura de workflow operacional e abriu a nova tela de `acoes rapidas` para `panico` e `entrada assistida`, usando `actions` + geolocalizacao.
- `impacta contrato`: sim.
- `quem precisa agir`: `App Morador` ja implementou a camada local; `Backend` ainda precisa fechar ids de acao, payload oficial, origem da geografia do condominio e rastreio da `entrada assistida`.
- `documento base`: `api-v4.8-integration.md`, `PENDENCIAS_BACKEND_ACOES_MORADOR_2026-04-13.md`

### 2026-04-13 | App Morador | Integracao oficial com API V4.6 em LGPD e notification-preferences | api

- `mudanca`: a `V4.6` publicou `GET/PUT /api/v1/resident/lgpd-consent` e `GET/PUT /api/v1/resident/notification-preferences`; o `app-morador` passou a priorizar a rota oficial de aceite LGPD por aparelho, gerou `deviceId` local estavel e adicionou leitura e gravacao da preferencia remota global de notificacao, preservando no aparelho a granularidade local de sons por categoria.
- `impacta contrato`: sim.
- `quem precisa agir`: `App Morador` ja ajustou; `Backend` ainda precisa arbitrar granularidade remota por categoria, semantica oficial de prioridade e fechamento final do `stream`.
- `documento base`: `api-v4.6-integration.md`, `PENDENCIAS_BACKEND_POS_API_V4_6_2026-04-13.md`

### 2026-04-13 | App Morador | Integracao de unit-residents e base tecnica de reconcile da V4.6 | api

- `mudanca`: o `app-morador` passou a consumir `GET /api/v1/people/unit-residents` para mostrar quantidade e amostra de moradores da unidade ativa no painel e no resumo da unidade; tambem formalizou um servico proprio para `GET /api/v1/internal/sync/reconcile/{client_request_id}`, sem ligar fluxo operacional novo antes da arbitragem oficial do `backend`.
- `impacta contrato`: sim.
- `quem precisa agir`: `App Morador` ja absorveu o ganho seguro; `Backend` ainda precisa fechar `X-Sync-Token`, `syncStatus`, `retryable`, confiabilidade do item reconciliado e estabilidade oficial de `unit-residents`.
- `documento base`: `api-v4.6-integration.md`, `PENDENCIAS_BACKEND_POS_API_V4_6_2026-04-13.md`

### 2026-04-13 | App Morador | Pendencias residuais do backend apos API V4.5 | governanca

- `mudanca`: foi consolidada uma nova pauta objetiva apenas com o que continuou pendente do lado do `backend` depois da absorcao pratica da `V4.5`.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, com validacao cruzada de `App Morador`, `Portaria Web` e `Guarita`.
- `documento base`: `PENDENCIAS_BACKEND_POS_API_V4_5_2026-04-13.md`

### 2026-04-13 | App Morador | Integracao inicial com API V4.5 | api

- `mudanca`: a leitura da `V4.5` confirmou `withdrawalQrCodeUrl` no schema de encomendas, ampliou o contrato de `resident notifications` com `domain`, `replayUrl` e novos tipos oficiais, deixou o schema do `events/stream` mais completo, abriu a rota de `renotify` para encomendas, passou a expor melhor `recipientPersonName` e campos de auditoria de entrega, oficializou a nova semantica de `visitas previstas` com `releaseMode` e melhorou a triagem visual de notificacoes com midia associada.
- `impacta contrato`: sim.
- `quem precisa agir`: `App Morador` ja ajustou `resident notifications` e `renotify` de encomendas; `Backend`, `Portaria Web` e `Guarita` ainda precisam convergir na leitura final de `stream`, `deliveryRenotification` e nomenclatura semantica.
- `documento base`: `api-v4.5-integration.md`

### 2026-04-12 | App Morador | Teste local e resumo visual de som por categoria | frontend

- `mudanca`: a tela de notificacoes do `app-morador` passou a mostrar o modo atual de cada categoria e ganhou botao de teste rapido, permitindo validar `personalizado`, `padrao` e `silencioso` sem esperar um evento real.
- `impacta contrato`: nao diretamente. E uma melhoria local de experiencia e homologacao.
- `quem precisa agir`: `App Morador` ja aplicou; `Portaria Web` e `Guarita` podem reaproveitar a mesma estrategia de teste local se fizer sentido.
- `documento base`: `ALINHAMENTO_TECNICO_APP_MORADOR_2026-04-11.md`

### 2026-04-12 | App Morador | Preferencias de som evoluidas para tres modos por categoria | frontend

- `mudanca`: o `app-morador` evoluiu as preferencias locais de notificacao para `personalizado`, `padrao` e `silencioso` por categoria, mantendo compatibilidade com a configuracao antiga booleana ja salva no aparelho.
- `impacta contrato`: parcialmente. O comportamento local ja funciona, mas o melhor ganho vem quando o `backend` sincronizar preferencias por conta e publicar categorias de push de forma estavel.
- `quem precisa agir`: `App Morador` ja aplicou; `Backend` pode oficializar persistencia remota; `Portaria Web` e `Guarita` podem reaproveitar a mesma semantica.
- `documento base`: `ALINHAMENTO_TECNICO_APP_MORADOR_2026-04-11.md`

### 2026-04-12 | App Morador | Preferencias locais de som por categoria | frontend

- `mudanca`: o `app-morador` deixou de tratar som personalizado como comportamento fixo e passou a permitir escolha local, por aparelho, para `alertas`, `encomendas`, `visitas`, `mensagens` e `cameras`, com fallback para o som padrao quando a categoria estiver desligada.
- `impacta contrato`: parcialmente. O controle local ja funciona, mas a melhor evolucao depende de o `backend` publicar categorias de push de forma consistente e sincronizar preferencias por conta.
- `quem precisa agir`: `App Morador` ja aplicou; `Backend` pode oficializar categorias e persistencia remota; `Portaria Web` e `Guarita` podem reaproveitar a mesma taxonomia semantica.
- `documento base`: `ALINHAMENTO_TECNICO_APP_MORADOR_2026-04-11.md`

### 2026-04-12 | App Morador | Expurgo ampliado para visitas notificadas e cadastro local mock | compatibilidade

- `mudanca`: o `app-morador` passou a podar ids locais de visitas ja notificadas, limpar esse armazenamento no logout e aplicar expurgo conservador no cadastro local usado em `mock`, incluindo limite de historico por registro.
- `impacta contrato`: sim, porque reforca a necessidade de uma politica oficial de `TTL`, `retencao`, `cache local` e `expurgo` no ecossistema.
- `quem precisa agir`: `Backend`, `Portaria Web`, `Guarita` e `App Morador`.
- `documento base`: `CACHE_LOCAL_E_EXPURGO_APP_MORADOR_2026-04-12.md`, `OFFLINE_E_PRIVACIDADE_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | App Morador | Manutencao local de cache e expurgo | compatibilidade

- `mudanca`: o `app-morador` passou a executar manutencao local de dados persistidos, com limpeza de notificacoes antigas, poda de alertas resolvidos e remocao de estado sensivel no logout.
- `impacta contrato`: sim, porque antecipa uma politica local enquanto `TTL`, cache e expurgo oficiais ainda nao foram publicados pelo ecossistema.
- `quem precisa agir`: `Backend`, `Portaria Web`, `Guarita` e `App Morador`.
- `documento base`: `CACHE_LOCAL_E_EXPURGO_APP_MORADOR_2026-04-12.md`, `OFFLINE_E_PRIVACIDADE_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Portaria Web | Pendencias de backend para offline e sync | governanca

- `mudanca`: o `Portaria Web` publicou pauta objetiva para `idempotencia`, `replay`, `conciliacao offline`, `sync` e aceite LGPD no backend.
- `impacta contrato`: sim, porque formaliza necessidades de `clientRequestId`, endpoint de conciliacao, resposta idempotente e persistencia oficial de aceite.
- `quem precisa agir`: `Backend`, com validacao cruzada dos tres fronts.
- `documento base`: `PORTARIA_WEB_PENDENCIAS_BACKEND_OFFLINE_SYNC_2026-04-12.md`

### 2026-04-12 | Guarita | Offline parcial com impacto em privacidade e cache | governanca

- `mudanca`: o `Guarita` publicou plano de modo offline confirmando cache local, fila e sincronizacao posterior, o que aumenta a necessidade de regra oficial de retencao, validade do cache e expurgo.
- `impacta contrato`: sim, porque envolve dados locais, reconciliacao e definicao do que pode ser espelhado no aparelho com seguranca.
- `quem precisa agir`: `Backend`, `Guarita`, `App Morador`, `Portaria Web` e responsavel juridico/operacional.
- `documento base`: `GUARITA_MODO_OFFLINE_PLANO_2026-04-12.md`, `OFFLINE_E_PRIVACIDADE_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | App Morador | Regra local de exibicao minima de dados | compatibilidade

- `mudanca`: o `app-morador` formalizou contextos locais de exibicao completa versus parcial para `perfil do proprio morador`, `operacao do proprio morador`, `resumo compartilhado`, `exportacao de suporte` e `listas operacionais`.
- `impacta contrato`: sim, porque antecipa uma politica local enquanto o ecossistema ainda nao publicou regra canonica unica de mascaramento por perfil.
- `quem precisa agir`: `Portaria Web`, `Guarita` e `Backend` devem convergir para regra compartilhada.
- `documento base`: `REGRA_LOCAL_EXIBICAO_DADOS_APP_MORADOR_2026-04-12.md`

### 2026-04-12 | App Morador | Camada preparada para aceite oficial no backend | compatibilidade

- `mudanca`: o `app-morador` passou a manter aceite local versionado e tambem preparar leitura e persistencia de aceite remoto quando o `backend` publicar a rota oficial, sem quebrar o fluxo atual.
- `impacta contrato`: sim, porque antecipa o contrato minimo de `accepted`, `version` e `acceptedAt`.
- `quem precisa agir`: `Backend` para publicar a rota oficial; `Portaria Web` e `Guarita` podem convergir para o mesmo shape.
- `documento base`: `BACKEND_ACEITE_VERSIONADO_PENDENCIA_TECNICA_2026-04-12.md`, `LGPD_AUDITORIA_APP_MORADOR_2026-04-12.md`

### 2026-04-12 | Guarita | Primeira rodada LGPD com minimizacao operacional | governanca

- `mudanca`: o `Guarita` publicou auditoria inicial e pendencias externas de LGPD, com direcao conservadora para exibicao minima, ocultacao de codigo de retirada e governanca reforcada para facial, OCR, imagem e evidencia.
- `impacta contrato`: sim, porque reforca a necessidade de regra unica de mascaramento, retencao, consentimento facial e aceite oficial no `backend`.
- `quem precisa agir`: `Backend`, `Guarita`, `App Morador`, `Portaria Web` e responsavel juridico/operacional.
- `documento base`: `GUARITA_LGPD_AUDITORIA_INICIAL_2026-04-12.md`, `GUARITA_LGPD_PENDENCIAS_EXTERNAS_2026-04-12.md`

### 2026-04-12 | Portaria Web | Homologacao LGPD com compatibilidade temporaria | governanca

- `mudanca`: o `Portaria Web` registrou homologacao LGPD apontando cobertura inicial de transparencia, ciencia e minimizacao no frontend, mas mantendo dependencia de `backend`, `juridico` e governanca compartilhada para conformidade forte.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, `Portaria Web`, `App Morador`, `Guarita` e responsavel juridico/operacional.
- `documento base`: `PORTARIA_WEB_HOMOLOGACAO_LGPD_2026-04-12.md`

### 2026-04-12 | Portaria Web | Requisitos e backlog LGPD publicados | governanca

- `mudanca`: o `Portaria Web` publicou requisitos minimos de LGPD para o ecossistema e backlog proprio confirmando aceite versionado, minimizacao e dependencia do `backend` para persistencia oficial.
- `impacta contrato`: sim, principalmente em registro oficial de aceite, base legal por fluxo e politica de retencao.
- `quem precisa agir`: `Backend`, `App Morador`, `Guarita`, `Portaria Web` e responsavel juridico/operacional.
- `documento base`: `PORTARIA_WEB_LGPD_REQUISITOS_ECOSSISTEMA_2026-04-12.md`, `PORTARIA_WEB_BACKLOG_LGPD_2026-04-12.md`

### 2026-04-12 | App Morador | Primeira rodada LGPD no frontend | governanca

- `mudanca`: o `app-morador` aplicou aceite versionado de termo no primeiro acesso, reduziu exposicao de documento/telefone/e-mail em telas sensiveis e publicou auditoria inicial de privacidade.
- `impacta contrato`: sim, porque o melhor fechamento depende de registro oficial de aceite no `backend`, base legal por tratamento e regra compartilhada de mascaramento.
- `quem precisa agir`: `App Morador`, `Backend`, `Portaria Web`, `Guarita` e responsavel juridico/operacional.
- `documento base`: `LGPD_AUDITORIA_APP_MORADOR_2026-04-12.md`, `LGPD_PENDENCIAS_EXTERNAS_2026-04-12.md`

### 2026-04-12 | App Morador | Sons personalizados por tipo de notificacao | frontend

- `mudanca`: o `app-morador` passou a classificar notificacoes por perfil sonoro e preparar canais nativos separados para `encomendas`, `visitas`, `alertas`, `mensagens` e `cameras`.
- `impacta contrato`: parcialmente. O funcionamento local ja existe, mas a melhor versao depende de o `backend` publicar tipo/categoria de push de forma consistente.
- `quem precisa agir`: `App Morador` ja aplicou; `Backend` deve enriquecer payloads de push; `Portaria Web` e `Guarita` podem reaproveitar a mesma taxonomia semantica.
- `documento base`: `ALINHAMENTO_TECNICO_APP_MORADOR_2026-04-11.md`

### 2026-04-12 | Guarita | Proposta de captura automatica guiada | governanca

- `mudanca`: o `Guarita` publicou proposta tecnica para um componente reutilizavel de captura guiada com possibilidade futura de captura automatica por qualidade de imagem.
- `impacta contrato`: nao diretamente agora, mas pode impactar padrao visual e capacidade compartilhada entre modulos.
- `quem precisa agir`: `Guarita`, `Portaria Web` e `App Morador` devem avaliar escopo; `Backend` so entra depois da captura para OCR, auditoria e armazenamento.
- `documento base`: `GUARITA_PROPOSTA_CAPTURA_AUTOMATICA_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Portaria Web | Homologacao cruzada com compatibilidade temporaria | homologacao

- `mudanca`: o `Portaria Web` registrou rodada de homologacao cruzada apontando estabilidade local, com divergencia ainda aberta principalmente no contrato do stream e dependencias abertas de `backend` em permissoes, visitas, encomendas, facial, alertas e cameras.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, `Guarita`, `App Morador` e `Portaria Web`.
- `documento base`: `PORTARIA_WEB_HOMOLOGACAO_CRUZADA_ECOSSISTEMA_2026-04-12.md`, `PORTARIA_WEB_CHANGELOG_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Portaria Web | Correcao de encoding em documento compartilhado | governanca

- `mudanca`: o `Portaria Web` registrou correcao do problema de encoding no material compartilhado e republicacao da copia oficial na raiz da `DES-RAFIELS`.
- `impacta contrato`: nao.
- `quem precisa agir`: todos os modulos devem manter o mesmo padrao de acabamento documental.
- `documento base`: `PORTARIA_WEB_CHANGELOG_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Guarita | Homologacao cruzada com compatibilidade temporaria | homologacao

- `mudanca`: o `Guarita` registrou rodada de homologacao cruzada apontando aderencia boa a `V4.4`, mas com dependencias abertas de `backend` em permissoes, stream, alertas, cameras, facial e nomes canonicos.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, `Portaria Web`, `App Morador` e `Guarita`.
- `documento base`: `GUARITA_HOMOLOGACAO_CRUZADA_ECOSSISTEMA_2026-04-12.md`, `GUARITA_DIVERGENCIAS_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Ecossistema | Tensoes confirmadas em permissoes e stream | contrato

- `mudanca`: foi confirmada nos documentos compartilhados a permanencia de formatos mistos de permissao e dupla leitura no stream entre `type`/`eventType` e `timestamp`/`occurredAt`.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, com validacao cruzada dos tres fronts.
- `documento base`: `DECISOES_PENDENTES_DO_ECOSSISTEMA_2026-04-12.md`, `RELATORIO_DIVERGENCIAS_DES_RAFIELS_2026-04-12.md`, `GUARITA_DIVERGENCIAS_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | App Morador | Facial v4.4 | compatibilidade

- `mudanca`: o `app-morador` deixou de tratar upload de foto como sincronizacao completa do facial e passou a aguardar confirmacao oficial do `backend`.
- `impacta contrato`: sim, porque passa a respeitar a tabela oficial de `PublicFaceStatus`.
- `quem precisa agir`: `Portaria Web`, `Guarita` e `Backend` devem manter a mesma semantica.
- `documento base`: `api-v4.4-integration.md`, `ALINHAMENTO_TECNICO_APP_MORADOR_2026-04-11.md`

### 2026-04-12 | Ecossistema | Pendencias consolidadas para backend | governanca

- `mudanca`: foi consolidada uma pauta unica de pendencias para fechamento oficial do `backend`.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, com validacao cruzada de `App Morador`, `Portaria Web` e `Guarita`.
- `documento base`: `PENDENCIAS_BACKEND_ECOSSISTEMA_2026-04-12.md`

### 2026-04-12 | Ecossistema | Pasta DES-RAFIELS como canal oficial | governanca

- `mudanca`: a pasta `DES-RAFIELS` passou a ser o canal oficial de compartilhamento entre os modulos.
- `impacta contrato`: nao diretamente, mas impacta governanca e alinhamento.
- `quem precisa agir`: todos os modulos.
- `documento base`: `INDICE_COMPARTILHAMENTO_DES_RAFIELS_2026-04-12.md`

### 2026-04-12 | Ecossistema | Prefixo obrigatorio no nome dos arquivos compartilhados | governanca

- `mudanca`: os arquivos compartilhados passaram a usar prefixo do modulo de origem no inicio do nome.
- `impacta contrato`: nao.
- `quem precisa agir`: todos os modulos.
- `documento base`: `INDICE_COMPARTILHAMENTO_DES_RAFIELS_2026-04-12.md`

### 2026-04-12 | Ecossistema | Divergencias registradas oficialmente | governanca

- `mudanca`: divergencias encontradas entre os quatro lados foram registradas em documento proprio para resolucao.
- `impacta contrato`: sim.
- `quem precisa agir`: `Backend`, `Portaria Web`, `Guarita` e `App Morador`.
- `documento base`: `RELATORIO_DIVERGENCIAS_DES_RAFIELS_2026-04-12.md`

## Regra De Manutencao

- novas entradas entram no topo das mais antigas quando isso facilitar leitura;
- cada entrada deve ser curta;
- se a mudanca exigir detalhe, o changelog aponta para o documento completo;
- nao transformar este arquivo em ata longa.
# 2026-04-13

- `API Sapinho V4.7` analisada no `App Morador`.
- `resident/devices` passou a ser enviado com `deviceId` e `appVersion`.
- `resident/lgpd-consent` e `resident/notification-preferences` foram ajustados ao escopo formal da `V4.7`.
- `sync/reconcile` passou a absorver `isFinal`, `isApplied`, `syncedAt`, `createdAt` e `updatedAt`.
- leitura do documento [GUARITA_PLANO_WHITELABEL_2026-04-13.md](</C:/Users/Pc Rafa/Desktop/DES-RAFIELS/GUARITA_PLANO_WHITELABEL_2026-04-13.md>) confirmada como convergente com a estrategia adotada no `App Morador`.
- retorno formal do backend recebido com fechamento de `stream`, `reconcile`, `encomendas`, `visitas previstas`, `notification-preferences`, `LGPD`, `unit-residents`, `alertas` e `cameras`.
- `App Morador` removeu `renotify` da UI do morador, alinhou `COMPLETED -> ARRIVED` em visitas, trocou `alertas resolvidos` por `alertas lidos` e adotou a preferencia oficial de midia em cameras.
- `App Morador` elevou o whitelabel para `perfil bundled + override por env`, alinhando a estrategia com o movimento iniciado no `Guarita`.

# 2026-04-14

- `API Sapinho V5.2` analisada no `App Morador`.
- a `V5.2` oficializou leitura de `resident/live-incidents/active` e `resident/live-incidents/history`.
- a `V5.2` publicou `resident/arrival-monitoring/geo-fence` como origem oficial da geografia da unidade.
- a `V5.2` publicou `resident/lgpd-consent/history` por `deviceId`.
- `birthDate` passou a existir no contrato público de `people`.
- `PublicPersonDocumentOcrSuggestionResponse` passou a expor `suggestedBirthDate` e `birthDateCandidates`.
- o `App Morador` criou os serviços `residentLiveIncidents`, `residentGeoFence` e `residentLgpdHistory`.
- `pânico` e `entrada assistida` passaram a reidratar incidente ativo e histórico real, deixando de depender de inferência por `alertas`.
- o formulário `Autorizar acesso` foi regravado em UTF-8 e passou a enviar `birthDate` no `createPerson`.
- foram gerados os documentos `api-v5.2-integration.md` e `PENDENCIAS_BACKEND_POS_API_V5_2_2026-04-14.md`.

- `App Morador` passou a tratar `CPF` como opcional no cadastro de visitante e prestador, com estrutura pronta para consulta automatica quando a rota oficial estiver disponivel.
- o formulario de autorizacao ganhou `data de nascimento`, calculo de idade e bloco conservador para `menor de idade`.
- quando a pessoa for menor, o app passa a registrar a autorizacao de facial do responsavel legal em `observacoes` ate o backend publicar o contrato estruturado.
- foram gerados os documentos `FLUXO_CPF_MENORES_E_FACIAL_APP_MORADOR_2026-04-14.md` e `PENDENCIAS_BACKEND_CPF_MENORES_FACIAL_2026-04-14.md`.
- `API Sapinho V5.1` analisada no `App Morador`.
- `pânico` e `entrada assistida` passaram a usar o contrato oficial de incidente ao vivo do morador, com rotas dedicadas de `start`, `location` e `stop`.
- foram criados os serviços `residentLgpdPolicy` e `residentCapabilities` para absorver `lgpd-policy`, `stream-capabilities` e `sync-capabilities`.
- foram gerados os documentos `api-v5.1-integration.md` e `PENDENCIAS_BACKEND_POS_API_V5_1_2026-04-14.md`.
- a versao legal do app passou a aceitar override dinamico da `lgpd-policy` publicada pelo backend.
- telas de `notificações`, `perfil`, `privacidade`, `consentimento` e `suporte` foram limpas em acentuacao, textos quebrados e alinhamento visual.
