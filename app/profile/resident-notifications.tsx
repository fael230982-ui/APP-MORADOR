import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { residentNotificationsService } from '../../services/residentNotifications';
import { useAuthStore } from '../../store/useAuthStore';
import type { ResidentNotification } from '../../types/residentNotification';

const TYPE_FILTERS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ACCESS', label: 'Acessos' },
  { id: 'DELIVERY', label: 'Encomendas' },
  { id: 'MESSAGE', label: 'Mensagens' },
  { id: 'ALERT', label: 'Alertas' },
] as const;

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function typeIcon(type: string) {
  if (type === 'DELIVERY_EVENT') return 'cube-outline';
  if (type === 'ACCESS_EVENT') return 'person-add-outline';
  if (type === 'OPERATION_MESSAGE') return 'chatbubbles-outline';
  if (type === 'CAMERA_EVENT') return 'videocam-outline';
  if (type === 'SECURITY_ALERT') return 'warning-outline';
  return 'notifications-outline';
}

function mediaHints(item: ResidentNotification) {
  const hints: string[] = [];
  if (item.snapshotUrl) hints.push('Snapshot');
  if (item.replayUrl) hints.push('Replay');
  return hints;
}

export default function ResidentNotificationsScreen() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]['id']>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deliveriesEnabled = isResidentFeatureEnabled(residentAppConfig, 'deliveries');
  const messagesEnabled = isResidentFeatureEnabled(residentAppConfig, 'messages');
  const accessEnabled = isResidentFeatureEnabled(residentAppConfig, 'access');
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');

  const loadNotifications = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      try {
        if (mode === 'refresh') {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);
        const result = await residentNotificationsService.list(unreadOnly);
        setNotifications(result);
      } catch (err: any) {
        const status = err?.response?.status;
        setError(
          status === 403
            ? 'As notificacoes ainda nao estao disponiveis para sua conta.'
            : 'Nao foi possivel carregar as notificacoes agora.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [unreadOnly]
  );

  useAutoRefresh(() => loadNotifications(), { intervalMs: 20000, topics: ['notifications', 'unit', 'realtime'] });

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        if (typeFilter === 'ACCESS') return item.type === 'ACCESS_EVENT';
        if (typeFilter === 'DELIVERY') return item.type === 'DELIVERY_EVENT';
        if (typeFilter === 'MESSAGE') return item.type === 'OPERATION_MESSAGE';
        if (typeFilter === 'ALERT') {
          return (
            item.type === 'SECURITY_ALERT' ||
            (item.type === 'GENERIC' && /alerta|seguranca/i.test(`${item.title} ${item.body}`))
          );
        }
        return true;
      }),
    [notifications, typeFilter]
  );

  async function markVisibleAsRead() {
    const unread = filteredNotifications.filter((item) => !item.readAt);
    if (unread.length === 0) return;

    const now = new Date().toISOString();

    try {
      await residentNotificationsService.markAllAsRead();
      setNotifications((current) => current.map((item) => (item.readAt ? item : { ...item, readAt: now })));
    } catch {
      await Promise.all(unread.map((item) => residentNotificationsService.markAsRead(item.id).catch(() => null)));
      setNotifications((current) =>
        current.map((item) =>
          unread.some((unreadItem) => unreadItem.id === item.id) ? { ...item, readAt: item.readAt || now } : item
        )
      );
    }
  }

  async function handleOpen(item: ResidentNotification) {
    if (!item.readAt) {
      try {
        const updated = await residentNotificationsService.markAsRead(item.id);
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === item.id ? updated || { ...notification, readAt: new Date().toISOString() } : notification
          )
        );
      } catch {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === item.id ? { ...notification, readAt: new Date().toISOString() } : notification
          )
        );
      }
    }

    if (item.deliveryId && deliveriesEnabled) {
      router.push(`/deliveries/${item.deliveryId}`);
      return;
    }
    if ((item.messageId || item.type === 'OPERATION_MESSAGE') && messagesEnabled) {
      router.push('/messages');
      return;
    }
    if ((item.visitForecastId || item.type === 'ACCESS_EVENT') && accessEnabled) {
      router.push('/people/visits');
      return;
    }
    if (item.alertId || item.type === 'SECURITY_ALERT') {
      router.push('/alerts');
      return;
    }
    if ((item.cameraId || item.type === 'CAMERA_EVENT') && camerasEnabled) {
      router.push('/cameras');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notificacoes" showBack />

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, !unreadOnly && styles.filterButtonActive]}
          onPress={() => setUnreadOnly(false)}
        >
          <Text style={[styles.filterText, !unreadOnly && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, unreadOnly && styles.filterButtonActive]}
          onPress={() => setUnreadOnly(true)}
        >
          <Text style={[styles.filterText, unreadOnly && styles.filterTextActive]}>Nao lidas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeFilters}>
        {TYPE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.typeFilterButton, typeFilter === filter.id && styles.typeFilterButtonActive]}
            onPress={() => setTypeFilter(filter.id)}
          >
            <Text style={[styles.typeFilterText, typeFilter === filter.id && styles.typeFilterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Ionicons name="notifications-outline" size={16} color={colors.primary} />
        <Text style={styles.tipText}>
          Avisos de portaria, acessos, encomendas e alertas aparecem aqui. Toque em um item para abrir a area relacionada.
        </Text>
      </View>

      {filteredNotifications.some((item) => !item.readAt) ? (
        <TouchableOpacity style={styles.markReadButton} activeOpacity={0.86} onPress={markVisibleAsRead}>
          <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
          <Text style={styles.markReadText}>Marcar estas como lidas</Text>
        </TouchableOpacity>
      ) : null}

      {loading && notifications.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando notificacoes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredNotifications.length ? styles.listContent : styles.emptyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications('refresh')} tintColor={colors.primary} />}
          ListHeaderComponent={
            error && notifications.length > 0 ? (
              <View style={styles.errorBox}>
                <Ionicons name="cloud-offline-outline" size={22} color={colors.warning} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title={error ? 'Nao foi possivel atualizar' : 'Nenhuma notificacao'}
              description={
                error || (unreadOnly ? 'Voce nao tem notificacoes pendentes.' : 'Os avisos da unidade vao aparecer aqui.')
              }
            />
          }
          renderItem={({ item }) => {
            const unread = !item.readAt;
            const hints = mediaHints(item);
            return (
              <TouchableOpacity style={styles.notificationCard} activeOpacity={0.86} onPress={() => handleOpen(item)}>
                <View style={[styles.iconBox, unread && styles.iconBoxUnread]}>
                  <Ionicons name={typeIcon(item.type) as any} size={22} color={unread ? colors.primary : colors.textMuted} />
                </View>
                <View style={styles.notificationTextArea}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {unread ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.notificationBody}>{item.body}</Text>
                  {item.domain ? <Text style={styles.notificationMeta}>{item.domain}</Text> : null}
                  {hints.length > 0 ? (
                    <View style={styles.mediaRow}>
                      {hints.map((hint) => (
                        <View key={`${item.id}-${hint}`} style={styles.mediaPill}>
                          <Text style={styles.mediaPillText}>{hint}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingVertical: 14 },
  filterButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
  filterTextActive: { color: colors.white },
  typeFilters: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 10 },
  typeFilterButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  typeFilterButtonActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  typeFilterText: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  typeFilterTextActive: { color: colors.primary },
  tipBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tipText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18 },
  markReadButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markReadText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  errorBox: {
    margin: 18,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  errorText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  listContent: { padding: 18, paddingTop: 2, paddingBottom: 34 },
  emptyContent: { flexGrow: 1 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: { backgroundColor: colors.primarySoft },
  notificationTextArea: { flex: 1 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationTitle: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '900' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  notificationBody: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  notificationMeta: { color: colors.primary, fontSize: 11, marginTop: 6, fontWeight: '800' },
  mediaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  mediaPill: {
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediaPillText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  notificationDate: { color: colors.textSubtle, fontSize: 11, marginTop: 6, fontWeight: '700' },
});
