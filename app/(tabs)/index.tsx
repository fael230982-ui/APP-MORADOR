import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeveloperSignature from '../../components/DeveloperSignature';
import ScreenLoader from '../../components/ScreenLoader';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import UserAvatar from '../../components/UserAvatar';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useAuth } from '../../hooks/useAuth';
import { facialStatusService, getFacialStatusLabel, type FacialSyncStatus } from '../../services/facialStatus';
import { hapticFeedback } from '../../services/haptics';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { loadResidentOverview } from '../../services/residentOverview';
import { residentRealtimeService } from '../../services/residentRealtime';
import { listUnitResidents } from '../../services/unitResidents';
import { notifyArrivedVisits } from '../../services/visitForecasts';
import type { AccessLog } from '../../services/accessLogs';
import { useAuthStore } from '../../store/useAuthStore';

const quickActions = [
  { label: 'Pessoas', icon: 'people-outline', route: '/people' },
  { label: 'Câmeras', icon: 'videocam-outline', route: '/cameras' },
  { label: 'Encomendas', icon: 'cube-outline', route: '/deliveries' },
  { label: 'Mensagens', icon: 'chatbubbles-outline', route: '/messages' },
  { label: 'Chegada', icon: 'navigate-outline', route: '/resident-actions' },
  { label: 'Veículos', icon: 'car-outline', route: '/people/vehicles' },
  { label: 'Suporte', icon: 'headset-outline', route: '/profile/support' },
] as const;

