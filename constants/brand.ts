import { brandProfiles } from './brandProfiles';

const BRAND_PROFILE_KEY = (process.env.EXPO_PUBLIC_BRAND_PROFILE || process.env.EXPO_PUBLIC_BRAND_VARIANT || 'default')
  .trim()
  .toLowerCase();

const baseProfile = brandProfiles[BRAND_PROFILE_KEY] ?? brandProfiles.default;

const envText = (key: string, fallback: string) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

export const BRAND = {
  profile: baseProfile.key,
  variant: baseProfile.key,
  appName: envText('EXPO_PUBLIC_BRAND_APP_NAME', baseProfile.appName),
  shortName: envText('EXPO_PUBLIC_BRAND_SHORT_NAME', baseProfile.shortName),
  residentAccessTitle: envText('EXPO_PUBLIC_BRAND_RESIDENT_ACCESS_TITLE', baseProfile.residentAccessTitle),
  marketingLabel: envText('EXPO_PUBLIC_BRAND_MARKETING_LABEL', baseProfile.marketingLabel),
  legalEntityName: envText('EXPO_PUBLIC_BRAND_LEGAL_ENTITY', baseProfile.legalEntityName),
  supportEmail: envText('EXPO_PUBLIC_SUPPORT_EMAIL', baseProfile.supportEmail),
  supportWhatsApp: envText('EXPO_PUBLIC_SUPPORT_WHATSAPP', baseProfile.supportWhatsApp),
  siteUrl: envText('EXPO_PUBLIC_SITE_URL', baseProfile.siteUrl),
  apiBaseUrl: envText('EXPO_PUBLIC_API_URL', baseProfile.apiBaseUrl),
  supportTitle: envText('EXPO_PUBLIC_SUPPORT_TITLE', baseProfile.supportTitle),
  supportContextLabel: envText('EXPO_PUBLIC_SUPPORT_CONTEXT_LABEL', baseProfile.supportContextLabel),
  notificationChannelPrefix: envText('EXPO_PUBLIC_NOTIFICATION_CHANNEL_PREFIX', baseProfile.notificationChannelPrefix),
  storageNamespace: envText('EXPO_PUBLIC_STORAGE_NAMESPACE', baseProfile.storageNamespace),
  slug: envText('EXPO_PUBLIC_BRAND_SLUG', baseProfile.slug),
  scheme: envText('EXPO_PUBLIC_BRAND_SCHEME', baseProfile.scheme),
  bundleIdentifier: envText('EXPO_PUBLIC_BRAND_BUNDLE_ID', baseProfile.bundleIdentifier),
  androidPackage: envText('EXPO_PUBLIC_BRAND_ANDROID_PACKAGE', baseProfile.androidPackage),
  logo: baseProfile.assets.logo,
  developerLogo: baseProfile.assets.developerLogo,
} as const;

export function getBrandCopyrightLabel(year: number = new Date().getFullYear()) {
  return `© ${year} ${BRAND.appName}. Todos os direitos reservados.`;
}
