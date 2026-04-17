# Indice De Compartilhamento - DES-RAFIELS

Data de referencia: `2026-04-12`

Pasta compartilhada oficial:

- `C:\Users\Pc Rafa\Desktop\DES-RAFIELS`

## Objetivo

Esta pasta deve funcionar como ponto oficial de troca entre:

- `Portaria Web`
- `App Morador`
- `Guarita`
- `Backend`

Ela nao substitui a documentacao original de cada projeto.

Ela deve armazenar copias controladas dos documentos aprovados para compartilhamento.

## Regra De Ouro

Os documentos originais continuam vivendo dentro da pasta `docs/` de cada projeto.

A pasta `DES-RAFIELS` guarda apenas copias oficiais para circulacao entre os modulos.

Essas copias devem ficar diretamente na raiz da pasta compartilhada, sem depender de subpastas.

## Regra De Nome

Para evitar conflito entre arquivos com o mesmo titulo funcional, todo documento compartilhado deve começar com o nome do modulo de origem.

Prefixos recomendados:

- `APP_MORADOR_`
- `PORTARIA_`
- `GUARITA_`
- `BACKEND_`
- `ECOSSISTEMA_` apenas quando houver documento oficialmente consolidado entre os modulos

Exemplos:

- `APP_MORADOR_ALINHAMENTO_TECNICO_2026-04-11.md`
- `PORTARIA_PEDIDO_BACKEND_V4_4_GAP_2026-04-12.md`
- `GUARITA_PENDENCIAS_BACKEND_2026-04-12.md`
- `ECOSSISTEMA_CONTRATO_PADRAO_2026-04-11.md`

## Conteudo Recomendado

### 1. Contrato e padrao do ecossistema

Arquivos recomendados:

- `ECOSSISTEMA_VERSAO_OFICIAL_PARA_COMPARTILHAR_2026-04-11.md`
- `ECOSSISTEMA_CONTRATO_PADRAO_2026-04-11.md`
- `ECOSSISTEMA_PARECER_CONSOLIDADO_2026-04-11.md`

### 2. Pendencias para o backend

Arquivos recomendados:

- `ECOSSISTEMA_PENDENCIAS_BACKEND_2026-04-12.md`
- `APP_MORADOR_PENDENCIAS_BACKEND_2026-04-12.md`
- `PORTARIA_PENDENCIAS_BACKEND_2026-04-12.md`
- `GUARITA_PENDENCIAS_BACKEND_2026-04-12.md`

### 3. Leitura da API mais recente

Arquivo recomendado:

- `APP_MORADOR_API_V4_4_INTEGRATION_2026-04-12.md`

Sempre que uma API nova entrar, a versao anterior pode continuar arquivada, mas a mais recente deve ficar evidente.

### 4. Material especifico de cada modulo

Cada projeto pode compartilhar seus documentos tecnicos especificos, desde que o nome deixe claro a origem.

## Padrao De Uso

1. Cada modulo continua produzindo e versionando seu documento original no proprio repositorio.
2. Quando um documento estiver pronto para circulacao, uma copia e enviada para a raiz de `DES-RAFIELS`.
3. A copia deve ter prefixo do modulo de origem e manter data no nome.
4. Se houver revisao, gerar nova versao datada em vez de sobrescrever silenciosamente.
5. Se a mudanca afetar contrato, avisar os tres fronts e o backend.

## Nomes E Origem

Toda copia enviada para `DES-RAFIELS` deve deixar claro:

- modulo de origem;
- data de referencia;
- se e rascunho, parecer, contrato, devolutiva ou versao oficial.

## Observacao Final

Essa pasta deve ser o canal oficial de alinhamento entre os modulos.

Mas a fonte original continua sendo o documento salvo no projeto que o gerou.
