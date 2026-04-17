import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { hapticFeedback } from '../services/haptics';
import { getPanicHistory, getPanicStatus, getResidentActionAvailability, triggerPanic } from '../services/panic';
import { useAuthStore } from '../store/useAuthStore';
import type { PanicEvent, PanicType } from '../types/panic';

function formatDistance(distance: number | null) {
  if (distance === null) return 'Raio indisponível';
  if (distance < 1000) return `${distance} m`;
  return `${(distance / 1000).toFixed(1)} km`;
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function ResidentActionsScreen() {
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [executingType, setExecutingType] = useState<PanicType | null>(null);
  const [panicDistance, setPanicDistance] = useState<number | null>(null);
  const [assistedDistance, setAssistedDistance] = useState<number | null>(null);
  const [panicRadius, setPanicRadius] = useState<number>(250);
  const [assistedRadius, setAssistedRadius] = useState<number>(700);
  const [history, setHistory] = useState<PanicEvent[]>([]);
  const [locationReady, setLocationReady] = useState(false);
  const [panicActionReason, setPanicActionReason] = useState<string | null>(null);
  const [assistedActionReason, setAssistedActionReason] = useState<string | null>(null);
  const [panicActionAvailable, setPanicActionAvailable] = useState(false);
  const [assistedActionAvailable, setAssistedActionAvailable] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const [status, historyResult, availability] = await Promise.all([
        getPanicStatus(),
        getPanicHistory().catch(() => []),
        getResidentActionAvailability().catch(() => []),
      ]);

      setPanicDistance(status.panic.distanceMeters);
      setAssistedDistance(status.assistedEntry.distanceMeters);
      setPanicRadius(status.panic.radiusMeters);
      setAssistedRadius(status.assistedEntry.radiusMeters);
      setLocationReady(status.centerConfigured);
      setHistory(historyResult.slice(0, 5));

      const panicAvailability = availability.find((item) => item.type === 'PANIC');
      const assistedAvailability = availability.find((item) => item.type === 'ASSISTED_ENTRY');
      setPanicActionAvailable(!!panicAvailability?.available);
      setAssistedActionAvailable(!!assistedAvailability?.available);
      setPanicActionReason(panicAvailability?.reason ?? null);
      setAssistedActionReason(assistedAvailability?.reason ?? null);

      setStatusText(
        status.centerConfigured
          ? `Distância atual até o condomínio: ${formatDistance(status.assistedEntry.distanceMeters)}. A validação de raio foi carregada pela ${status.source === 'api' ? 'API oficial' : 'configuração local'}.`
          : 'A validação local do raio ainda não foi publicada para esta unidade. Se necessário, o backend pode confirmar sua localização no envio.'
      );
    } catch (err: any) {
      setLocationReady(false);
      setStatusText(err?.message || 'Não foi possível capturar sua localização agora.');
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(loadStatus, { intervalMs: 30000, topics: ['unit', 'realtime', 'alerts', 'notifications'] });

  const unitLabel = selectedUnitName || user?.selectedUnitName || user?.unitName || 'Unidade ativa';
  const panicEnabled = useMemo(
    () => panicActionAvailable && (!locationReady || (panicDistance !== null && panicDistance <= panicRadius)),
    [locationReady, panicActionAvailable, panicDistance, panicRadius]
  );
  const assistedEnabled = useMemo(
    () => assistedActionAvailable && (!locationReady || (assistedDistance !== null && assistedDistance <= assistedRadius)),
    [assistedActionAvailable, assistedDistance, assistedRadius, locationReady]
  );

  function handleExecute(type: PanicType, title: string, message: string) {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar agora',
        style: type === 'PANIC' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            setExecutingType(type);
            const result = await triggerPanic(type);
            hapticFeedback.success();
            setHistory((current) => [result, ...current].slice(0, 5));
            Alert.alert(
              type === 'PANIC' ? 'Emergência enviada' : 'Entrada assistida enviada',
              type === 'PANIC'
                ? 'A portaria e a central receberam seu pedido de emergência.'
                : 'A portaria foi avisada para agilizar sua chegada.'
            );
            await loadStatus();
          } catch (err: any) {
            hapticFeedback.error();
            Alert.alert('Não foi possível enviar', err?.message || 'Tente novamente em instantes.');
          } finally {
            setExecutingType(null);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Ações rápidas',
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
          <Text style={styles.heroKicker}>Unidade monitorada</Text>
          <Text style={styles.heroTitle}>{unitLabel}</Text>
          <Text style={styles.heroText}>{statusText || 'Preparando localização e regras oficiais da unidade.'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, styles.iconDanger]}>
              <Ionicons name="warning-outline" size={24} color={colors.danger} />
            </View>
            <View style={styles.cardTextArea}>
              <Text style={styles.cardTitle}>Botão de pânico</Text>
              <Text style={styles.cardDescription}>
                Use apenas em uma situação real de emergência. O app envia sua localização atual para abrir um incidente ao vivo.
              </Text>
            </View>
          </View>
          <InfoLine label="Raio protegido" value={`${panicRadius} m`} />
          <InfoLine label="Distância atual" value={formatDistance(panicDistance)} />
          {panicActionReason ? <Text style={styles.blockHint}>{panicActionReason}</Text> : null}
          {!panicActionReason && !panicEnabled ? (
            <Text style={styles.blockHint}>
              O botão só fica disponível quando você estiver dentro do raio protegido do condomínio.
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, (!panicEnabled || executingType !== null) && styles.buttonDisabled, styles.dangerButton]}
            disabled={!panicEnabled || executingType !== null}
            onPress={() =>
              handleExecute(
                'PANIC',
                'Enviar emergência',
                'A portaria e a central receberão sua localização atual. Confirme apenas se for uma emergência real.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              {executingType === 'PANIC' ? 'Enviando...' : 'Disparar emergência'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="navigate-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardTextArea}>
              <Text style={styles.cardTitle}>Entrada assistida</Text>
              <Text style={styles.cardDescription}>
                Avise que está chegando para a portaria se preparar. O envio só acontece quando você estiver dentro do raio oficial da unidade.
              </Text>
            </View>
          </View>
          <InfoLine label="Raio de envio" value={`${assistedRadius} m`} />
          <InfoLine label="Distância atual" value={formatDistance(assistedDistance)} />
          {assistedActionReason ? <Text style={styles.blockHint}>{assistedActionReason}</Text> : null}
          {!assistedActionReason && !assistedEnabled ? (
            <Text style={styles.blockHint}>
              O aviso só será enviado quando você estiver dentro do raio oficial de chegada.
            </Text>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, (!assistedEnabled || executingType !== null) && styles.buttonDisabled]}
            disabled={!assistedEnabled || executingType !== null}
            onPress={() =>
              handleExecute(
                'ASSISTED_ENTRY',
                'Avisar chegada',
                'A portaria será avisada de que você está chegando para agilizar sua entrada.'
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              {executingType === 'ASSISTED_ENTRY' ? 'Enviando...' : 'Avisar chegada'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Últimos acionamentos</Text>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Atualizando histórico...</Text>
            </View>
          ) : history.length > 0 ? (
            history.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={item.type === 'ASSISTED_ENTRY' ? 'navigate-outline' : 'warning-outline'}
                    size={18}
                    color={item.type === 'ASSISTED_ENTRY' ? colors.primary : colors.danger}
                  />
                </View>
                <View style={styles.historyTextArea}>
                  <Text style={styles.historyName}>{item.typeLabel}</Text>
                  <Text style={styles.historyMeta}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.historyStatus}>{item.statusLabel}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum acionamento registrado recentemente.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 18, paddingBottom: 100, gap: 14 },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  heroKicker: { color: colors.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 6 },
  heroText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'justify' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: { backgroundColor: colors.dangerSoft },
  cardTextArea: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  cardDescription: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4, textAlign: 'justify' },
  infoLine: { paddingTop: 10 },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  blockHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 10, textAlign: 'justify' },
  primaryButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 14,
  },
  dangerButton: { backgroundColor: colors.danger },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  buttonDisabled: { opacity: 0.5 },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  historyTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTextArea: { flex: 1 },
  historyName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  historyMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  historyStatus: { color: colors.textMuted, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  loadingText: { color: colors.textMuted, marginTop: 10 },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 18, textAlign: 'justify' },
});
