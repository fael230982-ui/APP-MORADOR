export type BrandProfileConfig = {
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
};

export const brandProfilesConfig: Record<string, BrandProfileConfig> = {
  default: {
    key: 'default',
    appName: 'V8 Monitoramento',
    shortName: 'V8',
    residentAccessTitle: 'Acesso do morador',
    marketingLabel: 'AI GUARDIAN',
    legalEntityName: 'V8 Monitoramento e Seguranca',
    supportEmail: 'suporte@v8monitoramento.com',
    supportWhatsApp: '5500000000000',
    siteUrl: 'https://v8monitoramento.com',
    apiBaseUrl: 'https://api.v8monitoramento.com',
    supportTitle: 'Atendimento ao morador',
    supportContextLabel: 'Equipe de atendimento e operacao',
    notificationChannelPrefix: 'Monitoramento',
    storageNamespace: 'resident_app',
    slug: 'resident-app',
    scheme: 'residentapp',
    bundleIdentifier: 'com.resident.app',
    androidPackage: 'com.resident.app',
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
  },
};
