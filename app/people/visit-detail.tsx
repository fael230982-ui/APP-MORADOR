import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { getVisitForecast, updateVisitForecastStatus, type VisitForecast } from '../../services/visitForecasts';
import { maskDocument, maskPhone } from '../../utils/privacy';

function formatDateTime(value?: string | string[]) {
  const text = Array.isArray(value) ? value[0] : value;
  if (!text) return 'Nao informado';
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatVisitStatus(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'CANCELLED') return 'Cancelado';
  if (normalized === 'EXPIRED') return 'Expirado';
  if (normalized === 'ARRIVED') return 'Chegou';
  if (normalized === 'PENDING_ARRIVAL' || normalized === 'SCHEDULED') return 'Previsto';
  return value || 'Previsto';
}

function formatVisitEvent(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'CREATED') return 'Cadastro criado';
  if (normalized === 'UPDATED') return 'Cadastro atualizado';
  if (normalized === 'ARRIVED') return 'Chegada validada';
  if (normalized === 'EXPIRED') return 'Acesso expirado';
  if (normalized === 'CANCELLED') return 'Acesso cancelado';
  return value || 'Atualizacao';
}

function formatReleaseMode(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'PORTARIA_APPROVAL') return 'Portaria aprova';
  if (normalized === 'RESIDENT_APPROVAL') return 'Morador aprova';
  if (normalized === 'AUTO_RELEASE') return 'Liberacao automatica';
  return value || 'Nao informado';
}

export default function VisitDetailScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [visit, setVisit] = useState<VisitForecast | null>(null);
  const [loading, setLoading] = useState(!!params.id);
  const [updating, setUpdating] = useState(false);

  const loadVisit = useCallback(async () => {
    if (!params.id) return;
    try {
      setLoading(true);
      const result = await getVisitForecast(String(params.id));
      setVisit(result);
    } catch {
      setVisit(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useAutoRefresh(loadVisit, { enabled: !!params.id });

  const data = useMemo(
    () => ({
      id: visit?.id || params.id,
      visitorName: visit?.visitorName || params.visitorName,
      category: visit?.categoryLabel || params.category,
      status: formatVisitStatus(visit?.status || params.status),
      serviceType: visit?.serviceType,
      serviceCompany: visit?.serviceCompany,
      vehiclePlate: visit?.vehiclePlate,
      releaseMode: visit?.releaseMode,
      expectedEntryAt: visit?.expectedEntryAt || params.expectedEntryAt,
      expectedExitAt: visit?.expectedExitAt || params.expectedExitAt,
      arrivedAt: visit?.arrivedAt || params.arrivedAt,
      arrivedByUserName: visit?.arrivedByUserName,
      residentNotifiedAt: visit?.residentNotifiedAt,
      departedAt: visit?.departedAt,
      departedByUserName: visit?.departedByUserName,
      document: visit?.visitorDocument || params.document,
      phone: visit?.visitorPhone || params.phone,
      notes: visit?.notes || params.notes,
      events: visit?.events || [],
    }),
    [params, visit]
  );

  const arrived = !!data.arrivedAt;
  const canCancel = data.id && !arrived && data.status !== 'CANCELLED' && data.status !== 'EXPIRED';

  async function updateStatus(nextStatus: 'CANCELLED', successMessage: string) {
    if (!data.id) return;

    try {
      setUpdating(true);
      const updated = await updateVisitForecastStatus(String(data.id), nextStatus);
      setVisit(updated);
      Alert.alert('Pronto', successMessage);
    } catch (err: any) {
      Alert.alert(
        'Nao foi possivel atualizar',
        err?.response?.data?.message || 'Sua conta ainda nao pode atualizar este acesso.'
      );
    } finally {
      setUpdating(false);
    }
  }

  function handleCancel() {
    Alert.alert('Cancelar acesso', 'Esse acesso deixara de ficar autorizado para a portaria.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar acesso', style: 'destructive', onPress: () => updateStatus('CANCELLED', 'Acesso cancelado.') },
    ]);
  }

  if (loading && !visit && params.id && !params.visitorName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Detalhe do acesso' }} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando acesso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Detalhe do acesso',
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
          <View style={[styles.iconBox, arrived && styles.iconBoxSuccess]}>
            <Ionicons
              name={arrived ? 'checkmark-circle-outline' : 'calendar-outline'}
              size={28}
              color={arrived ? colors.success : colors.primary}
            />
          </View>
          <Text style={styles.title}>{data.visitorName || 'Visitante'}</Text>
          <Text style={styles.subtitle}>{data.category || 'Acesso previsto'}</Text>
          <View style={[styles.statusPill, arrived && styles.statusPillSuccess]}>
            <Text style={[styles.statusText, arrived && styles.statusTextSuccess]}>{data.status || 'Previsto'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <InfoRow label="Entrada autorizada" value={formatDateTime(data.expectedEntryAt)} />
          <InfoRow label="Saida autorizada" value={formatDateTime(data.expectedExitAt)} />
          <InfoRow label="Modo de liberacao" value={formatReleaseMode(data.releaseMode)} />
          <InfoRow label="Chegada validada" value={formatDateTime(data.arrivedAt)} />
          {data.arrivedByUserName ? <InfoRow label="Validado por" value={data.arrivedByUserName} /> : null}
          {data.residentNotifiedAt ? <InfoRow label="Aviso enviado" value={formatDateTime(data.residentNotifiedAt)} /> : null}
          {data.departedAt ? <InfoRow label="Saida registrada" value={formatDateTime(data.departedAt)} /> : null}
          {data.departedByUserName ? <InfoRow label="Saida registrada por" value={data.departedByUserName} /> : null}
          {data.serviceType ? <InfoRow label="Servico" value={data.serviceType} /> : null}
          {data.serviceCompany ? <InfoRow label="Empresa" value={data.serviceCompany} /> : null}
          {data.vehiclePlate ? <InfoRow label="Veiculo" value={data.vehiclePlate} /> : null}
          <InfoRow label="Documento" value={maskDocument(data.document)} />
          <InfoRow label="Telefone" value={maskPhone(data.phone)} />
        </View>

        {data.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Observacoes</Text>
            <Text style={styles.notes}>{data.notes}</Text>
          </View>
        ) : null}

        {data.events.length > 0 ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Historico</Text>
            {data.events.map((event) => (
              <Text key={event.id} style={styles.notes}>
                {formatVisitEvent(event.eventType)} • {formatDateTime(event.createdAt || undefined)}
                {event.actorUserName ? ` por ${event.actorUserName}` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          {canCancel ? (
            <TouchableOpacity style={styles.cancelButton} disabled={updating} onPress={handleCancel}>
              <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
              <Text style={styles.cancelButtonText}>{updating ? 'Atualizando...' : 'Cancelar acesso'}</Text>
            </TouchableOpacity>
          ) : null}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 18, paddingBottom: 100 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxSuccess: { backgroundColor: colors.successSoft },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4, fontWeight: '800' },
  statusPill: { backgroundColor: colors.primarySoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 12 },
  statusPillSuccess: { backgroundColor: colors.successSoft },
  statusText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  statusTextSuccess: { color: colors.success },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  infoRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  notesTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 8 },
  notes: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  actions: { gap: 10 },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: colors.primary,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    height: 52,
  },
  cancelButtonText: { color: colors.danger, fontSize: 15, fontWeight: '900' },
});
