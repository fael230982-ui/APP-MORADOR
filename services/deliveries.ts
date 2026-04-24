import api, { resolveApiUrl } from './api';
import { useAuthStore } from '../store/useAuthStore';
import type { Delivery, DeliveryListResult, DeliveryRenotifyResult, DeliveryStatus } from '../types/delivery';
import { emitAppRefresh } from '../utils/refreshBus';

const VALID_STATUSES: DeliveryStatus[] = ['RECEIVED', 'NOTIFIED', 'READY_FOR_WITHDRAWAL', 'WITHDRAWN'];

function normalizeStatus(value: unknown): DeliveryStatus {
  const status = String(value || 'RECEIVED').toUpperCase();
  return VALID_STATUSES.includes(status as DeliveryStatus)
    ? (status as DeliveryStatus)
    : status === 'READY'
      ? 'READY_FOR_WITHDRAWAL'
    : 'RECEIVED';
}

function normalizeDelivery(raw: any): Delivery {
  const id = String(raw?.id ?? raw?.deliveryId ?? '');
  return {
    id,
    recipientUnitId: raw?.recipientUnitId ?? raw?.unitId ?? null,
    recipientPersonId: raw?.recipientPersonId ?? raw?.personId ?? null,
    recipientPersonName: raw?.recipientPersonName ?? raw?.recipientName ?? raw?.personName ?? null,
    deliveryCompany: raw?.deliveryCompany ?? raw?.company ?? raw?.carrier ?? raw?.carrierName ?? null,
    trackingCode: raw?.trackingCode ?? raw?.trackingNumber ?? raw?.code ?? null,
    status: normalizeStatus(raw?.status),
    receivedAt: raw?.receivedAt ?? raw?.createdAt ?? null,
    receivedBy: raw?.receivedBy ?? null,
    receivedByName: raw?.receivedByName ?? null,
    photoUrl: resolveApiUrl(raw?.photoUrl ?? raw?.imageUrl ?? raw?.snapshotUrl ?? null),
    notificationSentAt: raw?.notificationSentAt ?? null,
    withdrawnAt: raw?.withdrawnAt ?? null,
    withdrawnBy: raw?.withdrawnBy ?? null,
    withdrawnByName: raw?.withdrawnByName ?? null,
    performedAt: raw?.performedAt ?? null,
    clientType: raw?.clientType ?? null,
    deviceName: raw?.deviceName ?? null,
    evidenceUrl: resolveApiUrl(raw?.evidenceUrl ?? null),
    pickupCode: raw?.pickupCode ?? null,
    withdrawalCode: raw?.withdrawalCode ?? null,
    withdrawalValidationMethod: raw?.withdrawalValidationMethod ?? null,
    withdrawalValidatedAt: raw?.withdrawalValidatedAt ?? null,
    withdrawalQrCodeUrl: resolveApiUrl(raw?.withdrawalQrCodeUrl ?? raw?.withdrawalQrUrl ?? raw?.qrCodeUrl ?? null),
    qrCodeUrl: resolveApiUrl(raw?.qrCodeUrl ?? raw?.withdrawalQrUrl ?? null),
    unitName: raw?.unitName ?? raw?.recipientUnitName ?? raw?.unitLabel ?? null,
  };
}

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.deliveries)) return data.deliveries;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function getDeliveriesWithRetry(params: Record<string, unknown>, skipSelectedUnit = false) {
  try {
    return await api.get('/api/v1/deliveries', {
      params,
      headers: skipSelectedUnit ? { 'X-Skip-Selected-Unit': 'true' } : undefined,
    });
  } catch (err: any) {
    if (err?.response?.status === 403 && !skipSelectedUnit) {
      return api.get('/api/v1/deliveries', {
        params,
        headers: { 'X-Skip-Selected-Unit': 'true' },
      });
    }

    throw err;
  }
}

function keepSelectedUnitDeliveries(deliveries: Delivery[], selectedUnitId?: string | null) {
  if (!selectedUnitId) return deliveries;

  const deliveriesWithUnit = deliveries.filter((delivery) => delivery.recipientUnitId);
  if (deliveriesWithUnit.length === 0) return deliveries;

  const selectedDeliveries = deliveriesWithUnit.filter((delivery) => delivery.recipientUnitId === selectedUnitId);
  return selectedDeliveries.length > 0 ? selectedDeliveries : deliveries;
}

