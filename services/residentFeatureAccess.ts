import type { ResidentAppConfig } from './residentAppConfig';
import { isResidentManagementAllowed, isResidentModuleEnabled } from './residentAppConfig';

export const residentFeatureAliases = {
  access: {
    modules: ['PEOPLE', 'VISITS', 'VISIT_FORECASTS', 'RESIDENT_ACCESS'],
    management: ['visit_forecasts', 'resident_access', 'people_access', 'access_management', 'visitor_management'],
  },
  cameras: {
    modules: ['CAMERAS', 'CAMERA', 'CFTV'],
  },
  deliveries: {
    modules: ['DELIVERIES', 'DELIVERY', 'PACKAGE_ROOM'],
  },
  messages: {
    modules: ['MESSAGES', 'CHAT', 'COMMUNICATION'],
  },
  vehicles: {
    modules: ['VEHICLES', 'VEHICLE'],
  },
} as const;

export type ResidentFeatureKey = keyof typeof residentFeatureAliases;

export function isResidentFeatureEnabled(
  config: ResidentAppConfig | null | undefined,
  feature: ResidentFeatureKey
) {
  const aliases = residentFeatureAliases[feature];
  const moduleEnabled = isResidentModuleEnabled(config, aliases.modules);
  if (!moduleEnabled) return false;
  if ('management' in aliases) {
    return isResidentManagementAllowed(config, aliases.management, true);
  }
  return true;
}
