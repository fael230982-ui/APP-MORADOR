import { emitAppRefresh, type RefreshTopic } from '../utils/refreshBus';

export type ResidentRealtimeStatus = 'idle' | 'prepared' | 'connecting' | 'connected' | 'degraded';

export type ResidentRealtimeSnapshot = {
  status: ResidentRealtimeStatus;
  transport: 'sse';
  enabled: boolean;
  connected: boolean;
  capabilitiesLoaded: boolean;
  syncCapabilitiesLoaded: boolean;
  syncEnabled: boolean;
  operationalReady: boolean;
  unitId?: string | null;
  updatedAt?: string | null;
  lastError?: string | null;
};

type SessionConfig = {
  token?: string | null;
  unitId?: string | null;
};

let session: SessionConfig = {};
let snapshot: ResidentRealtimeSnapshot = {
  status: 'idle',
  transport: 'sse',
  enabled: false,
  connected: false,
  capabilitiesLoaded: false,
  syncCapabilitiesLoaded: false,
  syncEnabled: false,
  operationalReady: false,
  unitId: null,
  updatedAt: null,
  lastError: null,
};

let streamCapabilitiesLoaded = false;
let syncCapabilitiesLoaded = false;
let syncEnabled = false;

const listeners = new Set<(value: ResidentRealtimeSnapshot) => void>();

function getCapabilityError() {
  if (!streamCapabilitiesLoaded) return 'stream-capabilities ainda nao carregado';
  if (!syncCapabilitiesLoaded) return 'sync-capabilities ainda nao carregado';
  if (!syncEnabled) return 'sync-capabilities publicado sem suporte operacional ativo';
  return null;
}

function computeOperationalReady() {
  return streamCapabilitiesLoaded && syncCapabilitiesLoaded && syncEnabled;
}

function publish(next: Partial<ResidentRealtimeSnapshot>) {
  snapshot = {
    ...snapshot,
    ...next,
    updatedAt: new Date().toISOString(),
  };

  listeners.forEach((listener) => listener(snapshot));
}

export const residentRealtimeService = {
  setStreamCapabilitiesLoaded(value: boolean) {
    streamCapabilitiesLoaded = value;
    const operationalReady = computeOperationalReady();
    publish({
      capabilitiesLoaded: value,
      status: session.token ? (operationalReady ? 'prepared' : 'degraded') : 'idle',
      enabled: !!session.token && operationalReady,
      connected: false,
      syncCapabilitiesLoaded,
      syncEnabled,
      operationalReady,
      unitId: session.unitId ?? null,
      lastError: session.token ? getCapabilityError() : null,
    });
  },

  setSyncCapabilities(value: { loaded: boolean; enabled: boolean }) {
    syncCapabilitiesLoaded = value.loaded;
    syncEnabled = value.enabled;
    const operationalReady = computeOperationalReady();
    publish({
      capabilitiesLoaded: streamCapabilitiesLoaded,
      syncCapabilitiesLoaded,
      syncEnabled,
      operationalReady,
      status: session.token ? (operationalReady ? 'prepared' : 'degraded') : 'idle',
      enabled: !!session.token && operationalReady,
      connected: false,
      unitId: session.unitId ?? null,
      lastError: session.token ? getCapabilityError() : null,
    });
  },

  configure(config: SessionConfig) {
    session = config;
    const operationalReady = computeOperationalReady();
    publish({
      status: config.token ? (operationalReady ? 'prepared' : 'degraded') : 'idle',
      enabled: !!config.token && operationalReady,
      connected: false,
      capabilitiesLoaded: streamCapabilitiesLoaded,
      syncCapabilitiesLoaded,
      syncEnabled,
      operationalReady,
      unitId: config.unitId ?? null,
      lastError: config.token ? getCapabilityError() : null,
    });
  },

  markPendingIntegration(message?: string | null) {
    publish({
      status: session.token ? 'prepared' : 'idle',
      enabled: !!session.token,
      connected: false,
      unitId: session.unitId ?? null,
      lastError: message ?? null,
    });
  },

  markConnected() {
    publish({
      status: 'connected',
      enabled: computeOperationalReady(),
      connected: true,
      syncCapabilitiesLoaded,
      syncEnabled,
      operationalReady: computeOperationalReady(),
      unitId: session.unitId ?? null,
      lastError: null,
    });
  },

  markDisconnected(message?: string | null) {
    publish({
      status: session.token ? 'degraded' : 'idle',
      enabled: !!session.token && computeOperationalReady(),
      connected: false,
      syncCapabilitiesLoaded,
      syncEnabled,
      operationalReady: computeOperationalReady(),
      unitId: session.unitId ?? null,
      lastError: message ?? getCapabilityError(),
    });
  },

  notifyEvent(topics: RefreshTopic[], source = 'resident-realtime') {
    emitAppRefresh('realtime', { topics, source });
  },

  getSnapshot() {
    return snapshot;
  },

  subscribe(listener: (value: ResidentRealtimeSnapshot) => void) {
    listeners.add(listener);
    listener(snapshot);
    return () => {
      listeners.delete(listener);
    };
  },
};
