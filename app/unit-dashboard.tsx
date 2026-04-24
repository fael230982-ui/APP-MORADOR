import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenLoader from '../components/ScreenLoader';
import { colors } from '../constants/colors';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import type { AccessLog } from '../services/accessLogs';
import { isResidentFeatureEnabled } from '../services/residentFeatureAccess';
import { loadResidentOverview } from '../services/residentOverview';
import { residentRealtimeService } from '../services/residentRealtime';
import { listUnitResidents } from '../services/unitResidents';
import type { VisitForecast } from '../services/visitForecasts';
import { useAuthStore } from '../store/useAuthStore';

function formatTime(value?: string | null) {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function UnitDashboardScreen() {
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const user = useAuthStore((state) => state.user);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const unitLabel = selectedUnitName || user?.selectedUnitName || user?.unitName || 'Minha unidade';
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');
  const vehiclesEnabled = isResidentFeatureEnabled(residentAppConfig, 'vehicles');
  const residentAccessAllowed = isResidentFeatureEnabled(residentAppConfig, 'access');
  const deliveriesEnabled = isResidentFeatureEnabled(residentAppConfig, 'deliveries');
  const messagesEnabled = isResidentFeatureEnabled(residentAppConfig, 'messages');
  const slimMode = residentAppConfig?.slimMode === true;
  const effectiveUnitId =
    selectedUnitId ??
    user?.selectedUnitId ??
    user?.unitId ??
    (user?.unitIds && user.unitIds.length === 1 ? user.unitIds[0] : null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState(0);
  const [scheduledAccess, setScheduledAccess] = useState(0);
  const [upcomingVisits, setUpcomingVisits] = useState<VisitForecast[]>([]);
  const [recentLogs, setRecentLogs] = useState<AccessLog[]>([]);
  const [cameras, setCameras] = useState(0);
  const [vehicles, setVehicles] = useState(0);
  const [residents, setResidents] = useState(0);
  const [residentPreview, setResidentPreview] = useState<{ id: string; name: string }[]>([]);
  const [deliveries, setDeliveries] = useState(0);
  const [messages, setMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [realtimeLabel, setRealtimeLabel] = useState('Atualizacao periodica');

  const loadDashboard = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    try {
      if (mode === 'refresh') {
        setRefreshing(true);
      } else if (mode === 'initial' && !lastUpdatedAt) {
        setLoading(true);
      }

      setError(null);

      const [overview, residentsResult] = await Promise.all([
        loadResidentOverview({ logLimit: 5, messageLimit: 20, upcomingVisitsLimit: 3 }).catch(() => null),
        effectiveUnitId ? listUnitResidents(effectiveUnitId).catch(() => []) : Promise.resolve([]),
      ]);

      setAlerts((current) => (overview?.alerts.available ? overview.alerts.active : current));
      setDeliveries((current) => (overview?.deliveries.available ? overview.deliveries.pending : current));
      setScheduledAccess((current) => (overview?.visits.available ? overview.visits.scheduled : current));
      setUpcomingVisits((current) => {
        if (overview?.visits.available && overview.visits.upcoming.length > 0) return overview.visits.upcoming;
        return overview?.visits.available ? [] : current;
      });
      setRecentLogs((current) => {
        if (overview?.accessLogs.available && overview.accessLogs.recent.length > 0) return overview.accessLogs.recent;
        return overview?.accessLogs.available ? [] : current;
      });
      setCameras((current) => (overview?.cameras.available ? overview.cameras.total : current));
      setVehicles((current) => (overview?.vehicles.available ? overview.vehicles.total : current));
      setResidents((current) => {
        if (!effectiveUnitId) return 0;
        return residentsResult.length > 0 ? residentsResult.length : current;
      });
      setResidentPreview((current) => {
        if (residentsResult.length > 0) {
          return residentsResult.slice(0, 4).map((item) => ({ id: item.id, name: item.name }));
        }
        return effectiveUnitId ? current : [];
      });
      setMessages((current) => (overview?.messages.available ? overview.messages.unread : current));
      setNotifications((current) => (overview?.notifications.available ? overview.notifications.unread : current));
      setLastUpdatedAt(new Date());
    } catch {
      setError('Nao foi possivel atualizar o resumo da unidade agora.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [effectiveUnitId, lastUpdatedAt]);

  useAutoRefresh(() => loadDashboard(lastUpdatedAt ? 'silent' : 'initial'), {
    enabled: !!effectiveUnitId,
    intervalMs: 45000,
    topics: ['overview', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'vehicles', 'cameras', 'unit', 'realtime'],
  });

  React.useEffect(() => {
    return residentRealtimeService.subscribe((snapshot) => {
      setRealtimeLabel(
        snapshot.status === 'prepared' || snapshot.status === 'connected'
          ? 'Atualizacao automatica'
          : 'Atualizacao periodica'
      );
    });
  }, []);

  const statusText = useMemo(() => {
    if (alerts > 0) return 'Atencao necessaria';
    if (scheduledAccess > 0) return 'Acessos programados';
    return 'Tudo calmo';
  }, [alerts, scheduledAccess]);

  const highlights = useMemo(() => {
    const items: string[] = [];

    if (alerts > 0) {
      items.push(alerts === 1 ? '1 alerta ativo na unidade.' : `${alerts} alertas ativos na unidade.`);
    }
    if (messages + notifications > 0) {
      const total = messages + notifications;
      items.push(total === 1 ? '1 aviso pendente para conferir.' : `${total} avisos pendentes para conferir.`);
    }
    if (deliveries > 0) {
      items.push(deliveries === 1 ? '1 encomenda aguardando retirada.' : `${deliveries} encomendas aguardando retirada.`);
    }
    if (scheduledAccess > 0) {
      items.push(
        scheduledAccess === 1 ? '1 acesso previsto nas proximas horas.' : `${scheduledAccess} acessos previstos nas proximas horas.`
      );
    }

    return items.slice(0, 3);
  }, [alerts, deliveries, messages, notifications, scheduledAccess]);

  if (loading) {
    return <ScreenLoader message="Carregando resumo da unidade..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Minha unidade',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {!effectiveUnitId ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={28} color={colors.primary} />
          <Text style={styles.emptyTitle}>Escolha uma unidade</Text>
          <Text style={styles.emptyDescription}>O resumo aparece quando uma unidade estiver ativa no app.</Text>
          <TouchableOpacity style={styles.emptyAction} activeOpacity={0.86} onPress={() => router.replace('/')}>
            <Text style={styles.emptyActionText}>Voltar para o inicio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard('refresh')} tintColor={colors.primary} />}
        >
          <View style={styles.hero}>
            <Text style={styles.kicker}>Resumo da unidade</Text>
            <Text style={styles.title}>{unitLabel}</Text>
            <Text style={styles.status}>{statusText}</Text>
            <Text style={styles.updated}>
              {lastUpdatedAt
                ? `Atualizado as ${lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Resumo em tempo real'}
            </Text>
            <Text style={styles.updated}>{realtimeLabel}</Text>
            <Text style={styles.updated}>{slimMode ? 'Modo simplificado ativo' : 'Modo completo ativo'}</Text>
          </View>

          {error ? (
            <View style={styles.notice}>
              <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
              <Text style={styles.noticeText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo rapido</Text>
            {highlights.length > 0 ? (
              highlights.map((item) => (
                <View key={item} style={styles.summaryRow}>
                  <Ionicons name="ellipse" size={8} color={colors.primary} />
                  <Text style={styles.summaryText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Sem pendencias no momento.</Text>
            )}
          </View>

          <View style={styles.grid}>
            <Metric title="Pessoas" value={residents} icon="people-outline" route="/people" />
            {residentAccessAllowed ? (
              <Metric title="Acessos previstos" value={scheduledAccess} icon="calendar-outline" route="/people/visits" />
            ) : null}
            {vehiclesEnabled ? <Metric title="Veiculos" value={vehicles} icon="car-outline" route="/people/vehicles" /> : null}
            {deliveriesEnabled ? <Metric title="Encomendas" value={deliveries} icon="cube-outline" route="/deliveries" /> : null}
            {camerasEnabled ? <Metric title="Cameras da unidade" value={cameras} icon="videocam-outline" route="/cameras" /> : null}
            <Metric title="Alertas" value={alerts} icon="notifications-outline" danger={alerts > 0} route="/alerts" />
            <Metric title="Avisos" value={messages + notifications} icon="mail-unread-outline" route="/profile/resident-notifications" />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Atalhos da unidade</Text>
              <TouchableOpacity onPress={() => router.push('/profile/diagnostics')}>
                <Text style={styles.sectionLink}>Diagnosticos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              <HubAction title="Pessoas" icon="people-outline" route="/people" />
              {vehiclesEnabled ? <HubAction title="Veiculos" icon="car-outline" route="/people/vehicles" /> : null}
              {residentAccessAllowed ? <HubAction title="Visitantes" icon="person-add-outline" route="/people/access-form" /> : null}
              {deliveriesEnabled ? <HubAction title="Encomendas" icon="cube-outline" route="/deliveries" /> : null}
              {camerasEnabled ? <HubAction title="Cameras da unidade" icon="videocam-outline" route="/cameras" /> : null}
            </View>
          </View>

          {residentAccessAllowed ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryAction} activeOpacity={0.86} onPress={() => router.push('/people/access-form')}>
                <Ionicons name="person-add-outline" size={20} color={colors.white} />
                <Text style={styles.primaryActionText}>Autorizar visita</Text>
              </TouchableOpacity>
              {deliveriesEnabled ? (
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.86} onPress={() => router.push('/deliveries')}>
                  <Ionicons name="cube-outline" size={18} color={colors.primary} />
                  <Text style={styles.secondaryActionText}>Encomendas</Text>
                </TouchableOpacity>
              ) : vehiclesEnabled ? (
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.86} onPress={() => router.push('/people/vehicles')}>
                  <Ionicons name="car-outline" size={18} color={colors.primary} />
                  <Text style={styles.secondaryActionText}>Veiculos</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Moradores da unidade</Text>
              <TouchableOpacity onPress={() => router.push('/profile')}>
                <Text style={styles.sectionLink}>Ver perfil</Text>
              </TouchableOpacity>
            </View>

            {residentPreview.length > 0 ? (
              residentPreview.map((resident) => (
                <View key={resident.id} style={styles.summaryRow}>
                  <Ionicons name="person-outline" size={14} color={colors.primary} />
                  <Text style={styles.summaryText}>{resident.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum morador retornado pela API para a unidade ativa.</Text>
            )}
          </View>

          {residentAccessAllowed ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Proximos acessos</Text>
                <TouchableOpacity onPress={() => router.push('/people/visits')}>
                  <Text style={styles.sectionLink}>Ver previstos</Text>
                </TouchableOpacity>
              </View>

              {upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit) => (
                  <TouchableOpacity key={visit.id} style={styles.accessRow} activeOpacity={0.86} onPress={() => router.push('/people/visits')}>
                    <View style={styles.accessIcon}>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.accessTextArea}>
                      <Text style={styles.accessName}>{visit.visitorName}</Text>
                      <Text style={styles.accessMeta}>
                        {visit.categoryLabel || categoryLabel(visit.category)} - {formatTime(visit.expectedEntryAt)}
                      </Text>
                    </View>
                    <Text style={styles.accessStatus}>Agendado</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma visita, prestador ou locatario previsto.</Text>
              )}
            </View>
          ) : null}

          {residentAccessAllowed ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ultimos acessos</Text>
                <TouchableOpacity onPress={() => router.push('/people/access-history')}>
                  <Text style={styles.sectionLink}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <View key={log.id} style={styles.accessRow}>
                    <View style={styles.accessIcon}>
                      <Ionicons
                        name={log.result === 'DENIED' ? 'close-circle-outline' : log.direction === 'EXIT' ? 'exit-outline' : 'enter-outline'}
                        size={18}
                        color={log.result === 'DENIED' ? colors.danger : colors.primary}
                      />
                    </View>
                    <View style={styles.accessTextArea}>
                      <Text style={styles.accessName}>{log.personName || log.classificationLabel || 'Acesso registrado'}</Text>
                      <Text style={styles.accessMeta}>{formatTime(log.timestamp)}</Text>
                    </View>
                    <Text style={styles.accessStatus}>
                      {log.result === 'DENIED' ? 'Negado' : log.direction === 'EXIT' ? 'Saida' : 'Entrada'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum acesso registrado recentemente.</Text>
              )}
            </View>
          ) : null}

          {!messagesEnabled ? (
            <View style={styles.notice}>
              <Ionicons name="chatbubbles-outline" size={18} color={colors.warning} />
              <Text style={styles.noticeText}>As mensagens operacionais desta unidade estao desabilitadas na configuracao atual.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function categoryLabel(value?: string | null) {
  if (value === 'SERVICE_PROVIDER') return 'Prestador';
  if (value === 'RENTER') return 'Locatario';
  if (value === 'RESIDENT') return 'Morador';
  return 'Visitante';
}

function Metric({
  title,
  value,
  icon,
  route,
  danger,
}: {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.metricCard} activeOpacity={0.86} onPress={() => router.push(route as any)}>
      <View style={[styles.metricIcon, danger && styles.metricIconDanger]}>
        <Ionicons name={icon} size={22} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.metricValue, danger && styles.metricValueDanger]}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function HubAction({
  title,
  icon,
  route,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}) {
  return (
    <TouchableOpacity style={styles.hubAction} activeOpacity={0.86} onPress={() => router.push(route as any)}>
      <View style={styles.hubActionIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.hubActionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 18, paddingBottom: 100 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  emptyDescription: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  emptyAction: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 16,
  },
  emptyActionText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  hero: { backgroundColor: colors.primary, borderRadius: 8, padding: 18, marginBottom: 14 },
  kicker: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 8 },
  status: {
    alignSelf: 'flex-start',
    color: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 12,
  },
  updated: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 12 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  summaryTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  summaryText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  primaryAction: {
    flex: 1.3,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryActionText: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  secondaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  secondaryActionText: { color: colors.primary, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  metricCard: {
    width: '47.9%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricIconDanger: { backgroundColor: colors.dangerSoft },
  metricValue: { color: colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  metricValueDanger: { color: colors.danger },
  metricTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  sectionLink: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hubAction: {
    width: '47.5%',
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 12,
    justifyContent: 'center',
    gap: 10,
  },
  hubActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubActionTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accessIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessTextArea: { flex: 1 },
  accessName: { color: colors.text, fontSize: 14, fontWeight: '900' },
  accessMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  accessStatus: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
