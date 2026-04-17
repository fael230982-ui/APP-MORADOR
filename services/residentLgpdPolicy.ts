import api from './api';

export type ResidentLgpdPolicyRecord = {
  scopeType: string;
  currentVersion: string;
  ecosystemVersion: string | null;
  revocationSupported: boolean;
  historyVersioningSupported: boolean;
  auditMode: string | null;
  governanceDimensions: string[];
  versionGovernanceMode: string | null;
  consentHistoryRetentionMode: string | null;
  consentHistoryRetentionDays: number | null;
};

function normalizePolicy(raw: any): ResidentLgpdPolicyRecord | null {
  const source = raw?.data ?? raw;
  if (!source?.currentVersion) return null;

  return {
    scopeType: String(source?.scopeType ?? 'ACCOUNT_DEVICE'),
    currentVersion: String(source.currentVersion),
    ecosystemVersion: source?.ecosystemVersion ? String(source.ecosystemVersion) : null,
    revocationSupported: source?.revocationSupported !== false,
    historyVersioningSupported: source?.historyVersioningSupported === true,
    auditMode: source?.auditMode ? String(source.auditMode) : null,
    governanceDimensions: Array.isArray(source?.governanceDimensions) ? source.governanceDimensions.map(String) : [],
    versionGovernanceMode: source?.versionGovernanceMode ? String(source.versionGovernanceMode) : null,
    consentHistoryRetentionMode: source?.consentHistoryRetentionMode ? String(source.consentHistoryRetentionMode) : null,
    consentHistoryRetentionDays:
      typeof source?.consentHistoryRetentionDays === 'number' ? source.consentHistoryRetentionDays : null,
  };
}

export const residentLgpdPolicyService = {
  async getCurrentPolicy(): Promise<ResidentLgpdPolicyRecord | null> {
    try {
      const response = await api.get('/api/v1/resident/lgpd-policy');
      return normalizePolicy(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) return null;
      throw err;
    }
  },
};
