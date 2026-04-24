import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { getAlarmsByStatus } from '../../services/alarms';
import { alertService } from '../../services/alertService';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';
import type { AlarmItem } from '../../types/alarm';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'UNREAD', label: 'Não lidos' },
  { id: 'READ', label: 'Lidos' },
] as const;

const TYPE_FILTERS = [
  { id: 'ALL', label: 'Tipos' },
  { id: 'UNKNOWN_PERSON', label: 'Sem cadastro' },
  { id: 'ACCESS_DENIED', label: 'Acesso negado' },
  { id: 'CAMERA_OFFLINE', label: 'Câmera offline' },
  { id: 'PANIC', label: 'Pânico' },
] as const;

function badgeType(status: AlarmItem['status']) {
  if (status === 'UNREAD') return 'warning';
  if (status === 'READ') return 'success';
  return 'info';
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatWorkflowStatus(value?: string | null) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'NEW') return 'Nova ocorrência';
  if (normalized === 'ON_HOLD') return 'Em acompanhamento';
  if (normalized === 'RESOLVED') return 'Resolvida pela operação';
  return null;
}

function countByType(items: AlarmItem[], type: string) {
  if (type === 'ALL') return items.length;
  return items.filter((item) => item.type === type).length;
}

export default function AlertsScreen() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [alerts, setAlerts] = useState<AlarmItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['id']>('ALL');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]['id']>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<{ uri: string; title: string } | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlarmItem | null>(null);
  const [updatingAlertId, setUpdatingAlertId] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlarmsByStatus(statusFilter);
      setAlerts(data);
    } catch (err: any) {
      if (!err?.response) {
        setError('Não foi possível carregar os alertas agora. Tente novamente em instantes.');
      } else if (err.response.status === 403) {
        setError('Sua conta ainda não pode visualizar os alertas desta área.');
      } else {
        setError('Não foi possível carregar os alertas agora.');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useAutoRefresh(loadAlerts, { intervalMs: 30000, topics: ['alerts', 'unit', 'realtime'] });

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((item) => {
        const typeMatches = typeFilter === 'ALL' ? true : item.type === typeFilter;
        if (!typeMatches) return false;

        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return true;

        const haystack = [item.title, item.description, item.location, item.typeLabel]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      }),
    [alerts, query, typeFilter]
  );

  const unresolvedCount = useMemo(() => alerts.filter((item) => item.status !== 'READ').length, [alerts]);
  const unknownPersonCount = useMemo(
    () => alerts.filter((item) => item.type === 'UNKNOWN_PERSON' && item.status !== 'READ').length,
    [alerts]
  );
  const latestAlert = filteredAlerts[0] || null;
  const latestWithCamera = filteredAlerts.find((item) => !!item.cameraId) || null;
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');

  async function handleMarkAsRead(item: AlarmItem) {
    try {
      setUpdatingAlertId(item.id);
      await alertService.markAsRead(item.id);

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === item.id
            ? {
                ...alert,
                status: 'READ' as const,
                statusLabel: 'Lido',
                readAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        Alert.alert('Ação ainda não liberada', 'Sua conta ainda não pode marcar alertas como lidos por aqui.');
        return;
      }

      if (status === 404) {
        Alert.alert('Alerta indisponível', 'Este alerta não está mais disponível para atualização.');
        return;
      }

      Alert.alert('Não foi possível marcar como lido', 'Tente novamente em instantes.');
    } finally {
      setUpdatingAlertId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Alertas" />

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Central de segurança</Text>
        <Text style={styles.summaryText}>
          {unresolvedCount > 0
            ? unresolvedCount === 1
              ? '1 alerta ainda precisa de atenção.'
              : `${unresolvedCount} alertas ainda precisam de atenção.`
            : 'Nenhum alerta pendente no momento.'}
        </Text>
        <View style={styles.summaryChips}>
          <View style={[styles.summaryChip, styles.summaryChipDanger]}>
            <Text style={styles.summaryChipValue}>{unresolvedCount}</Text>
            <Text style={styles.summaryChipLabel}>pendentes</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipValue}>{unknownPersonCount}</Text>
            <Text style={styles.summaryChipLabel}>sem cadastro</Text>
          </View>
        </View>
        {latestAlert ? (
          <View style={styles.latestRow}>
            <Text style={styles.latestText}>Último evento: {latestAlert.typeLabel} em {latestAlert.location}</Text>
            {latestWithCamera && camerasEnabled ? (
              <TouchableOpacity style={styles.latestAction} onPress={() => router.push('/cameras')}>
                <Text style={styles.latestActionText}>Abrir câmeras</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.filters}>
        {STATUS_FILTERS.map((item) => {
          const active = item.id === statusFilter;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterButton, active && styles.filterButtonActive]}
              onPress={() => setStatusFilter(item.id)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchArea}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por local, tipo ou descrição"
          placeholderTextColor={colors.textSubtle}
          style={styles.searchInput}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle-outline" size={18} color={colors.textSubtle} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.typeFilters}>
        {TYPE_FILTERS.map((item) => {
          const active = item.id === typeFilter;
          const count = countByType(alerts, item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.typeFilterButton, active && styles.typeFilterButtonActive]}
              onPress={() => setTypeFilter(item.id)}
            >
              <Text style={[styles.typeFilterText, active && styles.typeFilterTextActive]}>
                {item.label}{item.id === 'ALL' ? '' : ` (${count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && alerts.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando alertas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAlerts} tintColor={colors.primary} />}
          ListHeaderComponent={
            error && alerts.length > 0 ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>{error}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title={error ? 'Não foi possível atualizar' : 'Nenhum alerta nesta lista'}
              description={error || 'Quando houver ocorrências relacionadas à sua unidade, elas vão aparecer aqui.'}
            />
          }
          renderItem={({ item }) => {
            const canMarkAsRead = item.status !== 'READ';
            const markingAsRead = updatingAlertId === item.id;

            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.94} onPress={() => setSelectedAlert(item)}>
                {item.snapshotUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => setExpandedImage({ uri: item.snapshotUrl!, title: item.title })}
                  >
                    <Image source={{ uri: item.snapshotUrl }} style={styles.img} resizeMode="cover" />
                    <View style={styles.expandHint}>
                      <Ionicons name="expand-outline" size={14} color={colors.white} />
                      <Text style={styles.expandHintText}>Tela cheia</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imgPlaceholder}>
                    <Text style={styles.imgPlaceholderText}>Imagem do evento indisponível</Text>
                  </View>
                )}

                <View style={styles.body}>
                  <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    <StatusBadge label={item.statusLabel} type={badgeType(item.status)} />
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaChip}>{item.typeLabel}</Text>
                    <Text style={styles.metaChip}>{item.location}</Text>
                    {typeof item.confidence === 'number' ? (
                      <Text style={styles.metaChip}>Confiança {Math.round(item.confidence)}%</Text>
                    ) : null}
                  </View>

                  <Text style={styles.desc}>{item.description || 'Ocorrência registrada para sua unidade.'}</Text>
                  {item.workflowStatus ? (
                    <Text style={styles.workflowText}>{formatWorkflowStatus(item.workflowStatus) || item.workflowStatus}</Text>
                  ) : null}
                  <Text style={styles.meta}>{formatDateTime(item.detectedAt)}</Text>

                  <View style={styles.actionsRow}>
                    {item.cameraId && camerasEnabled ? (
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/cameras')}>
                        <Text style={styles.secondaryButtonText}>Abrir câmera</Text>
                      </TouchableOpacity>
                    ) : null}

                    {canMarkAsRead ? (
                      <TouchableOpacity
                        style={[styles.primaryButton, markingAsRead && styles.buttonDisabled]}
                        disabled={markingAsRead}
                        onPress={() => handleMarkAsRead(item)}
                      >
                        <Text style={styles.primaryButtonText}>{markingAsRead ? 'Atualizando...' : 'Marcar como lido'}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.resolvedPill}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                        <Text style={styles.resolvedPillText}>
                          Lido{item.readAt ? ` em ${formatDateTime(item.readAt)}` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Modal visible={!!expandedImage} transparent animationType="fade" onRequestClose={() => setExpandedImage(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setExpandedImage(null)}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          {expandedImage ? (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{expandedImage.title}</Text>
              <Image source={{ uri: expandedImage.uri }} style={styles.fullscreenImage} resizeMode="contain" />
            </View>
          ) : null}
        </View>
      </Modal>
      <Modal visible={!!selectedAlert} transparent animationType="slide" onRequestClose={() => setSelectedAlert(null)}>
        <View style={styles.detailBackdrop}>
          <View style={styles.detailSheet}>
            <View style={styles.detailHeader}>
              <View style={styles.detailTitleArea}>
                <Text style={styles.detailTitle}>{selectedAlert?.title || 'Detalhe do alerta'}</Text>
                {selectedAlert ? <StatusBadge label={selectedAlert.statusLabel} type={badgeType(selectedAlert.status)} /> : null}
              </View>
              <TouchableOpacity onPress={() => setSelectedAlert(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedAlert?.snapshotUrl ? (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setExpandedImage({ uri: selectedAlert.snapshotUrl!, title: selectedAlert.title })}
              >
                <Image source={{ uri: selectedAlert.snapshotUrl }} style={styles.detailImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : null}

            <View style={styles.detailBody}>
              <Text style={styles.detailMeta}>
                {selectedAlert?.typeLabel || 'Alerta'} • {selectedAlert?.location || 'Local não informado'}
              </Text>
              {selectedAlert?.description ? <Text style={styles.detailDescription}>{selectedAlert.description}</Text> : null}
              {selectedAlert?.workflowStatus ? (
                <Text style={styles.detailWorkflow}>{formatWorkflowStatus(selectedAlert.workflowStatus) || selectedAlert.workflowStatus}</Text>
              ) : null}
              <Text style={styles.detailDate}>{formatDateTime(selectedAlert?.detectedAt)}</Text>
            </View>

            <View style={styles.detailActions}>
              {selectedAlert?.cameraId && camerasEnabled ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setSelectedAlert(null);
                    router.push('/cameras');
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Abrir câmera</Text>
                </TouchableOpacity>
              ) : null}

              {selectedAlert && selectedAlert.status !== 'READ' ? (
                <TouchableOpacity
                  style={[styles.primaryButton, updatingAlertId === selectedAlert.id && styles.buttonDisabled]}
                  disabled={updatingAlertId === selectedAlert.id}
                  onPress={() => handleMarkAsRead(selectedAlert)}
                >
                  <Text style={styles.primaryButtonText}>
                    {updatingAlertId === selectedAlert.id ? 'Atualizando...' : 'Marcar como lido'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resolvedPill}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={styles.resolvedPillText}>
                    Lido{selectedAlert?.readAt ? ` em ${formatDateTime(selectedAlert.readAt)}` : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryBox: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  summaryText: { color: colors.textMuted, fontSize: 13, lineHeight: 18, textAlign: 'justify' },
  summaryChips: { flexDirection: 'row', gap: 10, marginTop: 12 },
  summaryChip: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    padding: 10,
    alignItems: 'center',
  },
  summaryChipDanger: { backgroundColor: colors.dangerSoft },
  summaryChipValue: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  summaryChipLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  latestText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'justify' },
  latestRow: { marginTop: 10, gap: 10 },
  latestAction: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  latestActionText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 },
  searchArea: {
    marginHorizontal: 18,
    marginBottom: 10,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 10 },
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
  typeFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, paddingBottom: 10 },
  typeFilterButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typeFilterButtonActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  typeFilterText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  typeFilterTextActive: { color: colors.primary },
  list: { padding: 18, paddingBottom: 100 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  noticeBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700', textAlign: 'justify' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    gap: 14,
    maxHeight: '84%',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailTitleArea: { flex: 1, gap: 8 },
  detailTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  detailImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.cardSoft },
  detailBody: { gap: 10 },
  detailMeta: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  detailDescription: { color: colors.text, fontSize: 15, lineHeight: 22 },
  detailWorkflow: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  detailDate: { color: colors.textSubtle, fontSize: 13 },
  detailActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  img: { width: '100%', height: 180 },
  expandHint: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expandHintText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  imgPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  imgPlaceholderText: { color: colors.textMuted, textAlign: 'center' },
  body: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' },
  title: { color: colors.text, fontWeight: '900', fontSize: 16, flex: 1 },
  desc: { color: colors.textMuted, marginTop: 10, lineHeight: 19, textAlign: 'justify' },
  workflowText: { color: colors.primary, marginTop: 8, fontSize: 12, fontWeight: '800' },
  meta: { color: colors.textSubtle, marginTop: 8, fontSize: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaChip: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    textAlign: 'center',
  },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 12, textAlign: 'center' },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '800', fontSize: 12, textAlign: 'center' },
  buttonDisabled: { opacity: 0.7 },
  resolvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resolvedPillText: { color: colors.success, fontWeight: '800', fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalClose: { position: 'absolute', top: 54, right: 22, zIndex: 2 },
  modalContent: { width: '100%', alignItems: 'center' },
  modalTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  fullscreenImage: { width: '100%', height: '78%', borderRadius: 8, backgroundColor: '#111827' },
});
