export type DeliveryStatus = 'RECEIVED' | 'NOTIFIED' | 'READY_FOR_WITHDRAWAL' | 'WITHDRAWN';

export type Delivery = {
  id: string;
  recipientUnitId?: string | null;
  recipientPersonId?: string | null;
  recipientPersonName?: string | null;
  deliveryCompany?: string | null;
  trackingCode?: string | null;
  status: DeliveryStatus;
  receivedAt?: string | null;
  receivedBy?: string | null;
  receivedByName?: string | null;
  photoUrl?: string | null;
  notificationSentAt?: string | null;
  withdrawnAt?: string | null;
  withdrawnBy?: string | null;
  withdrawnByName?: string | null;
  performedAt?: string | null;
  clientType?: string | null;
  deviceName?: string | null;
  evidenceUrl?: string | null;
  // Legacy field kept for compatibility with older payloads.
  pickupCode?: string | null;
  withdrawalCode?: string | null;
  withdrawalValidationMethod?: string | null;
  withdrawalValidatedAt?: string | null;
  // Canonical target field for the withdrawal QR code.
  withdrawalQrCodeUrl?: string | null;
  // Legacy field kept while the backend converges.
  qrCodeUrl?: string | null;
  unitName?: string | null;
};

export type DeliveryRenotifyResult = {
  ok: boolean;
  deliveryId: string;
  notifiedUsersCount?: number | null;
  notificationSentAt?: string | null;
};

export type DeliveryListResult = {
  deliveries: Delivery[];
  notificationsAvailable: boolean;
  source?: string;
  accessDenied?: boolean;
};

export function getDeliveryStatusLabel(status: DeliveryStatus) {
  if (status === 'WITHDRAWN') return 'Retirada';
  if (status === 'READY_FOR_WITHDRAWAL') return 'Pronta para retirada';
  if (status === 'NOTIFIED') return 'Notificada';
  return 'Recebida';
}

export function isDeliveryPending(status: DeliveryStatus) {
  return status !== 'WITHDRAWN';
}

export function getCanonicalWithdrawalCode(delivery?: Delivery | null) {
  return delivery?.withdrawalCode || delivery?.pickupCode || null;
}

export function getCanonicalWithdrawalQrCodeUrl(delivery?: Delivery | null) {
  return delivery?.withdrawalQrCodeUrl || delivery?.qrCodeUrl || null;
}
