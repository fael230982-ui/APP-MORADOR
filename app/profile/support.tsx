import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { BRAND } from '../../constants/brand';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { hapticFeedback } from '../../services/haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { displayEmail } from '../../utils/privacy';

export default function SupportScreen() {
  const { user, acceptedTermsVersion, currentTermsVersion } = useAuth();
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const [copying, setCopying] = useState(false);

  const supportText = useMemo(() => {
    return [
      'Suporte app morador',
      `Nome: ${user?.name || 'Não informado'}`,
      `E-mail: ${displayEmail(user?.email, 'SUPPORT_EXPORT')}`,
      `Perfil: ${user?.role || 'Não informado'}`,
      `Unidade: ${selectedUnitName || user?.unitName || 'Não informada'}`,
      `Foto cadastrada: ${user?.photoUri ? 'Sim' : 'Não'}`,
      `Referência da unidade: ${selectedUnitId || user?.unitId || 'Não informado'}`,
      `Referência da conta: ${user?.id || 'Não informado'}`,
      `Referência do cadastro: ${user?.personId || 'Não informado'}`,
      `Escopo atual: ${user?.scopeType || 'Não informado'}`,
      `Permissões efetivas publicadas: ${user?.effectiveAccess ? Object.keys(user.effectiveAccess).length : 0}`,
      `Versão legal aceita: ${acceptedTermsVersion || 'Não registrada'}`,
      `Versão legal vigente: ${currentTermsVersion || 'Não publicada'}`,
      `Canal de suporte: ${BRAND.supportContextLabel}`,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    ].join('\n');
  }, [acceptedTermsVersion, currentTermsVersion, selectedUnitId, selectedUnitName, user]);

  async function copySupportData() {
    try {
      setCopying(true);
      await Clipboard.setStringAsync(supportText);
      hapticFeedback.success();
      Alert.alert('Dados copiados', 'Envie estes dados para o suporte identificar sua conta.');
    } catch {
      hapticFeedback.error();
      Alert.alert('Erro', 'Não foi possível copiar os dados agora.');
    } finally {
      setCopying(false);
    }
  }

  async function sendEmail(problem?: string) {
    const subject = encodeURIComponent('Suporte app morador');
    const body = encodeURIComponent(`${supportText}\n\nProblema: ${problem || 'Descreva o problema aqui'}`);
    const url = `mailto:${BRAND.supportEmail}?subject=${subject}&body=${body}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('E-mail indisponível', `Envie uma mensagem para ${BRAND.supportEmail}.`);
    }
  }

  async function sendWhatsApp(problem?: string) {
    const message = encodeURIComponent(`${supportText}\n\nProblema: ${problem || 'Descreva o problema aqui'}`);
    const url = `https://wa.me/${BRAND.supportWhatsApp}?text=${message}`;
    await Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp indisponível', 'Copie os dados e envie pelo canal de suporte.');
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Suporte',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="headset-outline" size={30} color={colors.primary} />
          <Text style={styles.heroTitle}>{BRAND.supportTitle}</Text>
          <Text style={styles.heroText}>
            Envie os dados da sua conta junto com o relato do problema para agilizar a análise da sua unidade.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Se puder, informe a data aproximada do problema e envie uma imagem da tela. Isso costuma acelerar o atendimento.
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Unidade" value={selectedUnitName || user?.unitName || 'Não informada'} />
          <InfoRow label="Perfil" value={getProfileLabel(user?.role)} />
          <InfoRow label="E-mail" value={displayEmail(user?.email, 'SUPPORT_EXPORT')} />
          <InfoRow label="Foto cadastrada" value={user?.photoUri ? 'Sim' : 'Não'} />
        </View>

        <PrimaryButton title="Copiar dados para suporte" loading={copying} onPress={copySupportData} />

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={copySupportData}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Copiar relatório do atendimento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={() => sendEmail()}>
          <Ionicons name="mail-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Enviar por e-mail</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={() => sendWhatsApp()}>
          <Ionicons name="logo-whatsapp" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Enviar por WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={() => router.push('/profile/diagnostics')}>
          <Ionicons name="pulse-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Abrir diagnósticos locais</Text>
        </TouchableOpacity>

        <View style={styles.issueGrid}>
          <TouchableOpacity style={styles.issueButton} onPress={() => sendEmail('Câmera não aparece ou fica com imagem preta.')}>
            <Ionicons name="videocam-outline" size={18} color={colors.primary} />
            <Text style={styles.issueButtonText}>Problema com câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.issueButton} onPress={() => sendEmail('Encomenda não aparece para o morador.')}>
            <Ionicons name="cube-outline" size={18} color={colors.primary} />
            <Text style={styles.issueButtonText}>Problema com encomenda</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.issueButton}
            onPress={() => sendEmail('Acesso de visitante, prestador ou locatário não funcionou.')}
          >
            <Ionicons name="walk-outline" size={18} color={colors.primary} />
            <Text style={styles.issueButtonText}>Problema com acesso</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Para câmeras e encomendas</Text>
          <Text style={styles.noteText}>
            Informe o que aconteceu e, se possível, envie uma imagem da tela para facilitar o atendimento.
          </Text>
        </View>
      </ScrollView>
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

function getProfileLabel(role?: string | null) {
  if (!role) return 'Morador';
  if (role === 'MORADOR' || role === 'RESIDENT') return 'Morador';
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 20, paddingBottom: 100 },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 12 },
  heroText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'justify' },
  tipCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  tipText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  note: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 16,
  },
  noteTitle: { color: colors.text, fontSize: 14, fontWeight: '900', marginBottom: 6 },
  noteText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  issueGrid: { gap: 10, marginTop: 12 },
  issueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },
  issueButtonText: { color: colors.text, fontSize: 13, fontWeight: '800' },
});
