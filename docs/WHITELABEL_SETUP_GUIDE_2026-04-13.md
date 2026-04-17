# Whitelabel Setup Guide

## Objetivo

Este projeto agora opera em modelo `uma marca por build`.

Para gerar uma nova marca:

1. copie [.env.whitelabel.example](/C:/Users/Pc%20Rafa/Desktop/app-morador/.env.whitelabel.example);
2. escolha ou crie um perfil em [brandProfiles.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/brandProfiles.ts);
3. preencha os valores da nova operacao;
4. ajuste os assets da marca em `assets/brands/<perfil>` e, se necessário, cadastre o novo perfil com seus defaults;
4. rode o build com esse ambiente.

## Campos Obrigatorios

- `EXPO_PUBLIC_BRAND_APP_NAME`
- `EXPO_PUBLIC_BRAND_PROFILE`
- `EXPO_PUBLIC_BRAND_SLUG`
- `EXPO_PUBLIC_BRAND_SCHEME`
- `EXPO_PUBLIC_BRAND_BUNDLE_ID`
- `EXPO_PUBLIC_BRAND_ANDROID_PACKAGE`
- `EXPO_PUBLIC_SUPPORT_EMAIL`
- `EXPO_PUBLIC_SITE_URL`
- `EXPO_PUBLIC_STORAGE_NAMESPACE`

## Campos Recomendados

- `EXPO_PUBLIC_BRAND_SHORT_NAME`
- `EXPO_PUBLIC_BRAND_MARKETING_LABEL`
- `EXPO_PUBLIC_BRAND_LEGAL_ENTITY`
- `EXPO_PUBLIC_SUPPORT_WHATSAPP`
- `EXPO_PUBLIC_SUPPORT_TITLE`
- `EXPO_PUBLIC_NOTIFICATION_CHANNEL_PREFIX`
- paleta `EXPO_PUBLIC_COLOR_*`

## Observacoes

- o namespace local de armazenamento deve ser unico por marca;
- `slug`, `scheme`, `bundle id` e `package` nao devem ser reaproveitados entre clientes;
- o projeto agora suporta `perfil bundled + override por env`;
- os defaults de cada marca ficam em [brandProfiles.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/brandProfiles.ts);
- a camada runtime de consumo continua em [brand.ts](/C:/Users/Pc%20Rafa/Desktop/app-morador/constants/brand.ts);
- logos e marcas devem ficar separados por perfil em `assets/brands/<perfil>`;
- o projeto mantem migracao automatica do legado `@v8_*` para a nova chave configurada.
