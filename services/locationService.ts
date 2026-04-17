import * as Location from 'expo-location';

export type ResidentLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
};

export type DistanceCheckResult = {
  distanceMeters: number | null;
  insideRadius: boolean;
};

export async function ensureLocationPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;

  const requested = await Location.requestForegroundPermissionsAsync();
  return requested.granted;
}

export async function getCurrentResidentLocation(): Promise<ResidentLocationSnapshot> {
  const granted = await ensureLocationPermission();
  if (!granted) {
    throw new Error('Permissao de localizacao negada.');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: typeof location.coords.accuracy === 'number' ? location.coords.accuracy : null,
    capturedAt: new Date(location.timestamp || Date.now()).toISOString(),
  };
}

export function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
}

export function checkRadius(
  current: ResidentLocationSnapshot,
  center: { latitude: number | null; longitude: number | null },
  radiusMeters: number
): DistanceCheckResult {
  if (center.latitude === null || center.longitude === null) {
    return {
      distanceMeters: null,
      insideRadius: false,
    };
  }

  const distanceMeters = calculateDistanceMeters(
    current.latitude,
    current.longitude,
    center.latitude,
    center.longitude
  );

  return {
    distanceMeters,
    insideRadius: distanceMeters <= radiusMeters,
  };
}
