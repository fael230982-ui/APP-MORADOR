export type PanicType = 'PANIC' | 'MEDICAL' | 'ASSISTED_ENTRY';

export type PanicEvent = {
  id: string;
  type: PanicType;
  typeLabel: string;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  statusLabel: string;
  locationContext: 'INSIDE' | 'OUTSIDE';
};