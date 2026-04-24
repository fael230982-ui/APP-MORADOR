# Checklist LGPD de Publicação do App Morador

Objetivo: separar o que já está coberto no frontend do `App Morador`, o que depende de `backend` e o que depende de `jurídico/governança` antes de publicação.

## 1. Cobertura já existente no frontend

- [x] Exibição de `Termos de Uso` dentro do app.
- [x] Exibição de `Política de Privacidade` dentro do app.
- [x] Links legais também presentes na tela de login.
- [x] Modal de ciência/consentimento antes do uso quando o aceite está pendente.
- [x] Controle de versão aceita no app, com comparação contra a versão vigente.
- [x] Persistência local do aceite para evitar reapresentação indevida.
- [x] Tentativa de persistência oficial do aceite em `GET/PUT /api/v1/resident/lgpd-consent`.
- [x] Leitura da política oficial em `GET /api/v1/resident/lgpd-policy`, quando disponível.
- [x] Leitura de histórico de aceite em `GET /api/v1/resident/lgpd-consent/history`, quando disponível.
- [x] Máscara parcial de documento, telefone e e-mail em contextos que não exigem exibição completa.
- [x] Texto de privacidade com referência a minimização, dados sensíveis e direitos do titular.
- [x] Fluxo de manutenção local para reduzir permanência indevida de dados no aparelho.

## 2. Dependências de backend

- [ ] Garantir que o registro oficial de aceite LGPD esteja estável e auditável no backend.
- [ ] Garantir consistência entre `currentVersion` da política e a versão realmente exigida ao usuário.
- [ ] Publicar contrato estável para revogação, quando suportada.
- [ ] Publicar política oficial de retenção, descarte e histórico de consentimento.
- [ ] Confirmar quais payloads do ecossistema carregam dados sensíveis.
- [ ] Garantir rastreabilidade mínima de aceite com `userId`, `version`, `acceptedAt` e `deviceId` ou equivalente.

## 3. Dependências de jurídico e governança

- [ ] Validar texto final de `Termos de Uso`.
- [ ] Validar texto final de `Política de Privacidade`.
- [ ] Definir formalmente `controlador`, `operador` e `encarregado/DPO`.
- [ ] Publicar canal de contato do titular para solicitações LGPD.
- [ ] Mapear `base legal` por tipo de tratamento.
- [ ] Definir regra oficial de retenção e descarte por tipo de dado.
- [ ] Definir regra oficial de mascaramento e exibição completa por perfil.
- [ ] Definir política oficial para biometria facial, incluindo revogação e exclusão quando aplicável.

## 4. Leitura honesta para publicação

### O que já pode ser afirmado

- O app já explicita privacidade e uso de dados ao usuário.
- O app já possui ciência de termos e política com versionamento.
- O app já aplica minimização em partes do frontend.
- O app já está preparado para trabalhar com endpoints oficiais de consentimento LGPD.

### O que ainda não deve ser afirmado sem ressalva

- Que o produto inteiro está `100% conforme LGPD` apenas com base no frontend.
- Que base legal, retenção, controlador, operador e encarregado estão completamente fechados, se isso ainda não estiver formalizado fora do app.
- Que o fluxo institucional de atendimento ao titular está completo sem validação de backend, operação e jurídico.

## 5. Posição recomendada

Formulação segura para uso interno e comercial:

`O App Morador já possui camada frontend de transparência, ciência, versionamento de aceite e minimização de exposição de dados, com integração aos endpoints oficiais de consentimento. A conformidade plena do ecossistema com a LGPD ainda depende da formalização jurídica e de governança institucional, além da validação dos fluxos oficiais de backend.`

## 6. Referências do projeto

- [components/ConsentModal.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/ConsentModal.tsx)
- [app/legal/terms.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/legal/terms.tsx)
- [app/legal/privacy.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/legal/privacy.tsx)
- [app/_layout.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/_layout.tsx)
- [services/legalAcceptance.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/legalAcceptance.ts)
- [services/residentLgpdPolicy.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentLgpdPolicy.ts)
- [services/residentLgpdHistory.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/services/residentLgpdHistory.ts)
- [utils/privacy.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/privacy.ts)
- [docs/LGPD_AUDITORIA_APP_MORADOR_2026-04-12.md](/C:/Users/Pc%20Rafa/Desktop/app-morador/docs/LGPD_AUDITORIA_APP_MORADOR_2026-04-12.md)
- [docs/LGPD_PENDENCIAS_EXTERNAS_2026-04-12.md](/C:/Users/Pc%20Rafa/Desktop/app-morador/docs/LGPD_PENDENCIAS_EXTERNAS_2026-04-12.md)
