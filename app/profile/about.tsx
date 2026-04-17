import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BRAND, getBrandCopyrightLabel } from '../../constants/brand';
import { colors } from '../../constants/colors';
import { hapticFeedback } from '../../services/haptics';

function resolveVersionLabel() {
  const version = Constants.expoConfig?.version || '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'local';
  return `Versao ${version} (${build})`;
}

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.light();
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre o app</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <Image source={BRAND.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>{BRAND.appName}</Text>
          <Text style={styles.version}>{resolveVersionLabel()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvido por</Text>
          <Text style={styles.text}>{BRAND.legalEntityName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <Text style={styles.text}>{BRAND.supportEmail}</Text>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.noteText}>
            Este aplicativo esta alinhado com a API Sapinho e segue preparado para novas liberacoes de producao sem
            quebrar o fluxo do morador.
          </Text>
        </View>

        <Text style={styles.copyright}>{getBrandCopyrightLabel(2026)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  content: { padding: 24, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 88, height: 88, marginBottom: 16 },
  appName: { color: colors.text, fontSize: 22, fontWeight: '800' },
  version: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  section: { width: '100%', marginBottom: 32 },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    opacity: 0.6,
  },
  text: { color: colors.text, fontSize: 16 },
  noteBox: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  noteText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  copyright: { color: colors.textMuted, fontSize: 12, marginTop: 40 },
});
