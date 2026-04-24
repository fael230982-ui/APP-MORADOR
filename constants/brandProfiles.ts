import type { ImageSourcePropType } from 'react-native';

export type BrandProfile = {
  key: string;
  appName: string;
  shortName: string;
  residentAccessTitle: string;
  marketingLabel: string;
  legalEntityName: string;
  supportEmail: string;
  supportWhatsApp: string;
  siteUrl: string;
  apiBaseUrl: string;
  supportTitle: string;
  supportContextLabel: string;
  notificationChannelPrefix: string;
  storageNamespace: string;
  slug: string;
  scheme: string;
  bundleIdentifier: string;
  androidPackage: string;
  colors: {
    primary: string;
    primaryLight: string;
    primarySoft: string;
    background: string;
    surface: string;
    card: string;
    cardSoft: string;
    border: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    white: string;
    black: string;
    danger: string;
    dangerSoft: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    info: string;
    nav: string;
    shadow: string;
  };
  assets: {
    logo: ImageSourcePropType;
    developerLogo: ImageSourcePropType;
  };
};

export const brandProfiles: Record<string, BrandProfile> = {
  default: {
    key: 'default',
    appName: 'App Morador',
    shortName: 'Morador',
    residentAccessTitle: 'Acesso do morador',
    marketingLabel: 'SEGURANÇA INTELIGENTE',
    legalEntityName: 'Rafiels Soluções',
    supportEmail: 'suporte@rafiels.com.br',
    supportWhatsApp: '5500000000000',
    siteUrl: 'https://rafiels.com.br',
    apiBaseUrl: 'https://api.v8monitoramento.com',
    supportTitle: 'Atendimento ao morador',
    supportContextLabel: 'Equipe Rafiels Soluções',
    notificationChannelPrefix: 'App Morador',
    storageNamespace: 'resident_app',
    slug: 'resident-app',
    scheme: 'residentapp',
    bundleIdentifier: 'com.resident.app',
    androidPackage: 'com.resident.app',
    colors: {
      primary: '#135DFF',
      primaryLight: '#4D86FF',
      primarySoft: '#EAF1FF',
      background: '#F5F7FB',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      cardSoft: '#EEF2F7',
      border: '#E1E7F0',
      text: '#172033',
      textMuted: '#667085',
      textSubtle: '#98A2B3',
      white: '#FFFFFF',
      black: '#000000',
      danger: '#D92D20',
      dangerSoft: '#FEE4E2',
      success: '#16A34A',
      successSoft: '#DCFCE7',
      warning: '#F59E0B',
      warningSoft: '#FEF3C7',
      info: '#475467',
      nav: '#FFFFFF',
      shadow: '#101828',
    },
    assets: {
      logo: require('../assets/brands/default/logo.png') as ImageSourcePropType,
      developerLogo: require('../assets/brands/default/developer-logo.png') as ImageSourcePropType,
    },
  },
  cliente_a: {
    key: 'cliente_a',
    appName: 'Cliente A Residencial',
    shortName: 'Cliente A',
    residentAccessTitle: 'Portal do morador',
    marketingLabel: 'SEGURANCA INTELIGENTE',
    legalEntityName: 'Cliente A Tecnologia Ltda',
    supportEmail: 'suporte@clientea.com',
    supportWhatsApp: '5511999999999',
    siteUrl: 'https://clientea.com',
    apiBaseUrl: 'https://api.clientea.com',
    supportTitle: 'Atendimento ao morador',
    supportContextLabel: 'Equipe de atendimento Cliente A',
    notificationChannelPrefix: 'Cliente A',
    storageNamespace: 'cliente_a',
    slug: 'cliente-a',
    scheme: 'clientea',
    bundleIdentifier: 'com.clientea.app',
    androidPackage: 'com.clientea.app',
    colors: {
      primary: '#0F766E',
      primaryLight: '#14B8A6',
      primarySoft: '#CCFBF1',
      background: '#F3FAF8',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      cardSoft: '#EFFCF9',
      border: '#CFE9E4',
      text: '#12302B',
      textMuted: '#53736D',
      textSubtle: '#86A39D',
      white: '#FFFFFF',
      black: '#000000',
      danger: '#B42318',
      dangerSoft: '#FEE4E2',
      success: '#15803D',
      successSoft: '#DCFCE7',
      warning: '#B45309',
      warningSoft: '#FEF3C7',
      info: '#0F766E',
      nav: '#FFFFFF',
      shadow: '#0B3B35',
    },
    assets: {
      logo: require('../assets/brands/cliente_a/logo.png') as ImageSourcePropType,
      developerLogo: require('../assets/brands/cliente_a/developer-logo.png') as ImageSourcePropType,
    },
  },
};
