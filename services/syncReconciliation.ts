import api from './api';

export type SyncReconciliationStatus = {
  found: boolean;
  clientRequestId: string;
  aggregateType: string | null;
  aggregateId: string | null;
  eventType: string | null;
  syncStatus: string | null;
  retryable: boolean;
  isFinal: boolean;
  isApplied: boolean;
  errorType: string | null;
  errorMessage: string | null;
  originNodeId: string | null;
  sourceUpdatedAt: string | null;
  syncedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizeReconciliation(raw: any): SyncReconciliationStatus | null {
  const source = raw?.data ?? raw;
  const clientRequestId = source?.clientRequestId ? String(source.clientRequestId) : null;
  if (!clientRequestId) return null;

  return {
    found: source?.found === true,
    clientRequestId,
    aggregateType: source?.aggregateType ? String(source.aggregateType) : null,
    aggregateId: source?.aggregateId ? String(source.aggregateId) : null,
    eventType: source?.eventType ? String(source.eventType) : null,
    syncStatus: source?.syncStatus ? String(source.syncStatus) : null,
    retryable: source?.retryable === true,
    isFinal: source?.isFinal === true,
    isApplied: source?.isApplied === true,
    errorType: source?.errorType ? String(source.errorType) : null,
    errorMessage: source?.errorMessage ? String(source.errorMessage) : null,
    originNodeId: source?.originNodeId ? String(source.originNodeId) : null,
    sourceUpdatedAt: source?.sourceUpdatedAt ? String(source.sourceUpdatedAt) : null,
    syncedAt: source?.syncedAt ? String(source.syncedAt) : null,
    createdAt: source?.createdAt ? String(source.createdAt) : null,
    updatedAt: source?.updatedAt ? String(source.updatedAt) : null,
  };
}

export const syncReconciliationService = {
  async get(clientRequestId: string, syncToken?: string | null) {
    try {
      const response = await api.get(`/api/v1/internal/sync/reconcile/${encodeURIComponent(clientRequestId)}`, {
        headers: syncToken ? { 'X-Sync-Token': syncToken } : undefined,
      });
      return normalizeReconciliation(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) {
        return null;
      }
      throw err;
    }
  },
};
