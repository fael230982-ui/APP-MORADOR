import type { ConfigContext, ExpoConfig } from 'expo/config';
import { brandProfiles } from './constants/brandProfiles';

const env = (key: string, fallback: string) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const profileKey = env('EXPO_PUBLIC_BRAND_PROFILE', env('EXPO_PUBLIC_BRAND_VARIANT', 'default')).toLowerCase();
  const profile = brandProfiles[profileKey] ?? brandProfiles.default;

  const appName = env('EXPO_PUBLIC_BRAND_APP_NAME', profile.appName);
  const slug = env('EXPO_PUBLIC_BRAND_SLUG', profile.slug);
  const scheme = env('EXPO_PUBLIC_BRAND_SCHEME', profile.scheme);
  const bundleIdentifier = env('EXPO_PUBLIC_BRAND_BUNDLE_ID', profile.bundleIdentifier);
  const androidPackage = env('EXPO_PUBLIC_BRAND_ANDROID_PACKAGE', profile.androidPackage);
  const storageNamespace = env('EXPO_PUBLIC_STORAGE_NAMESPACE', profile.storageNamespace);

  return {
    ...config,
    name: appName,
    slug,
    version: config.version ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    scheme,
    assetBundlePatterns: ['**/*'],
    ios: {
      ...config.ios,
      supportsTabletMode: true,
      bundleIdentifier,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSCameraUsageDescription: 'Precisamos acessar sua camera para tirar fotos dos cadastros.',
        NSPhotoLibraryUsageDescription: 'Precisamos acessar suas fotos para selecionar imagens dos cadastros.',
        NSLocationWhenInUseUsageDescription:
          'Precisamos da sua localizacao para validar o raio do condominio em acoes de emergencia e chegada assistida.',
      },
    },
    android: {
      ...config.android,
      package: androidPackage,
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission: 'Precisamos acessar suas fotos para selecionar imagens dos cadastros.',
          cameraPermission: 'Precisamos acessar sua camera para tirar fotos dos cadastros.',
        },
      ],
      [
        'expo-notifications',
        {
          sounds: [
            './assets/sounds/delivery_arrived.wav',
            './assets/sounds/visit_arrived.wav',
            './assets/sounds/security_alert.wav',
            './assets/sounds/operation_message.wav',
          ],
        },
      ],
      '@react-native-community/datetimepicker',
      'expo-video',
    ],
    extra: {
      ...config.extra,
      brand: {
        profile: profile.key,
        appName,
        slug,
        scheme,
        bundleIdentifier,
        androidPackage,
        storageNamespace,
      },
    },
  };
};
