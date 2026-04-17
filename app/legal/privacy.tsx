import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { getResidentLgpdConsentHistory } from '../../services/residentLgpdHistory';
import { residentLgpdPolicyService } from '../../services/residentLgpdPolicy';

export default function PrivacyScreen() {
  const [policyVersion, setPolicyVersion] = React.useState<string | null>(null);
  const [policySummary, setPolicySummary] = React.useState<string | null>(null);
  const [historyCount, setHistoryCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    residentLgpdPolicyService
      .getCurrentPolicy()
      .then((policy) => {
        if (!policy) return;
        setPolicyVersion(policy.currentVersion);
        setPolicySummary(
          `Escopo atual: ${policy.scopeType}. Revogação suportada: ${policy.revocationSupported ? 'sim' : 'não'}. Histórico versionado: ${policy.historyVersioningSupported ? 'sim' : 'não'}.`
        );
      })
      .catch(() => undefined);

    getResidentLgpdConsentHistory()
      .then((history) => setHistoryCount(history.length))
      .catch(() => undefined);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {policyVersion ? (
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Política vigente</Text>
            <Text style={styles.policyVersion}>Versão {policyVersion}</Text>
            {policySummary ? <Text style={styles.policyText}>{policySummary}</Text> : null}
            {historyCount !== null ? (
              <Text style={styles.historyText}>
                Registros de aceite visíveis para este dispositivo: {historyCount}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Dados pessoais e sensíveis</Text>
        <Text style={styles.text}>
          O aplicativo trata dados cadastrais da conta, histórico operacional da unidade e, quando habilitado, biometria facial.
          Dados sensíveis exigem tratamento mais restrito e exibição minimizada sempre que possível.
        </Text>

        <Text style={styles.sectionTitle}>Minimização e exibição parcial</Text>
        <Text style={styles.text}>
          Documentos, telefones e outros identificadores passam a ser mascarados em telas em que o dado completo não for
          indispensável para a operação. O objetivo é reduzir exposição desnecessária dentro do próprio app.
        </Text>

        <Text style={styles.sectionTitle}>Direitos do titular</Text>
        <Text style={styles.text}>
          O titular deve ter canal para solicitar informações sobre tratamento, correção, eliminação quando aplicável e revisão
          de dados biométrico-faciais conforme a base legal e a operação envolvida.
        </Text>

        <Text style={styles.sectionTitle}>Retenção e governança</Text>
        <Text style={styles.text}>
          Prazos de guarda, descarte, base legal, controlador, operador e encarregado precisam ser definidos e documentados
          fora do app, com reflexo nas APIs, logs e fluxos de suporte.
        </Text>
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
  headerSpacer: { width: 24 },
  content: { padding: 24 },
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
  },
  policyTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 4 },
  policyVersion: { color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  policyText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'justify' },
  historyText: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 24, textAlign: 'justify' },
});
