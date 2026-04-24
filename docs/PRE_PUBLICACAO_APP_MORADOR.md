# Pré-publicação do App Morador

Checklist objetivo para a fase final antes de publicar o aplicativo em loja.

## Estado atual

- `Alertas`: pendente de homologação com cenário real.
- `Troca de unidade`: pendente de homologação com conta multiunidade.
- `Câmeras`: funcionamento principal validado; falta revalidar o ajuste de tela cheia no fluxo final.

## Bloqueadores

- [ ] Perfil, foto, telefone e biometria validados em iPhone e Android.
- [ ] Pessoas, visitantes, veículos e acessos validados com conta real.
- [ ] Encomendas com imagem, detalhe e QR validados.
- [ ] Mensagens com envio, leitura e resposta da portaria validadas.
- [ ] Câmeras válidas no escopo do morador quando o backend publicar o vínculo.
- [ ] Notificações, preferências e termos sem regressão.

## Qualidade mínima

- [ ] `npm run lint` sem erros.
- [ ] Textos principais revisados em `Início`, `Pessoas`, `Câmeras`, `Perfil`, `Minha unidade` e `Suporte`.
- [ ] Estados vazios e mensagens de erro humanizados.
- [ ] Diagnósticos locais funcionando para suporte.
- [ ] Sessão, troca de unidade e refresh automático sem oscilação visual.

## Publicação de loja

- [ ] Nome final do app confirmado.
- [ ] Ícone, splash e branding revisados.
- [ ] Permissões de câmera, fotos e localização com textos finais.
- [ ] Política de privacidade final revisada.
- [ ] Screenshots e descrição de loja preparadas.
- [ ] Bundle id e package final revisados.

## Pacote mínimo de loja

- [ ] Nome curto e subtítulo definidos.
- [ ] Descrição curta e descrição completa aprovadas.
- [ ] 5 screenshots de iPhone e 5 de Android separadas por fluxo principal.
- [ ] Política de privacidade publicada em URL final.
- [ ] E-mail e canal de suporte exibidos de forma consistente no app e na loja.

## Pós-publicação

- [ ] Plano de suporte inicial definido.
- [ ] Backlog de versão 2 separado do escopo atual.
- [ ] Monitoramento de erros e feedback do morador organizado.
