import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type ScreenLoaderProps = {
  message?: string;
};

export default function ScreenLoader({
  message = 'Carregando informações...',
}: ScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
  },
});
