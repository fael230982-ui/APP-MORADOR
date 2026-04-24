import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { getAuthImageHeaders } from '../services/api';

type Props = {
  name?: string | null;
  photoUri?: string | null;
  fallbackPhotoUri?: string | null;
  cacheKey?: string | number | null;
  size?: number;
  textSize?: number;
  iconFallback?: React.ReactNode;
  backgroundColor?: string;
};

export default function UserAvatar({
  name,
  photoUri,
  fallbackPhotoUri,
  cacheKey,
  size = 48,
  textSize = 20,
  iconFallback,
  backgroundColor = colors.primary,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const isRemoteUri = (value?: string | null) => /^https?:\/\//i.test(value || '');
  const resolvedRemotePhotoUri = useMemo(() => {
    if (!photoUri) return null;
    if (!isRemoteUri(photoUri)) return photoUri;
    const separator = photoUri.includes('?') ? '&' : '?';
    return `${photoUri}${separator}avatarTs=${encodeURIComponent(String(cacheKey ?? 'static'))}`;
  }, [cacheKey, photoUri]);
  const resolvedFallbackPhotoUri = useMemo(() => {
    if (!fallbackPhotoUri) return null;
    if (!isRemoteUri(fallbackPhotoUri)) return fallbackPhotoUri;
    const separator = fallbackPhotoUri.includes('?') ? '&' : '?';
    return `${fallbackPhotoUri}${separator}avatarTs=${encodeURIComponent(String(cacheKey ?? 'static'))}`;
  }, [cacheKey, fallbackPhotoUri]);

  const initial = useMemo(() => {
    const first = name?.trim()?.charAt(0)?.toUpperCase();
    return first || 'M';
  }, [name]);

  useEffect(() => {
    setImageFailed(false);
  }, [cacheKey, resolvedFallbackPhotoUri, resolvedRemotePhotoUri]);

  const imageSourceUri = imageFailed ? resolvedFallbackPhotoUri : resolvedRemotePhotoUri ?? resolvedFallbackPhotoUri;
  const shouldShowImage = !!imageSourceUri;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: 8,
          backgroundColor,
        },
      ]}
    >
      {shouldShowImage ? (
        <Image
          source={{ uri: imageSourceUri!, headers: imageSourceUri === resolvedRemotePhotoUri && isRemoteUri(imageSourceUri) ? getAuthImageHeaders() : undefined }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            if (imageSourceUri === resolvedRemotePhotoUri && resolvedFallbackPhotoUri) {
              setImageFailed(true);
              return;
            }
            setImageFailed(true);
          }}
        />
      ) : iconFallback ? (
        iconFallback
      ) : (
        <Text style={[styles.initial, { fontSize: textSize }]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    color: colors.white,
    fontWeight: '900',
  },
});
