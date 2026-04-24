import api from './api';
import { emitAppRefresh } from '../utils/refreshBus';

export type OperationMessage = {
  id: string;
  unitId: string;
  unitLabel?: string | null;
  unitName?: string | null;
  senderUserId?: string | null;
  senderUserName?: string | null;
  recipientPersonId?: string | null;
  recipientPersonName?: string | null;
  recipientPhone?: string | null;
  direction: 'PORTARIA_TO_RESIDENT' | 'RESIDENT_TO_PORTARIA' | string;
  origin: 'APP' | 'WHATSAPP' | 'PORTARIA' | string;
  body: string;
  status: string;
  externalMessageId?: string | null;
  externalMetadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

export function isIncomingOperationMessage(message: OperationMessage) {
  return message.direction === 'PORTARIA_TO_RESIDENT';
}

export function isUnreadIncomingOperationMessage(message: OperationMessage) {
  return isIncomingOperationMessage(message) && !message.readAt;
}

function normalizeMessage(raw: any): OperationMessage {
  return {
    id: String(raw?.id ?? ''),
    unitId: String(raw?.unitId ?? raw?.unit?.id ?? ''),
    unitLabel: raw?.unitLabel ?? raw?.unit?.label ?? null,
    unitName: raw?.unitName ?? raw?.unit?.name ?? raw?.unitLabel ?? null,
    senderUserId: raw?.senderUserId ?? raw?.authorUserId ?? raw?.sender?.id ?? null,
    senderUserName: raw?.senderUserName ?? raw?.authorName ?? raw?.senderName ?? raw?.sender?.name ?? null,
    recipientPersonId: raw?.recipientPersonId ?? raw?.recipient?.id ?? null,
    recipientPersonName: raw?.recipientPersonName ?? raw?.recipient?.name ?? null,
    recipientPhone: raw?.recipientPhone ?? raw?.recipient?.phone ?? null,
    direction: String(raw?.direction ?? 'PORTARIA_TO_RESIDENT'),
    origin: String(raw?.origin ?? 'PORTARIA'),
    body: String(raw?.body ?? raw?.message ?? ''),
    status: String(raw?.status ?? raw?.deliveryStatus ?? 'SENT'),
    externalMessageId: raw?.externalMessageId ?? null,
    externalMetadata:
      raw?.externalMetadata && typeof raw.externalMetadata === 'object' ? (raw.externalMetadata as Record<string, unknown>) : null,
    readAt: raw?.readAt ?? raw?.read_at ?? null,
    createdAt: String(raw?.createdAt ?? raw?.created_at ?? raw?.timestamp ?? ''),
  };
}

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.messages)) return data.messages;
  return [];
}

export const operationMessagesService = {
  async list(unitId: string, options?: { unreadOnly?: boolean; limit?: number }): Promise<OperationMessage[]> {
    const response = await api.get('/api/v1/messages', {
      params: {
        unitId,
        limit: options?.limit ?? 50,
        unreadOnly: options?.unreadOnly || undefined,
      },
    });

    return extractItems(response.data).map(normalizeMessage).filter((item: OperationMessage) => item.id);
  },

  async send(unitId: string, body: string): Promise<OperationMessage> {
    const response = await api.post('/api/v1/messages', {
      unitId,
      body,
      origin: 'APP',
      direction: 'RESIDENT_TO_PORTARIA',
    });

    const message = normalizeMessage(response.data);
    emitAppRefresh('mutation', { topics: ['messages', 'overview', 'profile'], source: 'operationMessages.send' });
    return message;
  },

  async markRead(id: string): Promise<OperationMessage> {
    const response = await api.patch(`/api/v1/messages/${id}/read`);
    const message = normalizeMessage(response.data);
    emitAppRefresh('mutation', { topics: ['messages', 'overview', 'profile'], source: 'operationMessages.markRead' });
    return message;
  },
};
