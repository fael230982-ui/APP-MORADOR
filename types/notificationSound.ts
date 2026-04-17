export type NotificationSoundProfile =
  | 'DEFAULT'
  | 'DELIVERY'
  | 'VISIT'
  | 'ALERT'
  | 'MESSAGE'
  | 'CAMERA';

export type NotificationSoundHint = {
  type?: string | null;
  rawType?: string | null;
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown> | null;
};

export type NotificationSoundDefinition = {
  profile: NotificationSoundProfile;
  label: string;
  channelId: string;
  soundFileName: string | null;
  thematicDescription: string;
};

const SOUND_DEFINITIONS: Record<NotificationSoundProfile, NotificationSoundDefinition> = {
  DEFAULT: {
    profile: 'DEFAULT',
    label: 'Geral',
    channelId: 'resident-default',
    soundFileName: null,
    thematicDescription: 'Som padrão do aparelho.',
  },
  DELIVERY: {
    profile: 'DELIVERY',
    label: 'Encomendas',
    channelId: 'resident-delivery',
    soundFileName: 'delivery_arrived.wav',
    thematicDescription: 'Sugestão: buzina curta de moto + voz "Entrega".',
  },
  VISIT: {
    profile: 'VISIT',
    label: 'Visitas',
    channelId: 'resident-visit',
    soundFileName: 'visit_arrived.wav',
    thematicDescription: 'Sugestão: duas buzinas curtas de carro + voz "Visita".',
  },
  ALERT: {
    profile: 'ALERT',
    label: 'Alertas',
    channelId: 'resident-alert',
    soundFileName: 'security_alert.wav',
    thematicDescription: 'Sugestão: sirene curta ou bip crítico + voz "Alerta".',
  },
  MESSAGE: {
    profile: 'MESSAGE',
    label: 'Mensagens',
    channelId: 'resident-message',
    soundFileName: 'operation_message.wav',
    thematicDescription: 'Sugestão: toque curto + voz "Mensagem".',
  },
  CAMERA: {
    profile: 'CAMERA',
    label: 'Câmeras',
    channelId: 'resident-camera',
    soundFileName: 'camera_monitoring.wav',
    thematicDescription: 'Sugestão: bip eletrônico de monitoramento + voz "Câmera".',
  },
};

function tokenize(value: unknown): string[] {
  return String(value ?? '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
}

function collectTokens(hint: NotificationSoundHint): string[] {
  const rawData = hint.data ?? {};
  const values = [
    hint.type,
    hint.rawType,
    hint.title,
    hint.body,
    rawData.type,
    rawData.rawType,
    rawData.eventType,
    rawData.notificationType,
    rawData.category,
  ];

  return values.flatMap(tokenize);
}

function hasAny(tokens: string[], terms: string[]) {
  return terms.some((term) => tokens.includes(term));
}

export function getNotificationSoundDefinition(
  profile: NotificationSoundProfile
): NotificationSoundDefinition {
  return SOUND_DEFINITIONS[profile] ?? SOUND_DEFINITIONS.DEFAULT;
}

export function resolveNotificationSoundProfile(
  hint: NotificationSoundHint
): NotificationSoundProfile {
  const tokens = collectTokens(hint);

  if (hasAny(tokens, ['DELIVERY', 'ENCOMENDA', 'PACKAGE', 'RECEIVED', 'WITHDRAWN'])) {
    return 'DELIVERY';
  }

  if (hasAny(tokens, ['ACCESS', 'VISIT', 'VISITA', 'VISITOR', 'ARRIVED', 'FORECAST'])) {
    return 'VISIT';
  }

  if (hasAny(tokens, ['ALERT', 'ALERTA', 'SECURITY', 'PANIC', 'INTRUSION', 'UNAUTHORIZED', 'RISK'])) {
    return 'ALERT';
  }

  if (hasAny(tokens, ['CAMERA', 'CAMERAS', 'VIDEO', 'SNAPSHOT'])) {
    return 'CAMERA';
  }

  if (hasAny(tokens, ['MESSAGE', 'MENSAGEM', 'PORTARIA', 'COMMUNICATION', 'COMUNICADO'])) {
    return 'MESSAGE';
  }

  return 'DEFAULT';
}
