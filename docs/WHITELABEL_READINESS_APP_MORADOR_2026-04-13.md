# Whitelabel Readiness App Morador

## Status

O app esta `pronto para whitelabel por build`.

Isso significa que ele ja suporta uma estrategia profissional de `uma marca por build`, com configuracao central, identidade parametrizada e persistencia local neutra.

## O Que Foi Feito

- identidade de build saiu de `app.json` e foi migrada para [app.config.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/app.config.ts);
- nome, slug, scheme, bundle id e package Android agora podem variar por ambiente;
- branding visual foi centralizado em [constants/brand.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/brand.ts);
- perfis bundled de marca foram centralizados em [constants/brandProfiles.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/brandProfiles.ts);
- tema de cores passou a aceitar variaveis por marca em [constants/colors.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/colors.ts);
- chaves locais deixaram de depender da marca fixa e passaram a usar namespace configuravel em [constants/storage.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/storage.ts);
- leitura de dados antigos foi preservada com migracao automatica das chaves legadas `@v8_*`;
- pontos visiveis de marca foram neutralizados ou parametrizados:
  - [app/login.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/login.tsx)
  - [app/(auth)/login.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/(auth)/login.tsx)
  - [app/profile/about.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/about.tsx)
  - [app/profile/support.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/app/profile/support.tsx)
  - [components/BrandHeader.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/BrandHeader.tsx)
  - [components/Header.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/Header.tsx)
  - [components/NotificationPermissionModal.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/NotificationPermissionModal.tsx)
  - [components/FloatingSOS.tsx](/C:/Users/Pc%20Rafa/Desktop/app-morador/components/FloatingSOS.tsx)
  - [utils/notificationService.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/notificationService.ts)
  - [utils/whatsappShare.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/utils/whatsappShare.ts)

## O Que Isso Resolve

- troca de nome do app sem editar varios arquivos;
- troca de perfil de marca com defaults reutilizaveis;
- troca de identificadores de build por cliente;
- troca de contatos e URLs institucionais;
- troca de cores por marca;
- persistencia local isolada por namespace;
- preparacao para multiplas marcas sem depender da identidade atual da V8.

## Limite Deliberado Da Solucao

O modelo adotado e `uma marca por build`, nao `multi-tenant visual em runtime dentro do mesmo binario`.

Esse limite e intencional. Para este app, ele e o caminho mais seguro para:

- notificacoes;
- deep links;
- aceite LGPD;
- package ids;
- publicacao em loja;
- suporte operacional.

## O Que Falta Apenas Como Operacao

Para publicar uma nova marca, ainda sera necessario fornecer:

- logo da marca;
- icone da loja;
- splash, se desejado;
- nomes oficiais;
- contatos e URLs;
- paleta de cores;
- identificadores de build.

Isso ja nao e falta estrutural do codigo. E so preenchimento de configuracao e assets da nova marca.

## Avaliacao Final

- `customizacao manual por cliente`: pronta
- `whitelabel por build com governanca`: pronto
- `mesmo binario trocando marca em runtime`: nao adotado por escolha arquitetural
