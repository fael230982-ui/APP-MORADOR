import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { getAuthImageHeaders } from '../services/api';
import { appDiagnostics } from '../services/appDiagnostics';

type Props = {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  diagnosticSource?: string;
};

function buildImageSource(uri?: string | null) {
  if (!uri) return null;
  if (/^https?:\/\//i.test(uri)) {
    return { uri, headers: getAuthImageHeaders() };
  }
  return { uri };
}

export default function AuthenticatedImage({
  uri,
  style,
  contentFit = 'cover',
  fallbackTitle = 'Imagem indisponivel',
  fallbackSubtitle = 'A midia desta entrega nao foi carregada agora.',
  diagnosticSource,
}: Props) {
  const [failed, setFailed] = useState(false);
  const trackedFailureRef = useRef(false);
  const source = useMemo(() => buildImageSource(uri), [uri]);

  if (!source || failed) {
    return (
      <View style={[styles.fallback, style]}>
        <Ionicons name="image-outline" size={24} color={colors.textMuted} />
        <Text style={styles.fallbackTitle}>{fallbackTitle}</Text>
        <Text style={styles.fallbackSubtitle}>{fallbackSubtitle}</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      cachePolicy="disk"
      onError={() => {
        setFailed(true);
        if (diagnosticSource && uri && !trackedFailureRef.current) {
          trackedFailureRef.current = true;
          appDiagnostics
            .trackWarning(diagnosticSource, 'Falha ao carregar midia autenticada', JSON.stringify({ uri }))
            .catch(() => undefined);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  fallbackTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  fallbackSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
