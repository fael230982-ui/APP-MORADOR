import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import FeatureLockedState from '../../components/FeatureLockedState';
import SectionHeader from '../../components/SectionHeader';
import StatusBadge from '../../components/StatusBadge';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { deliveriesService } from '../../services/deliveries';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';
import { getDeliveryStatusLabel, isDeliveryPending, type Delivery } from '../../types/delivery';

const FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'WITHDRAWN', label: 'Retiradas' },
] as const;

function statusType(status: Delivery['status']) {
  if (status === 'WITHDRAWN') return 'success';
  if (status === 'READY_FOR_WITHDRAWAL') return 'success';
  if (status === 'NOTIFIED') return 'info';
  return 'warning';
}

function formatDate(value?: string | null) {
  if (!value) return 'Data nao informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function DeliveriesScreen() {
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [notificationsAvailable, setNotificationsAvailable] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const deliveriesEnabled = isResidentFeatureEnabled(residentAppConfig, 'deliveries');

  const pendingDeliveries = useMemo(() => deliveries.filter((item) => isDeliveryPending(item.status)), [deliveries]);
  const filteredDeliveries = useMemo(() => {
    if (filter === 'PENDING') return deliveries.filter((item) => isDeliveryPending(item.status));
    if (filter === 'WITHDRAWN') return deliveries.filter((item) => item.status === 'WITHDRAWN');
    return deliveries;
  }, [deliveries, filter]);

  const loadDeliveries = useCallback(async () => {
    if (!selectedUnitId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      const result = await deliveriesService.listResidentDeliveries();
      setDeliveries(result.deliveries);
      setNotificationsAvailable(result.notificationsAvailable);
      setAccessDenied(!!result.accessDenied);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setAccessDenied(true);
        setError('Sua conta ainda nao pode consultar encomendas desta unidade.');
      } else if (status === 404) {
        setError('A consulta de encomendas ainda nao esta disponivel para sua conta.');
      } else {
        setError('Nao foi possivel carregar suas encomendas agora.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId]);

  useAutoRefresh(loadDeliveries, { enabled: !!selectedUnitId, intervalMs: 30000, topics: ['deliveries', 'notifications', 'unit', 'realtime'] });

  const renderItem = ({ item }: { item: Delivery }) => {
    const pending = isDeliveryPending(item.status);

    return (
      <TouchableOpacity
        style={[styles.card, pending && styles.pendingCard]}
        activeOpacity={0.85}
        onPress={() => router.push(`/deliveries/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="cube-outline" size={22} color={pending ? colors.warning : colors.textMuted} />
          </View>
          <View style={styles.cardTitleArea}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.deliveryCompany || 'Origem nao informada'}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.trackingCode || 'Codigo de rastreio nao informado'}
            </Text>
            {item.recipientPersonName ? (
              <Text style={styles.cardMeta} numberOfLines={1}>
                Destinatario: {item.recipientPersonName}
              </Text>
            ) : null}
          </View>
          <StatusBadge label={getDeliveryStatusLabel(item.status)} type={statusType(item.status)} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Recebida em {formatDate(item.receivedAt)}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  if (!deliveriesEnabled) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="Encomendas" subtitle="Disponibilidade definida pela configuracao oficial da unidade." />
          <FeatureLockedState
            icon="cube-outline"
            title="Encomendas indisponiveis"
            description="Este condominio nao habilitou o modulo de encomendas para o app do morador."
            actionLabel="Voltar para o inicio"
            onAction={() => router.replace('/')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedUnitId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="Encomendas" subtitle="Escolha uma unidade para continuar." />
          <TouchableOpacity style={styles.selectUnitButton} onPress={() => setShowUnitModal(true)}>
            <Text style={styles.selectUnitText}>Selecionar unidade</Text>
          </TouchableOpacity>
          <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <SectionHeader
          title="Encomendas"
          subtitle={selectedUnitName ? `Unidade ativa: ${selectedUnitName}` : 'Unidade ativa selecionada'}
        />

        <View style={styles.topRow}>
          <TouchableOpacity style={styles.unitChip} onPress={() => setShowUnitModal(true)} activeOpacity={0.85}>
            <Ionicons name="home-outline" size={16} color={colors.primaryLight} />
            <Text style={styles.unitChipText}>Trocar unidade</Text>
          </TouchableOpacity>

          <View style={styles.counterChip}>
            <Ionicons name="cube-outline" size={16} color={colors.primary} />
            <Text style={styles.counterChipText}>
              {pendingDeliveries.length} pendente{pendingDeliveries.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const active = item.id === filter;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterButton, active && styles.filterButtonActive]}
                onPress={() => setFilter(item.id)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {pendingDeliveries.length > 0 ? (
          <View style={styles.pendingBanner}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
            <Text style={styles.pendingText}>
              {pendingDeliveries.length === 1
                ? '1 encomenda aguarda retirada.'
                : `${pendingDeliveries.length} encomendas aguardam retirada.`}
            </Text>
          </View>
        ) : null}

        {!notificationsAvailable ? (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>As encomendas registradas para sua unidade aparecem aqui automaticamente.</Text>
          </View>
        ) : null}

        {loading && deliveries.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Carregando encomendas...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDeliveries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDeliveries} tintColor={colors.primary} />}
            ListHeaderComponent={
              error && deliveries.length > 0 ? (
                <View style={styles.errorNoticeBox}>
                  <Text style={styles.errorNoticeText}>{error}</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <EmptyState
                  icon="cube-outline"
                  title={accessDenied ? 'Consulta em liberacao' : 'Nenhuma encomenda'}
                  description={
                    accessDenied
                      ? 'Sua conta esta vinculada a esta unidade, mas a consulta ainda nao foi liberada.'
                      : filter === 'WITHDRAWN'
                        ? 'Nenhuma encomenda retirada encontrada neste filtro.'
                        : filter === 'PENDING'
                          ? 'Nao ha encomendas pendentes agora.'
                          : 'Quando a portaria registrar uma encomenda para sua unidade, ela aparecera aqui.'
                  }
                />
              )
            }
          />
        )}
      </View>
      <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 18 },
  list: { paddingBottom: 100 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  unitChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  unitChipText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  counterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  counterChipText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: colors.white },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  pendingText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
  noticeBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  pendingCard: { borderColor: colors.warning },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleArea: { flex: 1, minWidth: 0 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  cardSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  cardMeta: { color: colors.primary, fontSize: 11, marginTop: 6, fontWeight: '800' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  metaText: { color: colors.textMuted, fontSize: 12, flex: 1 },
  loadingBox: { paddingTop: 60, alignItems: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  errorNoticeBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 12,
    marginBottom: 12,
  },
  errorNoticeText: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  errorBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 14,
    marginTop: 20,
  },
  errorText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  selectUnitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  selectUnitText: { color: colors.white, fontWeight: '800' },
});
