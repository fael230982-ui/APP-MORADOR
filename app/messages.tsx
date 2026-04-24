import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import FeatureLockedState from '../components/FeatureLockedState';
import UnitSelectionModal from '../components/UnitSelectionModal';
import { colors } from '../constants/colors';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import {
  isUnreadIncomingOperationMessage,
  operationMessagesService,
  type OperationMessage,
} from '../services/operationMessages';
import { isResidentFeatureEnabled } from '../services/residentFeatureAccess';
import { useAuthStore } from '../store/useAuthStore';

function formatTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getOriginBadge(origin?: string | null) {
  if (origin === 'WHATSAPP') {
    return {
      label: 'WhatsApp',
      icon: 'logo-whatsapp' as const,
      color: colors.success,
      backgroundColor: colors.successSoft,
    };
  }

  if (origin === 'APP') {
    return {
      label: 'App',
      icon: 'phone-portrait-outline' as const,
      color: colors.info,
      backgroundColor: colors.cardSoft,
    };
  }

  return {
    label: 'Portaria',
    icon: 'business-outline' as const,
    color: colors.textMuted,
    backgroundColor: colors.cardSoft,
  };
}

export default function MessagesScreen() {
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [messages, setMessages] = useState<OperationMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const messagesEnabled = isResidentFeatureEnabled(residentAppConfig, 'messages');

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  const loadMessages = useCallback(async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
    if (!selectedUnitId) {
      setLoading(false);
      return;
    }

    try {
      if (mode !== 'silent') {
        setLoading(true);
      }
      setError(null);
      const result = await operationMessagesService.list(selectedUnitId, { limit: 50 });
      setMessages(result);

      const unreadIncomingIds = result.filter(isUnreadIncomingOperationMessage).map((item) => item.id);
      if (unreadIncomingIds.length > 0) {
        await Promise.all(unreadIncomingIds.map((id) => operationMessagesService.markRead(id).catch(() => null)));
        setMessages((current) =>
          current.map((item) =>
            unreadIncomingIds.includes(item.id) ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item
          )
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.status === 403
          ? 'As mensagens ainda nao estao disponiveis para sua conta.'
          : 'Nao foi possivel carregar as mensagens agora.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId]);

  useAutoRefresh(() => loadMessages(messages.length > 0 ? 'silent' : 'initial'), {
    enabled: !!selectedUnitId,
    intervalMs: 15000,
    topics: ['messages', 'unit', 'realtime'],
  });

  async function handleSend() {
    const body = draft.trim();
    if (!selectedUnitId || !body) return;

    try {
      setSending(true);
      const message = await operationMessagesService.send(selectedUnitId, body);
      setMessages((current) => [...current, message]);
      setDraft('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Nao foi possivel enviar a mensagem agora.');
    } finally {
      setSending(false);
    }
  }

  if (!messagesEnabled) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Mensagens da portaria',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <FeatureLockedState
          icon="chatbubbles-outline"
          title="Mensagens indisponiveis"
          description="Este condominio nao habilitou as conversas operacionais entre morador e portaria neste app."
          actionLabel="Voltar para o inicio"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  if (!selectedUnitId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Mensagens da portaria',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <EmptyState
          icon="business-outline"
          title="Escolha uma unidade"
          description="Selecione uma unidade ativa para conversar com a portaria."
        />
        <View style={styles.emptyActionArea}>
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
          headerTitle: 'Mensagens da portaria',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.unitHeader}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
          <Text style={styles.unitHeaderText}>{selectedUnitName || 'Unidade ativa'}</Text>
        </View>

        {error && messages.length > 0 ? (
          <View style={styles.inlineNotice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.inlineNoticeText}>{error}</Text>
          </View>
        ) : null}

        {loading && messages.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Carregando mensagens...</Text>
          </View>
        ) : (
          <FlatList
            data={sortedMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={sortedMessages.length ? styles.list : styles.emptyList}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadMessages('refresh')} tintColor={colors.primary} />}
            ListEmptyComponent={
              <EmptyState
                icon="chatbubbles-outline"
                title="Nenhuma mensagem"
                description={error || 'As conversas entre a portaria e a sua unidade aparecerao aqui.'}
              />
            }
            renderItem={({ item }) => {
              const mine = item.direction === 'RESIDENT_TO_PORTARIA';
              const originBadge = getOriginBadge(item.origin);
              const senderLabel = mine
                ? 'Voce'
                : item.origin === 'WHATSAPP'
                  ? `Portaria via ${originBadge.label}`
                  : item.senderUserName || 'Portaria';
              const statusLabel = mine
                ? item.status === 'UNREAD'
                  ? 'Aguardando leitura'
                  : item.status === 'READ'
                    ? 'Lida pela portaria'
                    : null
                : !item.readAt
                  ? 'Nova'
                  : 'Recebida';

              return (
                <View style={[styles.messageBubble, mine ? styles.myMessage : styles.portariaMessage]}>
                  <View style={styles.messageMetaRow}>
                    <Text style={[styles.messageSender, mine && styles.myMessageSender]}>{senderLabel}</Text>
                    <View
                      style={[
                        styles.originBadge,
                        { backgroundColor: mine ? 'rgba(255,255,255,0.18)' : originBadge.backgroundColor },
                      ]}
                    >
                      <Ionicons name={originBadge.icon} size={11} color={mine ? colors.white : originBadge.color} />
                      <Text style={[styles.originBadgeText, mine ? styles.myOriginBadgeText : { color: originBadge.color }]}>
                        {originBadge.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.messageBody, mine && styles.myMessageBody]}>{item.body}</Text>
                  <View style={styles.messageFooter}>
                    <Text style={[styles.messageTime, mine && styles.myMessageTime]}>{formatTime(item.createdAt)}</Text>
                    {statusLabel ? (
                      <Text style={[styles.messageStatus, mine && styles.myMessageTime]}>{statusLabel}</Text>
                    ) : null}
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escreva sua mensagem para a portaria"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!draft.trim() || sending) && styles.sendButtonDisabled]}
            disabled={!draft.trim() || sending}
            onPress={handleSend}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardArea: { flex: 1 },
  backButton: { marginLeft: 10 },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unitHeaderText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  inlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  inlineNoticeText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  list: { padding: 18, paddingBottom: 18 },
  emptyList: { flexGrow: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  messageBubble: { maxWidth: '86%', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1 },
  portariaMessage: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border },
  myMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderColor: colors.primary },
  messageMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
  messageSender: { color: colors.textMuted, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  myMessageSender: { color: 'rgba(255,255,255,0.76)' },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  originBadgeText: { fontSize: 10, fontWeight: '900' },
  myOriginBadgeText: { color: colors.white },
  messageBody: { color: colors.text, fontSize: 14, lineHeight: 19 },
  myMessageBody: { color: colors.white },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 7 },
  messageTime: { color: colors.textSubtle, fontSize: 11, marginTop: 7, fontWeight: '700' },
  messageStatus: { color: colors.textSubtle, fontSize: 11, fontWeight: '700' },
  myMessageTime: { color: 'rgba(255,255,255,0.72)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  emptyActionArea: { paddingHorizontal: 18, paddingBottom: 40 },
  selectUnitButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectUnitButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
