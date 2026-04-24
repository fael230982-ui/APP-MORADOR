import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../constants/brand';
import { colors } from '../constants/colors';

export default function DeveloperSignature() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Desenvolvido por</Text>
      <Text style={styles.brandName}>{BRAND.legalEntityName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, alignItems: 'center', opacity: 0.78 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  brandName: { color: colors.text, fontSize: 12, fontWeight: '900' },
});
