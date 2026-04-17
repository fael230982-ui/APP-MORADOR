# Fluxo de CPF, Menores e Facial

## Direcao Atual

- `CPF` de visitante e prestador continua `opcional`;
- quando o `CPF` for informado, o app consulta a rota canonica:
  - `GET /api/v1/resident/people/by-cpf`
- quando houver `birthDate`, o app calcula a idade;
- se a pessoa for menor de idade, o envio ao facial continua `bloqueado por padrao`;
- a liberacao depende de `minorFacialAuthorization`.

## Estado Atual Do App

- o formulario de acesso ja aceita:
  - `CPF opcional`
  - `data de nascimento`
  - identificacao de `menor de idade`
  - autorizacao estruturada do responsavel legal
  - nome do responsavel
  - documento do responsavel
  - relacao com o menor
- o payload local ja monta `minorFacialAuthorization` para cadastro/autorizacao.

## Regra Operacional

- menor de idade sem autorizacao:
  - sem facial
- menor de idade com autorizacao:
  - o front envia a estrutura de autorizacao junto do fluxo
- `birthDate` continua sendo pre-requisito para validar maioridade

## Leitura Atual

Este bloco nao depende mais de publicacao principal do backend.

O trabalho restante e:

- homologar o comportamento em ambiente real;
- revisar mensagens e UX quando houver erro operacional;
- confirmar se o backend persiste exatamente os campos com a mesma semantica esperada pelo front.
