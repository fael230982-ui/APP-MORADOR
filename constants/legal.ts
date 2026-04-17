export const CURRENT_TERMS_VERSION = '2026-04-12';

export type LegalAcceptanceRecord = {
  accepted: boolean;
  version: string | null;
  acceptedAt: string | null;
  userId?: string | null;
  accountId?: string | null;
  deviceId?: string | null;
  scopeType?: string | null;
};
