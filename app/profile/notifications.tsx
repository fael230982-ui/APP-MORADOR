import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import {
  residentNotificationPreferencesService,
  type ResidentNotificationChannel,
  type ResidentNotificationPreferencesRecord,
  type ResidentNotificationPriority,
} from '../../services/residentNotificationPreferences';
import { getNotificationSoundDefinition, type NotificationSoundProfile } from '../../types/notificationSound';
import {
  DEFAULT_LOCAL_NOTIFICATION_PREFS,
  getLocalNotificationPrefs,
  saveLocalNotificationPrefs,
  sendLocalNotification,
  type LocalNotificationPrefs,
  type NotificationCategorySoundMode,
} from '../../utils/notificationService';

type SoundCategoryKey = Exclude<keyof LocalNotificationPrefs, 'reports'>;

const TEST_NOTIFICATION_PRESETS: Record<
  SoundCategoryKey,
  {
    profile: NotificationSoundProfile;
    title: string;
    message: string;
    data: Record<string, string>;
  }
> = {
  alerts: {
    profile: 'ALERT',
    title: 'Teste de alerta',
    message: 'Este teste simula um aviso critico da unidade.',
    data: { type: 'SECURITY_ALERT' },
  },
  deliveries: {
    profile: 'DELIVERY',
    title: 'Teste de encomenda',
    message: 'Este teste simula o aviso de nova encomenda recebida.',
    data: { type: 'DELIVERY_RECEIVED' },
  },
  visits: {
    profile: 'VISIT',
    title: 'Teste de visita',
    message: 'Este teste simula a chegada de uma visita cadastrada.',
    data: { type: 'VISIT_ARRIVED' },
  },
  messages: {
    profile: 'MESSAGE',
    title: 'Teste de mensagem',
    message: 'Este teste simula um comunicado operacional.',
    data: { type: 'RESIDENT_MESSAGE' },
  },
  cameras: {
    profile: 'CAMERA',
    title: 'Teste de camera',
    message: 'Este teste simula um evento ligado a camera e a evidencia.',
    data: { type: 'CAMERA_EVENT' },
  },
};

const SOUND_MODE_OPTIONS: {
  value: NotificationCategorySoundMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'CUSTOM',
    label: 'Personalizado',
    description: 'Usa o som tematico daquela categoria neste aparelho.',
  },
  {
    value: 'DEFAULT',
    label: 'Padrao',
    description: 'Mantem o aviso com o som padrao do aparelho.',
  },
  {
    value: 'SILENT',
    label: 'Silencioso',
    description: 'Mostra a notificacao sem tocar som.',
  },
];

const REMOTE_CHANNEL_OPTIONS: {
  value: ResidentNotificationChannel;
  label: string;
  description: string;
}[] = [
  {
    value: 'PUSH',
    label: 'Push',
    description: 'Canal principal para avisos rapidos no celular.',
  },
  {
    value: 'APP',
    label: 'App',
    description: 'Mantem a preferencia geral do aplicativo como prioridade.',
  },
  {
    value: 'EMAIL',
    label: 'E-mail',
    description: 'Prioriza entrega por e-mail quando esse envio estiver habilitado.',
  },
];