export const deliveriesService = {
  async listResidentDeliveries(): Promise<DeliveryListResult> {
    const { selectedUnitId, user } = useAuthStore.getState();
    const effectiveUnitId =
      selectedUnitId ??
      user?.selectedUnitId ??
      user?.unitId ??
      (user?.unitIds && user.unitIds.length === 1 ? user.unitIds[0] : null);

    const attempts = [
      {
        source: 'resident-deliveries',
        params: { page: 1, limit: 100 },
        skipSelectedUnit: false,
        residentEndpoint: true,
      },
      {
        source: 'recipientUnitId',
        params: { page: 1, limit: 100, recipientUnitId: effectiveUnitId || undefined },
        skipSelectedUnit: false,
      },
      {
        source: 'auth-scope',
        params: { page: 1, limit: 100 },
        skipSelectedUnit: false,
      },
      {
        source: 'auth-scope-no-selected-header',
        params: { page: 1, limit: 100 },
        skipSelectedUnit: true,
      },
      {
        source: 'unitId',
        params: { page: 1, limit: 100, unitId: effectiveUnitId || undefined },
        skipSelectedUnit: false,
      },
      {
        source: 'recipientUnitId-no-selected-header',
        params: { page: 1, limit: 100, recipientUnitId: effectiveUnitId || undefined },
        skipSelectedUnit: true,
      },
    ];

    let lastResult: DeliveryListResult = {
      deliveries: [],
      notificationsAvailable: false,
      source: attempts[0].source,
    };
    let deniedAttempts = 0;

    for (const attempt of attempts) {
      if (!effectiveUnitId && attempt.source !== 'auth-scope' && attempt.source !== 'resident-deliveries') continue;

      let response;
      let rawDeliveries: Delivery[] = [];
      let deliveries: Delivery[] = [];

      try {
        response = attempt.residentEndpoint
          ? await api.get('/api/v1/resident/deliveries', { params: attempt.params })
          : await getDeliveriesWithRetry(attempt.params, attempt.skipSelectedUnit);
        rawDeliveries = extractItems(response.data).map(normalizeDelivery).filter((item) => item.id);
        deliveries = keepSelectedUnitDeliveries(
          rawDeliveries,
          effectiveUnitId
        );
      } catch (err: any) {
        if (err?.response?.status === 403) deniedAttempts += 1;
        console.log(
          `[deliveries] erro via ${attempt.source}: status=${err?.response?.status || 'sem-status'} message=${
            err?.response?.data?.message || err?.message || 'sem-mensagem'
          } selectedUnitId=${effectiveUnitId || 'none'}`
        );
        continue;
      }

      lastResult = {
        deliveries,
        notificationsAvailable: response.data?.notificationsAvailable ?? response.data?.meta?.notificationsAvailable ?? false,
        source: attempt.source,
      };

      console.log(`[deliveries] ${deliveries.length} item(ns) via ${attempt.source}; raw=${rawDeliveries.length}`);

      if (deliveries.length > 0) {
        return lastResult;
      }
    }

    if (deniedAttempts > 0 && lastResult.deliveries.length === 0) {
      lastResult = {
        ...lastResult,
        accessDenied: true,
      };
    }

    if (lastResult.accessDenied) {
      console.log(`[deliveries] sem itens no escopo do usuario. selectedUnitId=${effectiveUnitId || 'none'}`);
    }

    console.log(`[deliveries] 0 itens. selectedUnitId=${effectiveUnitId || 'none'}`);
    return lastResult;
  },

  async getResidentDelivery(id: string): Promise<Delivery> {
    const result = await deliveriesService.listResidentDeliveries();
    const delivery = result.deliveries.find((item) => item.id === id);

    if (!delivery) {
      const error = new Error('Delivery not found');
      (error as any).response = { status: 404 };
      throw error;
    }

    return delivery;
  },

  async validateWithdrawal(id: string, code: string): Promise<Delivery | null> {
    const response = await api.post(`/api/v1/deliveries/${id}/validate-withdrawal`, {
      code,
      validationMethod: 'CODE',
    });

    if (!response.data) return null;

    if (response.data.deliveryId && !response.data.id) {
      const delivery = {
        id: String(response.data.deliveryId),
        status: normalizeStatus(response.data.status || 'WITHDRAWN'),
        withdrawnAt: response.data.withdrawnAt ?? null,
        withdrawnBy: response.data.withdrawnBy ?? null,
        withdrawnByName: response.data.withdrawnByName ?? null,
      };
      emitAppRefresh('mutation', { topics: ['deliveries', 'overview', 'notifications'], source: 'deliveries.validateWithdrawal' });
      return delivery;
    }

    const normalized = normalizeDelivery(response.data);
    if (normalized.id) {
      emitAppRefresh('mutation', { topics: ['deliveries', 'overview', 'notifications'], source: 'deliveries.validateWithdrawal' });
    }
    return normalized.id ? normalized : null;
  },

  async renotify(id: string): Promise<DeliveryRenotifyResult | null> {
    const response = await api.post(`/api/v1/deliveries/${id}/renotify`);
    if (!response.data) return null;

    const normalized: DeliveryRenotifyResult = {
      ok: response.data?.ok === true,
      deliveryId: String(response.data?.deliveryId ?? id),
      notifiedUsersCount:
        typeof response.data?.notifiedUsersCount === 'number'
          ? response.data.notifiedUsersCount
          : null,
      notificationSentAt: response.data?.notificationSentAt ?? null,
    };

    emitAppRefresh('mutation', {
      topics: ['deliveries', 'notifications', 'overview'],
      source: 'deliveries.renotify',
    });

    return normalized;
  },
};
