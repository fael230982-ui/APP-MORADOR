import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';

function typeLabel(value?: string | string[]) {
  if (value === 'RESIDENT') return 'Morador';
  if (value === 'SERVICE_PROVIDER') return 'Prestador';
  if (value === 'RENTER') return 'Locatário';
  return 'Visitante';
}

export default function AccessSuccessScreen() {
  const params = useLocalSearchParams<{ id?: string; type?: string; name?: string; unitName?: string; period?: string; schedule?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="checkmark-circle-outline" size={52} color={colors.success} />
        </View>
        <Text style={styles.title}>Acesso autorizado</Text>
        <Text style={styles.subtitle}>{params.name || 'Pessoa'} foi autorizado para {params.unitName || 'a unidade'}.</Text>

        <View style={styles.card}>
          <InfoRow label="Tipo" value={typeLabel(params.type)} />
          <InfoRow label="Validade" value={params.period || 'Não informado'} />
          {params.schedule ? <InfoRow label="Agenda" value={params.schedule} /> : null}
        </View>

        <PrimaryButton
          title={params.id ? 'Ver detalhe do acesso' : 'Ver acessos previstos'}
          onPress={() => {
            if (params.id) {
              router.replace({
                pathname: '/people/visit-detail',
                params: { id: params.id },
              });
            } else {
              router.replace('/people/visits');
            }
          }}
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/people/access-form')}>
          <Text style={styles.secondaryText}>Autorizar outra pessoa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/people')}>
          <Text style={styles.linkText}>Voltar para acessos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 22, justifyContent: 'center' },
  iconBox: {
    alignSelf: 'center',
    width: 86,
    height: 86,
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, marginBottom: 18 },
  infoRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  linkButton: { alignItems: 'center', padding: 14 },
  linkText: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
});
