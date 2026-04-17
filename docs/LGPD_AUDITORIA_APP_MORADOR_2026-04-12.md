# LGPD - Auditoria Inicial Do App Morador

Data de referencia: `2026-04-12`

## Objetivo

Registrar o que o `app-morador` ja consegue enderecar localmente em privacidade e o que ainda depende de definicao externa entre `produto`, `backend`, `operacao` e `juridico`.

## Ajustes Aplicados Nesta Rodada

- mascaramento parcial de `documento`, `telefone` e `e-mail` em telas onde o dado completo nao e essencial;
- aceite de termo no primeiro acesso com registro versionado local;
- exposicao de `Termos de Uso` e `Politica de Privacidade` dentro do app;
- links legais tambem nas telas de login;
- exibicao da versao aceita no menu de privacidade do perfil;
- reforco de minimizacao no fluxo de suporte.
- manutencao local de expurgo para reduzir permanencia de dados sensiveis no aparelho.
- mascaramento de telefone nos logs locais de lembretes de WhatsApp.

## Pontos Sensiveis Mapeados No App

- biometria facial;
- foto do morador;
- documento de visitante, prestador ou locatario;
- telefone e e-mail;
- historico de acessos e eventos operacionais;
- notificacoes relacionadas a unidade.

## Onde Houve Reducao De Exposicao

- [components/PersonCard.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/PersonCard.tsx)
- [app/people/view-person.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/people/view-person.tsx)
- [app/people/visit-detail.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/people/visit-detail.tsx)
- [app/profile/support.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/support.tsx)
- [utils/notificationService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/notificationService.ts)

## Onde O Fluxo De Ciencia Foi Aplicado

- [components/ConsentModal.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/ConsentModal.tsx)
- [store/useAuthStore.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/store/useAuthStore.ts)
- [app/_layout.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/_layout.tsx)
- [app/legal/terms.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/legal/terms.tsx)
- [app/legal/privacy.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/legal/privacy.tsx)
- [app/login.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/login.tsx)
- [app/(auth)/login.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(auth)/login.tsx)
- [app/(tabs)/profile.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(tabs)/profile.tsx)

## Pendencias Externas

- definir `controlador`, `operador` e `encarregado` com texto oficial;
- fechar a `base legal` por tipo de tratamento;
- definir prazo oficial de `retencao`, descarte e anonimização;
- confirmar politica de exclusao de biometria e de fotos;
- definir o que deve ou nao aparecer completo por perfil;
- registrar o aceite tambem no `backend`, e nao apenas localmente no aparelho.
- publicar politica oficial de `TTL`, cache local e expurgo.

## Regra Recomendada

- dado completo so deve aparecer quando houver necessidade operacional clara;
- telas comuns devem priorizar exibicao parcial;
- biometria e documento devem seguir padrao mais conservador que dados de interface comum.
