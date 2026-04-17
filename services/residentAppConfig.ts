import api from './api';
import { appDiagnostics } from './appDiagnostics';

export type ResidentAppConfig = {
  condominiumId: string;
  condominiumName: string;
  enabledModules: string[];
  residentManagementSettings: Record<string, boolean>;
  slimMode: boolean;
};

function normalizeResidentAppConfig(raw: any): ResidentAppConfig | null {
  const source = raw?.data ?? raw;
  if (!source?.id) return null;

  return {
    condominiumId: String(source.id),
    condominiumName: String(source?.name ?? 'Condomínio'),
    enabledModules: Array.isArray(source?.enabledModules) ? source.enabledModules.map(String) : [],
    residentManagementSettings:
      source?.residentManagementSettings && typeof source.residentManagementSettings === 'object'
        ? Object.fromEntries(
            Object.entries(source.residentManagementSettings).map(([key, value]) => [String(key), value === true])
          )
        : {},
    slimMode: source?.slimMode === true,
  };
}

export async function getResidentAppConfig(_condominiumId?: string | null): Promise<ResidentAppConfig | null> {
  try {
    const response = await api.get('/api/v1/resident/condominium');
    return normalizeResidentAppConfig(response.data);
  } catch (err: any) {
    const status = err?.response?.status;
    if ([403, 404, 405].includes(status)) return null;
    appDiagnostics.trackError('resident.condominium', err, 'Falha ao consultar resident/condominium').catch(() => undefined);
    throw err;
  }
}

function includesAlias(entries: string[], aliases: string[]) {
  const normalizedEntries = entries.map((item) => item.trim().toLowerCase());
  return aliases.some((alias) => normalizedEntries.includes(alias.trim().toLowerCase()));
}

export function isResidentModuleEnabled(config: ResidentAppConfig | null | undefined, aliases: string[]) {
  if (!config) return true;
  if (!config.enabledModules.length) return true;
  return includesAlias(config.enabledModules, aliases);
}

export function isResidentManagementAllowed(
  config: ResidentAppConfig | null | undefined,
  aliases: string[],
  defaultValue = true
) {
  if (!config) return defaultValue;

  const entries = Object.entries(config.residentManagementSettings);
  if (!entries.length) return defaultValue;

  const matched = entries.find(([key]) => aliases.some((alias) => key.trim().toLowerCase() === alias.trim().toLowerCase()));
  if (!matched) return defaultValue;
  return matched[1] === true;
}