const REMOTE_PRIORITY_OPTIONS: {
  value: ResidentNotificationPriority;
  label: string;
  description: string;
}[] = [
  {
    value: 'LOW',
    label: 'Baixa',
    description: 'Menor urgencia geral para avisos da conta.',
  },
  {
    value: 'MEDIUM',
    label: 'Media',
    description: 'Equilibrio entre volume e prioridade operacional.',
  },
  {
    value: 'HIGH',
    label: 'Alta',
    description: 'Prioriza aviso rapido para eventos importantes da unidade.',
  },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<LocalNotificationPrefs>(DEFAULT_LOCAL_NOTIFICATION_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [testingKey, setTestingKey] = useState<SoundCategoryKey | null>(null);
  const [remotePrefs, setRemotePrefs] = useState<ResidentNotificationPreferencesRecord | null>(null);
  const [remoteSupported, setRemoteSupported] = useState(true);
  const [remoteChannelDraft, setRemoteChannelDraft] = useState<ResidentNotificationChannel>('PUSH');
  const [remotePriorityDraft, setRemotePriorityDraft] = useState<ResidentNotificationPriority>('HIGH');
  const [remoteSaving, setRemoteSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getLocalNotificationPrefs().catch(() => DEFAULT_LOCAL_NOTIFICATION_PREFS),
      residentNotificationPreferencesService
        .getCurrentPreferences()
        .then((remote) => ({ remote, failed: false }))
        .catch(() => ({ remote: null, failed: true })),
    ])
      .then(([stored, remoteResult]) => {
        setPrefs(stored);

        if (remoteResult.failed) {
          setRemoteSupported(false);
          return;
        }

        if (remoteResult.remote) {
          setRemotePrefs(remoteResult.remote);
          setRemoteChannelDraft(remoteResult.remote.channel);
          setRemotePriorityDraft(remoteResult.remote.priority);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveLocalNotificationPrefs(prefs).catch(() => undefined);
  }, [loaded, prefs]);

  const remoteStateText = useMemo(() => {
    if (remotePrefs) {
      return `Escopo: ${formatScopeLabel(remotePrefs.scopeType)} | Canal atual: ${formatChannelLabel(remotePrefs.channel)} | Prioridade atual: ${formatPriorityLabel(remotePrefs.priority)}`;
    }

    if (remoteSupported) {
      return 'A conta ainda nao retornou uma preferencia remota salva.';
    }

    return 'A rota remota falhou neste ambiente. O app segue usando apenas as preferencias locais deste aparelho.';
  }, [remotePrefs, remoteSupported]);

  const remoteHealthLabel = useMemo(() => {
    if (remotePrefs) return 'Sincronizacao remota ativa';
    if (remoteSupported) return 'Conta sem preferencia remota salva';
    return 'Fallback local ativo';
  }, [remotePrefs, remoteSupported]);

  const updateMode = (key: SoundCategoryKey, mode: NotificationCategorySoundMode) => {
    setPrefs((prev) => ({ ...prev, [key]: mode }));
  };

  const toggleReports = () => {
    setPrefs((prev) => ({ ...prev, reports: !prev.reports }));
  };

  async function saveRemotePreferences() {
    try {
      setRemoteSaving(true);
      const saved = await residentNotificationPreferencesService.persistCurrentPreferences({
        channel: remoteChannelDraft,
        priority: remotePriorityDraft,
      });

      if (!saved) {
        setRemoteSupported(false);
        Alert.alert(
          'Preferencia remota indisponivel',
          'Este ambiente ainda nao publicou a rota oficial de preferencias remotas.'
        );
        return;
      }

      setRemoteSupported(true);
      setRemotePrefs(saved);
      setRemoteChannelDraft(saved.channel);
      setRemotePriorityDraft(saved.priority);
      Alert.alert('Preferencia salva', 'A preferencia geral da conta foi atualizada com sucesso.');
    } catch {
      setRemoteSupported(false);
      Alert.alert('Nao foi possivel salvar', 'O backend nao confirmou a atualizacao da preferencia remota.');
    } finally {
      setRemoteSaving(false);
    }
  }

  async function testCategory(key: SoundCategoryKey) {
    const preset = TEST_NOTIFICATION_PRESETS[key];
    if (!preset) return;

    try {
      setTestingKey(key);
      await sendLocalNotification(
        preset.title,
        preset.message,
        {
          ...preset.data,
          source: 'notification-settings-test',
        },
        { profile: preset.profile }
      );
    } catch {
      Alert.alert('Nao foi possivel testar', 'O aparelho nao permitiu disparar a notificacao de teste.');
    } finally {
      setTestingKey(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Notificacoes',
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
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Sons por categoria</Text>
          <Text style={styles.noticeText}>
            Cada categoria pode usar som personalizado, som padrao ou modo silencioso. O aviso continua chegando mesmo
            quando o som tematico estiver desligado.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            Os sons abaixo continuam sendo configurados neste aparelho. A API atual publica uma preferencia remota mais
            geral por conta, sem substituir essa granularidade por categoria.
          </Text>
        </View>

        {!remoteSupported ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Preferencia remota indisponivel</Text>
            <Text style={styles.noticeText}>
              O backend nao confirmou a leitura das preferencias remotas da conta. Este aparelho continuara usando so
              as configuracoes locais.
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <SectionTitle
            title="Preferencia geral da conta"
            description="Esse ajuste remoto define o canal e a prioridade geral dos avisos da conta."
          />

          <View style={styles.categoryRow}>
            <View style={styles.info}>
              <Text style={styles.title}>Estado remoto</Text>
              <Text style={styles.modeSummary}>{remoteHealthLabel}</Text>
              <Text style={styles.desc}>{remoteStateText}</Text>
            </View>

            <View style={styles.optionRow}>
              {REMOTE_CHANNEL_OPTIONS.map((option) => {
                const selected = option.value === remoteChannelDraft;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => setRemoteChannelDraft(option.value)}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
                    <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.optionRow}>
              {REMOTE_PRIORITY_OPTIONS.map((option) => {
                const selected = option.value === remotePriorityDraft;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    onPress={() => setRemotePriorityDraft(option.value)}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
                    <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.testButton} onPress={() => void saveRemotePreferences()} disabled={remoteSaving}>
              <Ionicons name="cloud-upload-outline" size={16} color={colors.primary} />
              <Text style={styles.testButtonText}>{remoteSaving ? 'Salvando...' : 'Salvar na conta'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <SectionTitle
            title="Categorias principais"
            description="Defina como cada tipo de aviso deve soar neste aparelho."
          />

          <CategorySoundRow
            profile="ALERT"
            title="Alertas"
            description="Pessoas nao autorizadas, panico e situacoes de risco."
            value={prefs.alerts}
            onChange={(mode) => updateMode('alerts', mode)}
            onTest={() => testCategory('alerts')}
            testing={testingKey === 'alerts'}
          />
          <Divider />
          <CategorySoundRow
            profile="DELIVERY"
            title="Encomendas"
            description="Quando a portaria registrar uma encomenda para a unidade."
            value={prefs.deliveries}
            onChange={(mode) => updateMode('deliveries', mode)}
            onTest={() => testCategory('deliveries')}
            testing={testingKey === 'deliveries'}
          />
          <Divider />
          <CategorySoundRow
            profile="VISIT"
            title="Visitas"
            description="Quando a visita cadastrada chegar e tiver acesso validado."
            value={prefs.visits}
            onChange={(mode) => updateMode('visits', mode)}
            onTest={() => testCategory('visits')}
            testing={testingKey === 'visits'}
          />
          <Divider />
          <CategorySoundRow
            profile="MESSAGE"
            title="Mensagens"
            description="Comunicados e mensagens operacionais."
            value={prefs.messages}
            onChange={(mode) => updateMode('messages', mode)}
            onTest={() => testCategory('messages')}
            testing={testingKey === 'messages'}
          />
          <Divider />
          <CategorySoundRow
            profile="CAMERA"
            title="Cameras"
            description="Eventos relacionados a camera, evidencia ou snapshot."
            value={prefs.cameras}
            onChange={(mode) => updateMode('cameras', mode)}
            onTest={() => testCategory('cameras')}
            testing={testingKey === 'cameras'}
          />
        </View>

        <View style={styles.card}>
          <SectionTitle
            title="Outras preferencias locais"
            description="Configuracoes auxiliares que ainda nao dependem de sincronizacao com o backend."
          />
          <ToggleRow
            title="Resumo semanal"
            description="Ativa um resumo simples com a movimentacao recente da unidade."
            value={prefs.reports}
            onChange={toggleReports}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function CategorySoundRow({
  profile,
  title,
  description,
  value,
  onChange,
  onTest,
  testing,
}: {
  profile: NotificationSoundProfile;
  title: string;
  description: string;
  value: NotificationCategorySoundMode;
  onChange: (mode: NotificationCategorySoundMode) => void;
  onTest: () => void;
  testing: boolean;
}) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
        <Text style={styles.modeSummary}>Modo atual: {formatModeLabel(value)}</Text>
        <Text style={styles.soundHint}>{getNotificationSoundDefinition(profile).thematicDescription}</Text>
      </View>

      <View style={styles.optionRow}>
        {SOUND_MODE_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionChip, selected && styles.optionChipSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
              <Text style={[styles.optionDescription, selected && styles.optionDescriptionSelected]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.testButton} onPress={onTest} disabled={testing}>
        <Ionicons name="volume-high-outline" size={16} color={colors.primary} />
        <Text style={styles.testButtonText}>{testing ? 'Testando...' : 'Testar esta categoria'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatModeLabel(value: NotificationCategorySoundMode) {
  if (value === 'CUSTOM') return 'Personalizado';
  if (value === 'SILENT') return 'Silencioso';
  return 'Padrao';
}

function formatChannelLabel(value: ResidentNotificationChannel) {
  if (value === 'APP') return 'App';
  if (value === 'EMAIL') return 'E-mail';
  return 'Push';
}

function formatPriorityLabel(value: ResidentNotificationPriority) {
  if (value === 'LOW') return 'Baixa';
  if (value === 'MEDIUM') return 'Media';
  return 'Alta';
}

function formatScopeLabel(value?: string | null) {
  if (!value) return 'Conta';
  if (value === 'ACCOUNT') return 'Conta';
  return value;
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onChange} activeOpacity={0.85}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <View style={[styles.booleanPill, value && styles.booleanPillActive]}>
        <Text style={[styles.booleanPillText, value && styles.booleanPillTextActive]}>{value ? 'Ativo' : 'Inativo'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 20, paddingBottom: 100, gap: 16 },
  notice: {
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 14,
  },
  noticeTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 6 },
  noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  tipCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  tipText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  sectionDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4, textAlign: 'justify' },
  categoryRow: { padding: 16, gap: 12 },
  info: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 3, lineHeight: 18, textAlign: 'justify' },
  modeSummary: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 8 },
  soundHint: { color: colors.textSubtle, fontSize: 12, lineHeight: 17, marginTop: 6, textAlign: 'justify' },
  optionRow: { gap: 8 },
  optionChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    padding: 12,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionLabel: { color: colors.text, fontSize: 13, fontWeight: '900' },
  optionLabelSelected: { color: colors.primary },
  optionDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4, textAlign: 'justify' },
  optionDescriptionSelected: { color: colors.text },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  testButtonText: { color: colors.primary, fontSize: 13, fontWeight: '900', textAlign: 'center' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  booleanPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  booleanPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  booleanPillText: { color: colors.textMuted, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  booleanPillTextActive: { color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
});
