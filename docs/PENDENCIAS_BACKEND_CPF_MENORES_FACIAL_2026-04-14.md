# Pendencias Backend - CPF, Menores e Facial

## Status Atual

Este bloco deixou de ser pendencia estrutural do backend.

Os contratos relevantes foram publicados ou confirmados:

- `GET /api/v1/resident/people/by-cpf`
- `POST /api/v1/facial/register`
- `minorFacialAuthorization` como contrato estruturado
- bloqueio oficial de facial de menor sem autorizacao
- `birthDate` como base de validacao de maioridade

## O Que Mudou No Front

- o `App Morador` passou a usar a consulta canonica por `CPF`;
- o fluxo de acessos passou a montar `minorFacialAuthorization` de forma estruturada;
- a relacao do responsavel legal entrou como campo explicito no formulario;
- o payload de pessoas e visitas agora pode carregar a autorizacao estruturada de menor.

## O Que Ainda Pode Restar

O residual deixou de ser contrato e passou a ser:

- homologacao real com o backend;
- ajuste fino de UX;
- validacao de cenarios concretos de erro;
- eventual adaptacao se algum campo vier com semantica diferente do esperado em producao.

## Conclusao

Hoje, este tema deve ser tratado como integracao e homologacao do front.

Nao ha mais lacuna estrutural forte de backend registrada neste documento.
