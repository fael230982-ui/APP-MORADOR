# Papeis LGPD Do Ecossistema

Data de referencia: `2026-04-12`

## Objetivo

Estabelecer uma leitura operacional unica para `App Morador`, `Portaria Web`, `Guarita` e `Backend` sobre quem precisa fazer o que para o ecossistema caminhar em conformidade.

Este documento nao substitui definicao juridica formal. Ele organiza responsabilidades tecnicas e operacionais enquanto a definicao oficial final nao e publicada.

## Papeis Tecnicos E Operacionais

### Backend

Responsavel por:

- publicar e sustentar o contrato oficial dos dados tratados;
- persistir `aceite`, `versao aceita` e `acceptedAt` quando esse fluxo existir;
- registrar ou expor metadados de auditoria necessarios;
- documentar payloads com `dados sensiveis`;
- aplicar ou orientar regra de retencao, descarte e compatibilidade.

### App Morador

Responsavel por:

- exibir `termo` e `politica` ao usuario final;
- registrar ciencia local enquanto a persistencia oficial nao existir;
- reduzir exposicao desnecessaria de `documento`, `telefone`, `e-mail` e outros identificadores;
- tratar biometria facial de forma conservadora;
- refletir no app a versao aceita e os textos vigentes.

### Portaria Web

Responsavel por:

- aplicar minimizacao em telas operacionais e administrativas;
- restringir exibicao completa por perfil e contexto;
- manter trilha de governanca documental do modulo;
- alinhar mascaramento e ciencia com o padrao comum do ecossistema.

### Guarita

Responsavel por:

- priorizar exibicao minima em operacao de campo;
- tratar `codigo de retirada`, `OCR`, `foto de etiqueta`, `evidencias` e `facial` com criterio reforcado;
- reduzir exposicao em telas de consulta rapida;
- alinhar comportamento offline com a mesma diretriz de minimizacao e expurgo.

## Papeis Que Precisam De Definicao Formal Externa

Os pontos abaixo dependem de decisao de negocio e juridico:

- `controlador`;
- `operador`;
- `encarregado/DPO`;
- base legal por tipo de tratamento;
- politica oficial de retencao e descarte;
- regra oficial para consentimento especifico em facial, se aplicavel.

## Regra Provisoria De Trabalho

Enquanto a definicao juridica final nao for publicada:

- os tres fronts devem adotar `minimizacao por padrao`;
- o `backend` deve ser tratado como fonte oficial quando publicar contrato estavel;
- nenhum modulo deve ampliar exibicao de dado sensivel sem necessidade operacional clara;
- biometria, OCR, imagem, snapshots, evidencias e documentos devem seguir criterio mais restritivo.

## Saida Esperada

O proximo passo ideal do ecossistema e transformar este alinhamento operacional em:

1. texto juridico oficial;
2. contrato tecnico oficial do backend;
3. politica canonica de mascaramento por perfil;
4. politica oficial de retencao e descarte.
