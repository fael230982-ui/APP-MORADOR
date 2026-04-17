import api from './api';
import { appDiagnostics } from './appDiagnostics';

export type StreamFieldRequirement =
  | 'REQUIRED'
  | 'CONDITIONAL'
  | 'OPTIONAL'
  | 'LEGACY_TEMPORARY';

export type StreamFieldRule = {
  canonical: boolean;
  requirement: StreamFieldRequirement | null;
  aliasFor: string | null;
};

export type StreamCapabilitiesRecord = {
  canonicalTypeField: string;
  canonicalTimeField: string;
  permissionsMatrixPrimary: boolean;
  effectiveAccessCompanion: boolean;
  fieldRules: Record<string, StreamFieldRule>;
};

export type SyncEndpointCapability = {
  endpoint: string;
  exposure: string;
  authMode: string;
};

export type SyncCapabilitiesRecord = {
  enabled: boolean;
  tokenHeaderName: string;
  tokenDeliveryMode: string | null;
  tokenLifecycle: string | null;
  eventIngress: SyncEndpointCapability | null;
  reconciliation: SyncEndpointCapability | null;
  supportedAggregateTypes: string[];
  supportedSyncStatuses: string[];
  retryableSyncStatuses: string[];
  finalSyncStatuses: string[];
};

function normalizeStreamCapabilities(raw: any): StreamCapabilitiesRecord | null {
  const source = raw?.data ?? raw;
  if (!source) return null;

  const fieldRules = Object.fromEntries(
    Object.entries(source?.fieldRules ?? {}).map(([key, value]: [string, any]) => [
      key,
      {
        canonical: value?.canonical !== false,
        requirement: value?.requirement ? String(value.requirement) as StreamFieldRequirement : null,
        aliasFor: value?.aliasFor ? String(value.aliasFor) : null,
      },
    ])
  );

  return {
    canonicalTypeField: String(source?.canonicalTypeField ?? 'eventType'),
    canonicalTimeField: String(source?.canonicalTimeField ?? 'occurredAt'),
    permissionsMatrixPrimary: source?.permissionsMatrixPrimary !== false,
    effectiveAccessCompanion: source?.effectiveAccessCompanion !== false,
    fieldRules,
  };
}

function normalizeSyncEndpointCapability(raw: any): SyncEndpointCapability | null {
  if (!raw?.endpoint) return null;
  return {
    endpoint: String(raw.endpoint),
    exposure: String(raw?.exposure ?? ''),
    authMode: String(raw?.authMode ?? ''),
  };
}

function normalizeSyncCapabilities(raw: any): SyncCapabilitiesRecord | null {
  const source = raw?.data ?? raw;
  if (!source) return null;

  return {
    enabled: source?.enabled === true,
    tokenHeaderName: String(source?.tokenHeaderName ?? 'X-Sync-Token'),
    tokenDeliveryMode: source?.tokenDeliveryMode ? String(source.tokenDeliveryMode) : null,
    tokenLifecycle: source?.tokenLifecycle ? String(source.tokenLifecycle) : null,
    eventIngress: normalizeSyncEndpointCapability(source?.eventIngress),
    reconciliation: normalizeSyncEndpointCapability(source?.reconciliation),
    supportedAggregateTypes: Array.isArray(source?.supportedAggregateTypes) ? source.supportedAggregateTypes.map(String) : [],
    supportedSyncStatuses: Array.isArray(source?.supportedSyncStatuses) ? source.supportedSyncStatuses.map(String) : [],
    retryableSyncStatuses: Array.isArray(source?.retryableSyncStatuses) ? source.retryableSyncStatuses.map(String) : [],
    finalSyncStatuses: Array.isArray(source?.finalSyncStatuses) ? source.finalSyncStatuses.map(String) : [],
  };
}

export const residentCapabilitiesService = {
  async getStreamCapabilities(): Promise<StreamCapabilitiesRecord | null> {
    try {
      const response = await api.get('/api/v1/auth/stream-capabilities');
      return normalizeStreamCapabilities(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) return null;
      appDiagnostics.trackError('capabilities.stream', err, 'Falha ao consultar stream-capabilities').catch(() => undefined);
      throw err;
    }
  },

  async getSyncCapabilities(): Promise<SyncCapabilitiesRecord | null> {
    try {
      const response = await api.get('/api/v1/auth/sync-capabilities');
      return normalizeSyncCapabilities(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) return null;
      appDiagnostics.trackError('capabilities.sync', err, 'Falha ao consultar sync-capabilities').catch(() => undefined);
      throw err;
    }
  },
};
