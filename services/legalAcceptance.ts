import api from './api';
import type { LegalAcceptanceRecord } from '../constants/legal';
import { appDiagnostics } from './appDiagnostics';
import { getResidentDeviceId } from './deviceIdentity';

type LegalAcceptancePayload = {
  version: string;
  acceptedAt?: string | null;
};

const OFFICIAL_ENDPOINT = '/api/v1/resident/lgpd-consent';

function normalizeAcceptance(raw: any): LegalAcceptanceRecord | null {
  const source = raw?.data ?? raw;
  const accepted = source?.accepted === true || source?.termsAccepted === true || source?.hasAcceptedTerms === true;
  const version = source?.version ?? source?.termsVersion ?? source?.acceptedVersion ?? null;
  const acceptedAt = source?.acceptedAt ?? source?.termsAcceptedAt ?? source?.updatedAt ?? null;

  if (!accepted && !version && !acceptedAt) return null;

  return {
    accepted,
    version: version ? String(version) : null,
    acceptedAt: acceptedAt ? String(acceptedAt) : null,
    userId: source?.userId ? String(source.userId) : null,
    accountId: source?.accountId ? String(source.accountId) : null,
    deviceId: source?.deviceId ? String(source.deviceId) : null,
    scopeType: source?.scopeType ? String(source.scopeType) : null,
  };
}

async function tryReadAcceptance(): Promise<LegalAcceptanceRecord | null> {
  try {
    const deviceId = await getResidentDeviceId();
    const response = await api.get(OFFICIAL_ENDPOINT, {
      params: { deviceId },
    });
    const normalized = normalizeAcceptance(response.data);
    if (normalized) return normalized;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 403 || status === 404 || status === 405) return null;
    appDiagnostics.trackError('lgpd.read', err, 'Falha ao ler consentimento LGPD oficial').catch(() => undefined);
    throw err;
  }

  return null;
}

async function tryPersistAcceptance(payload: LegalAcceptancePayload): Promise<boolean> {
  try {
    const deviceId = await getResidentDeviceId();
    await api.put(OFFICIAL_ENDPOINT, {
      accepted: true,
      version: payload.version,
      acceptedAt: payload.acceptedAt ?? new Date().toISOString(),
      deviceId,
    });
    return true;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 403 || status === 404 || status === 405) return false;
    appDiagnostics.trackError('lgpd.write', err, 'Falha ao persistir consentimento LGPD oficial').catch(() => undefined);
    throw err;
  }
}

export const legalAcceptanceService = {
  async getCurrentAcceptance() {
    return tryReadAcceptance();
  },

  async persistCurrentAcceptance(payload: LegalAcceptancePayload) {
    return tryPersistAcceptance(payload);
  },
};
