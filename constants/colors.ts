import { brandProfiles } from './brandProfiles';

const BRAND_PROFILE_KEY = (process.env.EXPO_PUBLIC_BRAND_PROFILE || process.env.EXPO_PUBLIC_BRAND_VARIANT || 'default')
  .trim()
  .toLowerCase();

const baseProfile = brandProfiles[BRAND_PROFILE_KEY] ?? brandProfiles.default;

const envColor = (key: string, fallback: string) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

export const colors = {
  primary: envColor('EXPO_PUBLIC_COLOR_PRIMARY', baseProfile.colors.primary),
  primaryLight: envColor('EXPO_PUBLIC_COLOR_PRIMARY_LIGHT', baseProfile.colors.primaryLight),
  primarySoft: envColor('EXPO_PUBLIC_COLOR_PRIMARY_SOFT', baseProfile.colors.primarySoft),
  background: envColor('EXPO_PUBLIC_COLOR_BACKGROUND', baseProfile.colors.background),
  surface: envColor('EXPO_PUBLIC_COLOR_SURFACE', baseProfile.colors.surface),
  card: envColor('EXPO_PUBLIC_COLOR_CARD', baseProfile.colors.card),
  cardSoft: envColor('EXPO_PUBLIC_COLOR_CARD_SOFT', baseProfile.colors.cardSoft),
  border: envColor('EXPO_PUBLIC_COLOR_BORDER', baseProfile.colors.border),
  text: envColor('EXPO_PUBLIC_COLOR_TEXT', baseProfile.colors.text),
  textMuted: envColor('EXPO_PUBLIC_COLOR_TEXT_MUTED', baseProfile.colors.textMuted),
  textSubtle: envColor('EXPO_PUBLIC_COLOR_TEXT_SUBTLE', baseProfile.colors.textSubtle),
  white: envColor('EXPO_PUBLIC_COLOR_WHITE', baseProfile.colors.white),
  black: envColor('EXPO_PUBLIC_COLOR_BLACK', baseProfile.colors.black),
  danger: envColor('EXPO_PUBLIC_COLOR_DANGER', baseProfile.colors.danger),
  dangerSoft: envColor('EXPO_PUBLIC_COLOR_DANGER_SOFT', baseProfile.colors.dangerSoft),
  success: envColor('EXPO_PUBLIC_COLOR_SUCCESS', baseProfile.colors.success),
  successSoft: envColor('EXPO_PUBLIC_COLOR_SUCCESS_SOFT', baseProfile.colors.successSoft),
  warning: envColor('EXPO_PUBLIC_COLOR_WARNING', baseProfile.colors.warning),
  warningSoft: envColor('EXPO_PUBLIC_COLOR_WARNING_SOFT', baseProfile.colors.warningSoft),
  info: envColor('EXPO_PUBLIC_COLOR_INFO', baseProfile.colors.info),
  nav: envColor('EXPO_PUBLIC_COLOR_NAV', baseProfile.colors.nav),
  shadow: envColor('EXPO_PUBLIC_COLOR_SHADOW', baseProfile.colors.shadow),
};
