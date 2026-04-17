import api from './api';
import { emitAppRefresh } from '../utils/refreshBus';

export type ResidentOperationAction = {
  id: string;
  label: string;
  category: string;
  requiredPermission: string;
  available: boolean;
  requiresConfirmation: boolean;
  auditRequired: boolean;
};

export type ResidentOperationActionExecution = {
  executionId: string;
  actionId: string;
  status: 'REGISTERED' | 'FAILED';
  executedAt: string;
};

function normalizeAction(raw: any): ResidentOperationAction | null {
  if (!raw?.id || !raw?.label) return null;

  return {
    id: String(raw.id),
    label: String(raw.label),
    category: String(raw.category ?? 'GENERAL'),
    requiredPermission: String(raw.requiredPermission ?? ''),
    available: raw?.available !== false,
    requiresConfirmation: raw?.requiresConfirmation === true,
    auditRequired: raw?.auditRequired === true,
  };
}

function normalizeExecution(raw: any): ResidentOperationActionExecution {
  return {
    executionId: String(raw?.executionId ?? ''),
    actionId: String(raw?.actionId ?? ''),
    status: String(raw?.status ?? 'FAILED').toUpperCase() === 'REGISTERED' ? 'REGISTERED' : 'FAILED',
    executedAt: String(raw?.executedAt ?? new Date().toISOString()),
  };
}

export async function listResidentOperationActions() {
  try {
    const response = await api.get('/api/v1/actions');
    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    return items
      .map(normalizeAction)
      .filter((item): item is ResidentOperationAction => !!item);
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 403 || status === 404 || status === 405) {
      return [];
    }
    throw err;
  }
}

export async function executeResidentOperationAction(
  actionId: string,
  payload?: Record<string, unknown>,
  reason?: string
) {
  const response = await api.post(`/api/v1/actions/${actionId}/execute`, {
    payload: payload ?? {},
    ...(reason ? { reason } : {}),
  });

  const normalized = normalizeExecution(response.data);
  emitAppRefresh('mutation', {
    topics: ['alerts', 'notifications', 'messages', 'realtime'],
    source: `residentAction.execute.${actionId}`,
  });
  return normalized;
}
