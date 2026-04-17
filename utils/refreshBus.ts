export type RefreshReason = 'foreground' | 'notification' | 'interval' | 'manual' | 'realtime' | 'mutation';

export type RefreshTopic =
  | 'alerts'
  | 'cameras'
  | 'deliveries'
  | 'messages'
  | 'notifications'
  | 'overview'
  | 'profile'
  | 'realtime'
  | 'unit'
  | 'vehicles'
  | 'visits';

export type RefreshEvent = {
  reason: RefreshReason;
  topics?: RefreshTopic[];
  source?: string;
  at: string;
};

type RefreshListener = (event: RefreshEvent) => void;

const listeners = new Set<RefreshListener>();

export function subscribeToAppRefresh(listener: RefreshListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitAppRefresh(reason: RefreshReason, options?: { topics?: RefreshTopic[]; source?: string }) {
  const event: RefreshEvent = {
    reason,
    topics: options?.topics,
    source: options?.source,
    at: new Date().toISOString(),
  };

  listeners.forEach((listener) => listener(event));
}
