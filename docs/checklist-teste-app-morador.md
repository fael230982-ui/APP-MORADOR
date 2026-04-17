# Checklist de teste - App Morador

Use este roteiro no Expo Go depois de recarregar o app.

## Login

- Abrir o app pelo Expo Go.
- Fazer login com usuário morador.
- Confirmar que o teclado não cobre o botão Entrar.
- Confirmar que os logos aparecem alinhados na tela inicial.

## Unidade ativa

- Conferir se a Home mostra a unidade correta.
- Tocar em "Unidade ativa".
- Confirmar que abre a troca de unidade, sem ir para encomendas.
- Selecionar a mesma unidade e voltar para a Home.

## Home

- Conferir se a Home dá prioridade para segurança.
- Conferir números centralizados nos cards.
- Abrir "Minha unidade" e conferir o resumo completo.
- Validar os blocos:
  - Alertas ativos.
  - Acessos previstos.
  - Câmeras.
  - Mensagens.
  - Avisos.
  - Últimos acessos.
- Confirmar que Encomendas aparece como resumo secundário.
- Puxar para atualizar e conferir se a tela não muda de layout.

## Câmeras

- Abrir Câmeras.
- Confirmar que a câmera da unidade aparece.
- Tocar em "Ver ao vivo".
- Confirmar que o vídeo ao vivo toca dentro do app.
- Tocar na imagem ou no vídeo.
- Confirmar que a câmera abre em tela cheia.
- Fechar a tela cheia pelo botão X.
- Tocar em "Atualizar imagem" e confirmar que o fallback de imagem continua funcionando.
- Abrir Suporte pelo botão se necessário.

## Acessos

- Abrir Acessos.
- Conferir a busca por nome ou tipo.
- Abrir "Veículos autorizados".
- Cadastrar um veículo com placa, tipo e dados opcionais.
- Confirmar que o veículo aparece na lista da unidade.
- Bloquear um veículo.
- Confirmar que o contador de bloqueados aumenta.
- Reativar o veículo.
- Remover um veículo de teste, se ele puder ser apagado sem impacto real.
- Tocar em "Quer cadastrar alguém?".
- Confirmar botões:
  - Morador.
  - Visitante.
  - Prestador.
  - Locatário.
- Confirmar que os botões cabem na tela.

## Cadastro de acesso

- Criar um visitante com data de início e fim.
- Criar um prestador com:
  - tipo de serviço;
  - dias da semana;
  - horário inicial;
  - horário final;
  - data de início;
  - data de fim.
- Criar um locatário com data de início e fim.
- Criar um morador sem validade.
- Confirmar se a tela de sucesso aparece.

## Acessos previstos

- Abrir "Acessos previstos".
- Conferir contadores:
  - hoje;
  - futuros;
  - chegaram.
- Testar filtros:
  - Hoje.
  - Futuros.
  - Chegaram.
  - Encerrados.
- Abrir um item e conferir os detalhes.

## Últimos acessos

- Abrir "Últimos acessos".
- Conferir contadores:
  - entradas;
  - saídas;
  - negados.
- Testar filtros.
- Confirmar que a tela mostra apenas registros que já aconteceram.

## Encomendas

- Abrir Encomendas.
- Confirmar que aparecem as 3 encomendas da Casa20.
- Abrir uma encomenda.
- Conferir:
  - transportadora;
  - código de rastreio;
  - data de recebimento;
  - código de retirada, se existir;
  - foto, se existir.

## Mensagens

- Abrir Mensagens.
- Abrir sem unidade selecionada e confirmar que a tela orienta escolher uma unidade.
- Conferir se mensagens da portaria aparecem.
- Enviar uma mensagem de teste se o backend permitir.
- Voltar para a Home e conferir contador.

## Notificações

- Abrir Notificações.
- Testar filtros:
  - Todas.
  - Não lidas.
  - Acessos.
  - Encomendas.
  - Alertas.
- Marcar visíveis como lidas.

## Perfil e suporte

- Abrir Perfil.
- Conferir se parece uma tela de dados da conta, não uma lista técnica.
- Abrir "Preferências de aviso".
- Conferir preferências locais de:
  - alertas críticos;
  - encomendas;
  - resumo semanal.
- Abrir "Biometria facial".
- Conferir se a tela abre corretamente dentro do perfil.
- Abrir Suporte.
- Copiar relatório para suporte.
- Testar botões de problema com câmera, encomenda e acesso.

## Fluxos legados

- Tentar abrir uma rota antiga de cadastro de morador e confirmar redirecionamento para o fluxo atual.
- Tentar abrir uma rota antiga de prestador/visitante/locatário e confirmar redirecionamento para o fluxo atual.
- Tentar abrir a rota antiga de edição de perfil e confirmar redirecionamento para o fluxo atual.
- Se já estiver logado, tentar abrir telas de primeiro acesso e confirmar retorno para o app principal.
