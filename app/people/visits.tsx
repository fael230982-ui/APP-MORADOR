import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { listVisitForecasts, notifyArrivedVisits, updateVisitForecastStatus, type VisitForecast } from '../../services/visitForecasts';
import { useAuthStore } from '../../store/useAuthStore';

const FILTERS = [
  { id: 'TODAY', label: 'Hoje' },
  { id: 'FUTURE', label: 'Futuros' },
  { id: 'ARRIVED', label: 'Confirmados' },
  { id: 'EXPIRED', label: 'Encerrados' },
] as const;

function formatDateTime(value?: string | null) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function categoryLabel(value?: string | null) {
  if (value === 'SERVICE_PROVIDER') return 'Prestador';
  if (value === 'RENTER') return 'Locatário';
  if (value === 'RESIDENT') return 'Morador';
  return 'Visitante';
}

function statusLabel(visit: VisitForecast) {
  if (visit.arrivedAt) return 'Chegou';
  if (visit.status === 'EXPIRED') return 'Expirado';
  if (visit.status === 'CANCELLED') return 'Cancelado';
  return 'Previsto';
}

function isSameDay(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function isTomorrow(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getFullYear() === tomorrow.getFullYear() && date.getMonth() === tomorrow.getMonth() && date.getDate() === tomorrow.getDate();
}

function isFuturePending(visit: VisitForecast) {
  if (visit.arrivedAt || visit.status === 'EXPIRED' || visit.status === 'CANCELLED') return false;
  const date = new Date(visit.expectedEntryAt || '');
  if (Number.isNaN(date.getTime())) return false;
  return date > new Date() && !isSameDay(visit.expectedEntryAt);
}

function urgencyLabel(visit: VisitForecast) {
  if (visit.arrivedAt) return null;
  if (visit.status === 'CANCELLED' || visit.status === 'EXPIRED') return null;
  if (isSameDay(visit.expectedEntryAt)) return 'Hoje';
  if (isTomorrow(visit.expectedEntryAt)) return 'Amanhã';
  return null;
}

function releaseModeLabel(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'PORTARIA_APPROVAL') return 'Portaria aprova';
  if (normalized === 'RESIDENT_APPROVAL') return 'Morador aprova';
  if (normalized === 'AUTO_RELEASE') return 'Liberação automática';
  return value || null;
}

