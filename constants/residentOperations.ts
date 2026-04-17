const parseNumber = (value: string | undefined, fallback: number | null = null) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const RESIDENT_OPERATION_GEOFENCE = {
  latitude: parseNumber(process.env.EXPO_PUBLIC_CONDOMINIUM_CENTER_LAT),
  longitude: parseNumber(process.env.EXPO_PUBLIC_CONDOMINIUM_CENTER_LNG),
  panicRadiusMeters: parseNumber(process.env.EXPO_PUBLIC_PANIC_RADIUS_METERS, 250) ?? 250,
  assistedDispatchRadiusMeters: parseNumber(process.env.EXPO_PUBLIC_ASSISTED_ENTRY_RADIUS_METERS, 700) ?? 700,
} as const;

export const RESIDENT_OPERATION_KEYS = {
  panic: ['panic', 'resident_panic', 'panic_button', 'emergency_panic', 'emergencia', 'sos'],
  assistedEntry: ['assisted_entry', 'resident_assisted_entry', 'arrival_notice', 'entrada_assistida', 'chegada'],
} as const;
