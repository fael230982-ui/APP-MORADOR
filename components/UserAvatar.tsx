import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type Props = {
  name?: string | null;
  photoUri?: string | null;
  size?: number;
  textSize?: number;
  iconFallback?: React.ReactNode;
  backgroundColor?: string;
};

export default function UserAvatar({
  name,
  photoUri,
  size = 48,
  textSize = 20,
  iconFallback,
  backgroundColor = colors.primary,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  const initial = useMemo(() => {
    const first = name?.trim()?.charAt(0)?.toUpperCase();
    return first || 'M';
  }, [name]);

  const shouldShowImage = !!photoUri && !imageFailed;

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
        <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" onError={() => setImageFailed(true)} />
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
