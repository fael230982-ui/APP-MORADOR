import AsyncStorage from '@react-native-async-storage/async-storage';

const DIAGNOSTICS_KEY = '@app_morador_diagnostics';
const MAX_DIAGNOSTICS = 40;

export type AppDiagnosticRecord = {
  id: string;
  type: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  status?: number | null;
  details?: string | null;
  createdAt: string;
};

function createRecord(
  type: AppDiagnosticRecord['type'],
  source: string,
  message: string,
  details?: string | null,
  status?: number | null
): AppDiagnosticRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    source,
    message,
    details: details ?? null,
    status: status ?? null,
    createdAt: new Date().toISOString(),
  };
}

async function persist(record: AppDiagnosticRecord) {
  try {
    const currentRaw = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
    const current = currentRaw ? (JSON.parse(currentRaw) as AppDiagnosticRecord[]) : [];
    const next = [record, ...current].slice(0, MAX_DIAGNOSTICS);
    await AsyncStorage.setItem(DIAGNOSTICS_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

export const appDiagnostics = {
  async trackError(source: string, err: any, fallbackMessage: string) {
    const status = err?.response?.status ?? null;
    const message = err?.response?.data?.message || err?.message || fallbackMessage;
    const details =
      typeof err?.response?.data === 'string'
        ? err.response.data
        : err?.response?.data
          ? JSON.stringify(err.response.data)
          : null;

    const record = createRecord('error', source, String(message), details, status);
    await persist(record);
  },

  async trackWarning(source: string, message: string, details?: string | null) {
    await persist(createRecord('warning', source, message, details ?? null, null));
  },

  async list() {
    try {
      const raw = await AsyncStorage.getItem(DIAGNOSTICS_KEY);
      return raw ? (JSON.parse(raw) as AppDiagnosticRecord[]) : [];
    } catch {
      return [];
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(DIAGNOSTICS_KEY);
    } catch {
      return;
    }
  },
};
