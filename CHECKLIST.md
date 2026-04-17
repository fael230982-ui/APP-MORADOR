# Checklist Do Modulo

Data de atualizacao: `2026-04-17`

## Governanca

- [x] revisar segredos, tokens, chaves, `.env` e credenciais antes do primeiro push
- [x] bloquear arquivos sensiveis no `.gitignore`
- [x] preservar autoria e documentacao do projeto
- [x] nao publicar credenciais no historico
- [x] executar validacao minima antes de publicar
- [x] manter `CHECKLIST.md` atualizado no modulo

## Evidencias desta rodada

- `.env` bloqueado no `.gitignore`
- `sapinhoteste-96ca6-firebase-adminsdk-fbsvc-92186929c5.json` bloqueado no `.gitignore`
- logs locais do Expo bloqueados no `.gitignore`
- autoria registrada em `AUTHORS.md` e `AUTHORSHIP.md`
- documentacao minima criada: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
- templates adicionados em `.github/`
- validacao minima executada:
  - `npm run lint`

## Observacoes

- antes de futuros pushes, repetir a revisao de segredos se entrarem novos arquivos locais
- qualquer credencial adicionada por engano deve ser removida do versionamento antes do commit
