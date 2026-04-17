export function maskDocument(value?: string | null) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return value || 'Nao informado';
  if (digits.length <= 4) return digits;

  const visiblePrefix = digits.length > 11 ? 3 : 2;
  const prefix = digits.slice(0, visiblePrefix);
  const suffix = digits.slice(-2);
  const hidden = '*'.repeat(Math.max(2, digits.length - visiblePrefix - 2));
  return `${prefix}${hidden}${suffix}`;
}

export function maskPhone(value?: string | null) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return value || 'Nao informado';
  if (digits.length < 8) return digits;

  const prefix = digits.slice(0, 2);
  const suffix = digits.slice(-2);
  const hidden = '*'.repeat(Math.max(4, digits.length - 4));
  return `(${prefix}) ${hidden}${suffix}`;
}

export function maskEmail(value?: string | null) {
  const text = String(value ?? '').trim();
  if (!text.includes('@')) return value || 'Nao informado';

  const [local, domain] = text.split('@');
  if (!domain) return text;

  const visible = local.slice(0, Math.min(2, local.length));
  const hidden = '*'.repeat(Math.max(3, local.length - visible.length));
  return `${visible}${hidden}@${domain}`;
}

export type SensitiveDisplayContext =
  | 'OWNER_PROFILE'
  | 'OWNER_OPERATION'
  | 'SHARED_SUMMARY'
  | 'SUPPORT_EXPORT'
  | 'OPERATIONAL_LIST';

export function shouldRevealSensitiveValue(context: SensitiveDisplayContext) {
  return context === 'OWNER_PROFILE' || context === 'OWNER_OPERATION';
}

export function displayEmail(value: string | null | undefined, context: SensitiveDisplayContext) {
  return shouldRevealSensitiveValue(context) ? value || 'Nao informado' : maskEmail(value);
}

export function displayPhone(value: string | null | undefined, context: SensitiveDisplayContext) {
  return shouldRevealSensitiveValue(context) ? value || 'Nao informado' : maskPhone(value);
}

export function displayDocument(value: string | null | undefined, context: SensitiveDisplayContext) {
  return shouldRevealSensitiveValue(context) ? value || 'Nao informado' : maskDocument(value);
}