export default function VisitsScreen() {
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const [visits, setVisits] = useState<VisitForecast[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('TODAY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notifyArrivedVisits(selectedUnitId);
      const data = await listVisitForecasts(selectedUnitId);
      setVisits(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Sua conta ainda não pode consultar os acessos previstos desta unidade.');
      } else {
        setError('Não foi possível carregar os acessos previstos agora.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId]);

  useAutoRefresh(loadVisits, { enabled: !!selectedUnitId, intervalMs: 30000, topics: ['visits', 'unit', 'realtime'] });

  const counts = useMemo(
    () => ({
      today: visits.filter(
        (visit) => !visit.arrivedAt && visit.status !== 'EXPIRED' && visit.status !== 'CANCELLED' && isSameDay(visit.expectedEntryAt)
      ).length,
      future: visits.filter(isFuturePending).length,
      arrived: visits.filter((visit) => !!visit.arrivedAt).length,
      tomorrow: visits.filter(
        (visit) => !visit.arrivedAt && visit.status !== 'EXPIRED' && visit.status !== 'CANCELLED' && isTomorrow(visit.expectedEntryAt)
      ).length,
    }),
    [visits]
  );

  const filteredVisits = useMemo(() => {
    if (filter === 'TODAY') {
      return visits.filter(
        (visit) => !visit.arrivedAt && visit.status !== 'EXPIRED' && visit.status !== 'CANCELLED' && isSameDay(visit.expectedEntryAt)
      );
    }
    if (filter === 'FUTURE') return visits.filter(isFuturePending);
    if (filter === 'ARRIVED') return visits.filter((visit) => !!visit.arrivedAt);
    return visits.filter((visit) => visit.status === 'EXPIRED' || visit.status === 'CANCELLED');
  }, [filter, visits]);

  async function handleCancel(visit: VisitForecast) {
    Alert.alert('Cancelar acesso', 'Esse acesso deixará de ficar autorizado para a portaria.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar acesso',
        style: 'destructive',
        onPress: async () => {
          try {
            setUpdatingId(visit.id);
            const updated = await updateVisitForecastStatus(visit.id, 'CANCELLED');
            setVisits((current) => current.map((item) => (item.id === visit.id ? updated : item)));
          } catch (err: any) {
            Alert.alert(
              'Não foi possível cancelar',
              err?.response?.data?.message || 'Sua conta ainda não pode cancelar este acesso.'
            );
          } finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  }

  const renderItem = ({ item }: { item: VisitForecast }) => {
    const arrived = !!item.arrivedAt;
    const urgentLabel = urgencyLabel(item);
    const canCancel = !arrived && item.status !== 'EXPIRED' && item.status !== 'CANCELLED';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.86}
        onPress={() =>
          router.push({
            pathname: '/people/visit-detail',
            params: {
              id: item.id,
              visitorName: item.visitorName,
              category: item.categoryLabel || categoryLabel(item.category),
              status: statusLabel(item),
              expectedEntryAt: item.expectedEntryAt || '',
              expectedExitAt: item.expectedExitAt || '',
              arrivedAt: item.arrivedAt || '',
              document: item.visitorDocument || '',
              phone: item.visitorPhone || '',
              notes: item.notes || '',
            },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, arrived && styles.iconBoxSuccess]}>
            <Ionicons
              name={arrived ? 'checkmark-circle-outline' : 'calendar-outline'}
              size={22}
              color={arrived ? colors.success : colors.primary}
            />
          </View>
          <View style={styles.cardTitleArea}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.visitorName}
              </Text>
              {urgentLabel ? (
                <View style={[styles.urgencyPill, urgentLabel === 'Hoje' && styles.urgencyPillToday]}>
                  <Text style={[styles.urgencyText, urgentLabel === 'Hoje' && styles.urgencyTextToday]}>{urgentLabel}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.category}>{item.categoryLabel || categoryLabel(item.category)}</Text>
            {item.releaseMode ? <Text style={styles.releaseMode}>{releaseModeLabel(item.releaseMode)}</Text> : null}
          </View>
          <View style={[styles.statusPill, arrived && styles.statusPillSuccess]}>
            <Text style={[styles.statusText, arrived && styles.statusTextSuccess]}>{statusLabel(item)}</Text>
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.detailText}>Entrada: {formatDateTime(item.expectedEntryAt)}</Text>
          <Text style={styles.detailText}>Saída: {formatDateTime(item.expectedExitAt)}</Text>
          {item.arrivedAt ? <Text style={styles.detailText}>Chegada: {formatDateTime(item.arrivedAt)}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryAction}
            activeOpacity={0.86}
            onPress={() => router.push(`/people/visit-detail?id=${item.id}`)}
          >
            <Text style={styles.secondaryActionText}>Ver detalhes</Text>
          </TouchableOpacity>
          {canCancel ? (
            <TouchableOpacity
              style={[styles.dangerAction, updatingId === item.id && styles.buttonDisabled]}
              disabled={updatingId === item.id}
              activeOpacity={0.86}
              onPress={() => handleCancel(item)}
            >
              <Text style={styles.dangerActionText}>{updatingId === item.id ? 'Cancelando...' : 'Cancelar'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (!selectedUnitId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Acessos previstos',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />

        <View style={styles.emptyScreen}>
          <EmptyState
            icon="calendar-outline"
            title="Escolha uma unidade"
            description="Selecione a unidade que deseja acompanhar para ver visitantes, prestadores e locatários autorizados."
          />
          <TouchableOpacity style={styles.selectUnitButton} activeOpacity={0.86} onPress={() => setShowUnitModal(true)}>
            <Text style={styles.selectUnitButtonText}>Selecionar unidade</Text>
          </TouchableOpacity>
        </View>
        <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Acessos previstos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.subtitle}>{selectedUnitName || 'Unidade ativa'}</Text>
        <Text style={styles.description}>
          Visitantes, prestadores e locatários autorizados para entrar em datas combinadas.
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{counts.today}</Text>
            <Text style={styles.summaryLabel}>hoje</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{counts.tomorrow}</Text>
            <Text style={styles.summaryLabel}>amanhã</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{counts.arrived}</Text>
            <Text style={styles.summaryLabel}>confirmados</Text>
          </View>
        </View>
        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const active = filter === item.id;
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
      </View>

      {loading && visits.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando acessos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVisits} tintColor={colors.primary} />}
          ListHeaderComponent={
            <TouchableOpacity style={styles.primaryAction} activeOpacity={0.86} onPress={() => router.push('/people/access-form?type=VISITOR')}>
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.primaryActionText}>Autorizar novo acesso</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Nenhum acesso nesta lista"
              description={error || 'Visitantes, prestadores e locatários aparecerão aqui conforme a data e o status.'}
            />
          }
        />
      )}
      <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13, fontWeight: '800', marginBottom: 12 },
  description: { color: colors.text, fontSize: 13, lineHeight: 19, marginBottom: 12, textAlign: 'justify' },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  summaryValue: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  summaryLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: colors.white },
  list: { padding: 18, paddingBottom: 100 },
  emptyScreen: { flex: 1, paddingHorizontal: 18, paddingBottom: 40, justifyContent: 'center' },
  selectUnitButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  selectUnitButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  primaryAction: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSuccess: { backgroundColor: colors.successSoft },
  cardTitleArea: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '900' },
  category: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 3 },
  releaseMode: { color: colors.primary, fontSize: 11, fontWeight: '800', marginTop: 5 },
  urgencyPill: { backgroundColor: colors.cardSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  urgencyPillToday: { backgroundColor: colors.warningSoft },
  urgencyText: { color: colors.textMuted, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  urgencyTextToday: { color: colors.warning },
  statusPill: { backgroundColor: colors.primarySoft, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  statusPillSuccess: { backgroundColor: colors.successSoft },
  statusText: { color: colors.primary, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  statusTextSuccess: { color: colors.success },
  detailBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  detailText: { color: colors.textMuted, fontSize: 12, lineHeight: 19, textAlign: 'justify' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  secondaryAction: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryActionText: { color: colors.primary, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  dangerAction: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dangerActionText: { color: colors.danger, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  buttonDisabled: { opacity: 0.7 },
});