function formatShortDate(value?: string | null) {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [summary, setSummary] = useState<any>(null);
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(0);
  const [scheduledAccessCount, setScheduledAccessCount] = useState(0);
  const [cameraCount, setCameraCount] = useState(0);
  const [recentAccessLogs, setRecentAccessLogs] = useState<AccessLog[]>([]);
  const [residentCount, setResidentCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [facialStatus, setFacialStatus] = useState<FacialSyncStatus>({ state: 'UNKNOWN' });
  const [realtimeBadge, setRealtimeBadge] = useState<'Atualização periódica' | 'Atualização automática'>(
    'Atualização periódica'
  );

  const effectiveUnitId =
    selectedUnitId ??
    user?.selectedUnitId ??
    user?.unitId ??
    (user?.unitIds && user.unitIds.length === 1 ? user.unitIds[0] : null);

  const loadData = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
      try {
        if (mode === 'refresh') {
          setRefreshing(true);
        } else if (mode === 'initial' && !lastUpdatedAt) {
          setLoading(true);
        }

        setLoadError(null);

        const [overview, facialData, residentsResult] = await Promise.all([
          loadResidentOverview({ logLimit: 3, messageLimit: 20, upcomingVisitsLimit: 3 }).catch(() => null),
          facialStatusService.get().catch(
            (): FacialSyncStatus => ({ state: 'UNKNOWN', updatedAt: null, photoUri: null })
          ),
          effectiveUnitId ? listUnitResidents(effectiveUnitId).catch(() => []) : Promise.resolve([]),
        ]);

        if (effectiveUnitId) {
          notifyArrivedVisits(effectiveUnitId).catch(() => undefined);
        }

        setSummary((current: any) => (overview?.alerts?.available ? overview.alerts : current));
        setPendingDeliveriesCount((current) => (overview?.deliveries.available ? overview.deliveries.pending : current));
        setScheduledAccessCount((current) => (overview?.visits.available ? overview.visits.scheduled : current));
        setRecentAccessLogs((current) => {
          if (overview?.accessLogs.available && overview.accessLogs.recent.length > 0) return overview.accessLogs.recent;
          return overview?.accessLogs.available ? [] : current;
        });
        setResidentCount((current) => {
          if (!effectiveUnitId) return 0;
          return residentsResult.length > 0 ? residentsResult.length : current;
        });
        setCameraCount((current) => (overview?.cameras.available ? overview.cameras.total : current));
        setUnreadNotificationsCount((current) => (overview?.notifications.available ? overview.notifications.unread : current));
        setUnreadMessagesCount((current) => (overview?.messages.available ? overview.messages.unread : current));
        setFacialStatus((current) => overview?.facial ?? facialData ?? current);
        setLastUpdatedAt(new Date());
      } catch {
        setLoadError('Não foi possível atualizar o painel agora.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [effectiveUnitId, lastUpdatedAt]
  );

  useAutoRefresh(() => loadData(lastUpdatedAt ? 'silent' : 'initial'), {
    intervalMs: 45000,
    topics: ['overview', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'unit', 'profile', 'realtime'],
  });

  React.useEffect(() => {
    return residentRealtimeService.subscribe((snapshot) => {
      setRealtimeBadge(
        snapshot.status === 'prepared' || snapshot.status === 'connected'
          ? 'Atualização automática'
          : 'Atualização periódica'
      );
    });
  }, []);

  const firstName = user?.name?.trim() ? user.name.split(' ')[0] : 'Morador';
  const unitLabel = selectedUnitName || user?.selectedUnitName || user?.unitName || 'Selecionar unidade';
  const updatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const activeAlertsCount = (summary?.unauthorized || 0) + (summary?.underReview || 0);
  const slimMode = residentAppConfig?.slimMode === true;
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');
  const deliveriesEnabled = isResidentFeatureEnabled(residentAppConfig, 'deliveries');
  const messagesEnabled = isResidentFeatureEnabled(residentAppConfig, 'messages');
  const vehiclesEnabled = isResidentFeatureEnabled(residentAppConfig, 'vehicles');
  const accessEnabled = isResidentFeatureEnabled(residentAppConfig, 'access');
  const fallbackPhotoUri = facialStatus.localPhotoDataUri ?? facialStatus.localPhotoUri ?? null;
  const effectivePhotoUri = user?.photoUri ?? facialStatus.photoUri ?? fallbackPhotoUri ?? null;

  const riskLabel = useMemo(() => {
    if (activeAlertsCount === 0) return 'Tudo calmo';
    if (summary?.unauthorized > 0) return 'Atenção imediata';
    return 'Em acompanhamento';
  }, [activeAlertsCount, summary]);

  const securityStatus = summary?.unauthorized > 0 ? 'Crítico' : activeAlertsCount > 0 ? 'Atenção' : 'Seguro';
  const latestEventLabel =
    summary?.latestTitle && summary?.latestLocation
      ? `${summary.latestTitle} em ${summary.latestLocation}`
      : summary?.latestTitle || 'Nenhum evento recente';
  const facialLabel = getFacialStatusLabel(facialStatus);

  const heroTone = useMemo(() => {
    if (summary?.unauthorized > 0) {
      return {
        background: colors.danger,
        border: colors.danger,
        pillBorder: 'rgba(255,255,255,0.38)',
        icon: colors.white,
      };
    }

    if (activeAlertsCount > 0) {
      return {
        background: colors.warning,
        border: colors.warning,
        pillBorder: 'rgba(255,255,255,0.38)',
        icon: colors.white,
      };
    }

    return {
      background: colors.primary,
      border: colors.primary,
      pillBorder: 'rgba(255,255,255,0.38)',
      icon: colors.white,
    };
  }, [activeAlertsCount, summary]);

  const attentionItems = useMemo(() => {
    const items: string[] = [];

    if (activeAlertsCount > 0) {
      items.push(activeAlertsCount === 1 ? '1 alerta precisa de atenção.' : `${activeAlertsCount} alertas precisam de atenção.`);
    }
    if (scheduledAccessCount > 0) {
      items.push(
        scheduledAccessCount === 1 ? '1 acesso previsto para acompanhar.' : `${scheduledAccessCount} acessos previstos para acompanhar.`
      );
    }
    if (pendingDeliveriesCount > 0) {
      items.push(
        pendingDeliveriesCount === 1 ? '1 encomenda aguardando retirada.' : `${pendingDeliveriesCount} encomendas aguardando retirada.`
      );
    }
    if (unreadMessagesCount > 0) {
      items.push(unreadMessagesCount === 1 ? '1 mensagem nova da portaria.' : `${unreadMessagesCount} mensagens novas da portaria.`);
    }
    if (unreadNotificationsCount > 0) {
      items.push(unreadNotificationsCount === 1 ? '1 aviso novo para você.' : `${unreadNotificationsCount} avisos novos para você.`);
    }

    return items.slice(0, 3);
  }, [activeAlertsCount, pendingDeliveriesCount, scheduledAccessCount, unreadMessagesCount, unreadNotificationsCount]);

  const visibleQuickActions = useMemo(() => {
    const base = quickActions.filter((action) => {
      if (action.route === '/people') return accessEnabled;
      if (action.route === '/cameras') return camerasEnabled;
      if (action.route === '/deliveries') return deliveriesEnabled;
      if (action.route === '/messages') return messagesEnabled;
      if (action.route === '/people/vehicles') return vehiclesEnabled;
      return true;
    });

    if (slimMode) {
      return base.filter((action) => ['/deliveries', '/messages', '/resident-actions', '/profile/support'].includes(action.route));
    }

    return base;
  }, [accessEnabled, camerasEnabled, deliveriesEnabled, messagesEnabled, slimMode, vehiclesEnabled]);

  if (loading) {
    return <ScreenLoader message="Carregando painel..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData('refresh')} tintColor={colors.primary} />}
      >
        <View style={styles.topBar}>
          <UserAvatar
            name={user?.name || firstName}
            photoUri={effectivePhotoUri}
            fallbackPhotoUri={fallbackPhotoUri}
            cacheKey={user?.faceUpdatedAt ?? facialStatus.updatedAt ?? effectivePhotoUri ?? fallbackPhotoUri}
            size={46}
            textSize={20}
          />
          <View style={styles.greetingArea}>
            <Text style={styles.greeting}>Olá, {firstName}</Text>
            <Text style={styles.roleText}>{updatedLabel ? `Atualizado às ${updatedLabel}` : 'App Morador'}</Text>
          </View>
          <View style={styles.topActions}>
            {deliveriesEnabled ? (
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/deliveries')}>
                <Ionicons name="cube-outline" size={22} color={colors.text} />
                {pendingDeliveriesCount > 0 ? (
                  <View style={styles.iconBadge}>
                    <Text style={styles.iconBadgeText}>{pendingDeliveriesCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile/resident-notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadNotificationsCount > 0 || unreadMessagesCount > 0 || activeAlertsCount > 0 ? <View style={styles.alertDot} /> : null}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.unitPill} activeOpacity={0.85} onPress={() => setShowUnitModal(true)}>
          <View style={styles.unitHeaderRow}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
            <View style={styles.unitTextArea}>
              <Text style={styles.unitKicker}>Unidade ativa</Text>
              <Text style={styles.unitName}>{unitLabel}</Text>
            </View>
          </View>
          <View style={styles.unitActionsRow}>
            <TouchableOpacity
              style={styles.unitInlineAction}
              activeOpacity={0.85}
              onPress={(event) => {
                event.stopPropagation();
                router.push('/unit-dashboard');
              }}
            >
              <Text style={styles.unitInlineActionText}>Minha unidade</Text>
            </TouchableOpacity>
            <Text style={styles.unitAction}>{realtimeBadge}</Text>
          </View>
        </TouchableOpacity>

        {!effectiveUnitId ? (
          <View style={styles.inlineNotice}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
            <Text style={styles.inlineNoticeText}>Escolha uma unidade para ver câmeras, pessoas, encomendas e avisos.</Text>
          </View>
        ) : null}

        <View style={[styles.heroCard, { backgroundColor: heroTone.background, borderColor: heroTone.border }]}>
          <View style={styles.heroTop}>
            <Text style={styles.heroKicker}>Segurança da unidade</Text>
            <Ionicons name="shield-checkmark" size={20} color={heroTone.icon} />
          </View>
          <View style={styles.heroMainRow}>
            <Text style={styles.heroTitle}>{riskLabel}</Text>
            <Text style={[styles.statusPill, { borderColor: heroTone.pillBorder }]}>{securityStatus}</Text>
          </View>
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {activeAlertsCount > 0
              ? 'Veja alertas e movimentos recentes da sua unidade.'
              : 'Painel rápido com alertas, acessos e câmeras da unidade.'}
          </Text>
        </View>

        {loadError ? (
          <View style={styles.inlineNotice}>
            <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
            <Text style={styles.inlineNoticeText}>{loadError}</Text>
          </View>
        ) : null}

        <View style={styles.executiveRow}>
          <TouchableOpacity style={styles.executiveCard} activeOpacity={0.86} onPress={() => router.push('/alerts')}>
            <Text style={styles.executiveLabel}>Último evento</Text>
            <Text style={styles.executiveValue} numberOfLines={2}>
              {latestEventLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.executiveCard}
            activeOpacity={0.86}
            onPress={() => router.push(effectivePhotoUri ? '/profile/face-enrollment' : '/profile/edit')}
          >
            <Text style={styles.executiveLabel}>Identificação</Text>
            <Text style={styles.executiveValue} numberOfLines={2}>
              {facialLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.attentionCard}>
          <Text style={styles.attentionTitle}>O que pede atenção agora</Text>
          {attentionItems.length > 0 ? (
            attentionItems.map((item) => (
              <View key={item} style={styles.attentionRow}>
                <Ionicons name="ellipse" size={8} color={colors.primary} />
                <Text style={styles.attentionText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyInlineText}>Sem pendências no momento.</Text>
          )}
        </View>

        <View style={styles.securityGrid}>
          <TouchableOpacity style={styles.securityCard} activeOpacity={0.88} onPress={() => router.push('/alerts')}>
            <View style={[styles.securityIcon, activeAlertsCount > 0 && styles.securityIconDanger]}>
              <Ionicons name="notifications-outline" size={24} color={activeAlertsCount > 0 ? colors.danger : colors.primary} />
            </View>
            <Text style={styles.securityKicker}>Alertas ativos</Text>
            <Text style={[styles.securityValue, activeAlertsCount > 0 && styles.metricDanger]}>{activeAlertsCount}</Text>
              <Text style={styles.securityHint}>Ver ocorrências</Text>
          </TouchableOpacity>

          {accessEnabled ? (
            <TouchableOpacity style={styles.securityCard} activeOpacity={0.88} onPress={() => router.push('/people/visits')}>
              <View style={styles.securityIcon}>
                <Ionicons name="walk-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.securityKicker}>Acessos previstos</Text>
              <Text style={styles.securityValue}>{scheduledAccessCount}</Text>
              <Text style={styles.securityHint}>Gerenciar entradas</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.signalStrip}>
          <TouchableOpacity style={styles.signalItem} activeOpacity={0.86} onPress={() => router.push('/profile')}>
            <Text style={styles.signalValue}>{residentCount}</Text>
            <Text style={styles.signalLabel}>morador{residentCount === 1 ? '' : 'es'}</Text>
          </TouchableOpacity>
          {camerasEnabled ? (
            <TouchableOpacity style={styles.signalItem} activeOpacity={0.86} onPress={() => router.push('/cameras')}>
              <Text style={styles.signalValue}>{cameraCount}</Text>
              <Text style={styles.signalLabel}>câmera{cameraCount === 1 ? '' : 's'}</Text>
            </TouchableOpacity>
          ) : null}
          {messagesEnabled ? (
            <TouchableOpacity style={styles.signalItem} activeOpacity={0.86} onPress={() => router.push('/messages')}>
              <Text style={styles.signalValue}>{unreadMessagesCount}</Text>
              <Text style={styles.signalLabel}>mensagem{unreadMessagesCount === 1 ? '' : 's'}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.signalItem} activeOpacity={0.86} onPress={() => router.push('/profile/resident-notifications')}>
            <Text style={styles.signalValue}>{unreadNotificationsCount}</Text>
            <Text style={styles.signalLabel}>aviso{unreadNotificationsCount === 1 ? '' : 's'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.unitHubCard} activeOpacity={0.88} onPress={() => router.push('/unit-dashboard')}>
          <View style={styles.accessIcon}>
            <Ionicons name="apps-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.accessTextArea}>
            <Text style={styles.accessKicker}>Minha unidade</Text>
            <Text style={styles.accessTitle}>Pessoas, veículos, encomendas, visitantes e câmeras da unidade</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
        </TouchableOpacity>

        {accessEnabled ? (
          <TouchableOpacity style={styles.accessSpotlight} activeOpacity={0.88} onPress={() => router.push('/people')}>
            <View style={styles.accessIcon}>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.accessTextArea}>
              <Text style={styles.accessKicker}>Controle de acesso</Text>
              <Text style={styles.accessTitle}>Gerenciar pessoas autorizadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.assistedArrivalCard} activeOpacity={0.88} onPress={() => router.push('/resident-actions')}>
          <View style={styles.accessIcon}>
            <Ionicons name="shield-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.accessTextArea}>
            <Text style={styles.accessKicker}>Ações rápidas</Text>
            <Text style={styles.accessTitle}>Pânico e entrada assistida</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
        </TouchableOpacity>

        {accessEnabled ? (
          <TouchableOpacity
            style={styles.primaryAccessButton}
            activeOpacity={0.88}
            onPress={() => router.push('/people/access-form')}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.white} />
            <Text style={styles.primaryAccessButtonText}>Autorizar novo acesso</Text>
          </TouchableOpacity>
        ) : null}

        {accessEnabled ? (
          <View style={styles.recentAccessCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimos acessos</Text>
              <TouchableOpacity onPress={() => router.push('/people/access-history')}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {recentAccessLogs.length > 0 ? (
              recentAccessLogs.map((log) => (
                <TouchableOpacity
                  key={log.id}
                  style={styles.recentAccessRow}
                  activeOpacity={0.86}
                  onPress={() => router.push('/people/access-history')}
                >
                  <View style={styles.recentAccessIcon}>
                    <Ionicons
                      name={log.result === 'DENIED' ? 'close-circle-outline' : log.direction === 'EXIT' ? 'exit-outline' : 'enter-outline'}
                      size={18}
                      color={log.result === 'DENIED' ? colors.danger : colors.primary}
                    />
                  </View>
                  <View style={styles.recentAccessTextArea}>
                    <Text style={styles.recentAccessName}>{log.personName || log.classificationLabel || 'Acesso registrado'}</Text>
                    <Text style={styles.recentAccessMeta}>{formatShortDate(log.timestamp)}</Text>
                  </View>
                  <Text style={styles.recentAccessStatus}>
                    {log.result === 'DENIED' ? 'Negado' : log.direction === 'EXIT' ? 'Saída' : 'Entrada'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyInlineText}>Nenhum acesso registrado recentemente.</Text>
            )}
          </View>
        ) : null}

        <View style={styles.quickGrid}>
          {visibleQuickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              activeOpacity={0.85}
              onPress={() => {
                hapticFeedback.light();
                router.push(action.route as any);
              }}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={action.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {residentAppConfig ? (
          <View style={styles.inlineNotice}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
            <Text style={styles.inlineNoticeText}>
              {slimMode
                ? 'Este condomínio está usando o modo simplificado do app.'
                : 'Este condomínio está usando a experiência completa do app.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <DeveloperSignature />
      <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 100 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  greetingArea: { flex: 1 },
  greeting: { color: colors.text, fontSize: 22, fontWeight: '900' },
  roleText: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBadge: {
    position: 'absolute',
    top: 5,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  iconBadgeText: { color: colors.white, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  alertDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  inlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  inlineNoticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  unitPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  unitHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  unitTextArea: { flex: 1 },
  unitActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  unitInlineAction: {
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  unitInlineActionText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  unitKicker: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  unitName: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 2, lineHeight: 22 },
  unitAction: { color: colors.primary, fontSize: 12, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  heroCard: { borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  heroMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  heroKicker: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  heroTitle: { flex: 1, color: colors.white, fontSize: 20, fontWeight: '900' },
  statusPill: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 18 },
  executiveRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  executiveCard: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  executiveLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  executiveValue: { color: colors.text, fontSize: 14, fontWeight: '900', lineHeight: 20 },
  attentionCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  attentionTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  attentionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  attentionText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  securityGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  securityCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
  },
  securityIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  securityIconDanger: { backgroundColor: colors.dangerSoft },
  securityKicker: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  securityValue: { color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  metricDanger: { color: colors.danger },
  securityHint: { color: colors.textSubtle, fontSize: 12, marginTop: 4, fontWeight: '700', textAlign: 'center' },
  signalStrip: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 14,
  },
  signalItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  signalValue: { color: colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  signalLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  unitHubCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  accessSpotlight: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  assistedArrivalCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  accessIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessTextArea: { flex: 1 },
  accessKicker: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  accessTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 3, lineHeight: 21 },
  primaryAccessButton: {
    height: 54,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  primaryAccessButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  recentAccessCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 18,
  },
  sectionHeader: { marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  sectionLink: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  recentAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recentAccessIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentAccessTextArea: { flex: 1 },
  recentAccessName: { color: colors.text, fontSize: 14, fontWeight: '900' },
  recentAccessMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  recentAccessStatus: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  emptyInlineText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 },
  quickAction: {
    width: '30.8%',
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { color: colors.text, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
