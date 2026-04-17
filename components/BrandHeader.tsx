import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../constants/brand';
import { colors } from '../constants/colors';

export default function BrandHeader() {
  return (
    <View style={styles.container}>
      <Image 
        source={BRAND.logo}
        style={styles.logo} 
        resizeMode="contain" 
      />
      <Text style={styles.brandText}>{BRAND.marketingLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  logo: { width: 30, height: 30, marginRight: 8 },
  brandText: { color: colors.text, fontSize: 14, fontWeight: '800' }
});
