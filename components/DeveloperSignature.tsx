import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../constants/brand';
import { colors } from '../constants/colors';

export default function DeveloperSignature() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Desenvolvido por:</Text>
      <Image source={BRAND.developerLogo} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, alignItems: 'center', opacity: 0.78 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  logo: { width: 110, height: 28 },
});
