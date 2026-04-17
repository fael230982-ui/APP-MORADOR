import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { appDiagnostics, type AppDiagnosticRecord } from '../../services/appDiagnostics';
import { hapticFeedback } from '../../services/haptics';

function formatRecord(record: AppDiagnosticRecord) {
  return [
    `[${record.type.toUpperCase()}] ${record.source}`,
    `Data: ${new Date(record.createdAt).toLocaleString('pt-BR')}`,
    `Mensagem: ${record.message}`,
    record.status ? `Status HTTP: ${record.status}` : null,
    record.details ? `Detalhes: ${record.details}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildExport(records: AppDiagnosticRecord[]) {
  if (records.length === 0) {
    return 'Nenhum diagnostico local registrado.';
  }

  return records.map(formatRecord).join('\n\n---\n\n');
}

export default function DiagnosticsScreen() {
  const [records, setRecords] = React.useState<AppDiagnosticRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const loadRecords = React.useCallback(async () => {
    const next = await appDiagnostics.list();
    setRecords(next);
  }, []);

  React.useEffect(() => {
    loadRecords()
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [loadRecords]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadRecords();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCopy() {
    try {
      setCopying(true);
      await Clipboard.setStringAsync(buildExport(records));
      hapticFeedback.success();
      Alert.alert('Diagnosticos copiados', 'Os registros locais foram copiados para compartilhamento.');
    } catch {
      hapticFeedback.error();
      Alert.alert('Erro', 'Nao foi possivel copiar os diagnosticos agora.');
    } finally {
      setCopying(false);
    }
  }

  function handleClear() {
    Alert.alert('Limpar diagnosticos', 'Isso remove os registros locais deste aparelho.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          try {
            setClearing(true);
            await appDiagnostics.clear();
            await loadRecords();
            hapticFeedback.success();
          } catch {
            hapticFeedback.error();
            Alert.alert('Erro', 'Nao foi possivel limpar os diagnosticos agora.');
          } finally {
            setClearing(false);
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
          headerTitle: 'Diagnosticos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.hero}>
          <Ionicons name="pulse-outline" size={28} color={colors.primary} />
          <Text style={styles.heroTitle}>Diagnostico local do app</Text>
          <Text style={styles.heroText}>
            Esta tela concentra erros e avisos recentes de integracao para acelerar a homologacao e o suporte.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, (copying || loading) && styles.actionButtonDisabled]}
            activeOpacity={0.85}
            disabled={copying || loading}
            onPress={handleCopy}
          >
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>{copying ? 'Copiando...' : 'Copiar diagnosticos'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, (clearing || loading) && styles.actionButtonDisabled]}
            activeOpacity={0.85}
            disabled={clearing || loading}
            onPress={handleClear}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>
              {clearing ? 'Limpando...' : 'Limpar historico'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Registros locais</Text>
          <Text style={styles.summaryValue}>{records.length}</Text>
          <Text style={styles.summaryHint}>Mantemos ate 40 ocorrencias recentes neste aparelho.</Text>
        </View>

        {!loading && records.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.emptyTitle}>Nenhum diagnostico registrado</Text>
            <Text style={styles.emptyText}>Quando o app detectar erro ou aviso de integracao, ele aparecera aqui.</Text>
          </View>
        ) : null}

        {records.map((record) => (
          <View key={record.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.typeBadge, getTypeBadgeStyle(record.type)]}>
                <Text style={styles.typeBadgeText}>{getTypeLabel(record.type)}</Text>
              </View>
              <Text style={styles.cardDate}>{new Date(record.createdAt).toLocaleString('pt-BR')}</Text>
            </View>
            <Text style={styles.cardSource}>{record.source}</Text>
            <Text style={styles.cardMessage}>{record.message}</Text>
            {record.status ? <Text style={styles.cardMeta}>Status HTTP: {record.status}</Text> : null}
            {record.details ? <Text style={styles.cardDetails}>{record.details}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTypeLabel(type: AppDiagnosticRecord['type']) {
  if (type === 'error') return 'Erro';
  if (type === 'warning') return 'Aviso';
  return 'Info';
}

function getTypeBadgeStyle(type: AppDiagnosticRecord['type']) {
  if (type === 'error') {
    return { backgroundColor: colors.dangerSoft, borderColor: '#FDA29B' };
  }

  if (type === 'warning') {
    return { backgroundColor: colors.warningSoft, borderColor: colors.warning };
  }

  return { backgroundColor: colors.primarySoft, borderColor: colors.primary };
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 20, paddingBottom: 100 },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 12 },
  heroText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8 },
  actions: { gap: 12, marginBottom: 16 },
  actionButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  summaryValue: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 8 },
  summaryHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  typeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  cardDate: { color: colors.textMuted, fontSize: 11, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  cardSource: { color: colors.text, fontSize: 14, fontWeight: '900', marginBottom: 8 },
  cardMessage: { color: colors.text, fontSize: 13, lineHeight: 19 },
  cardMeta: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 10 },
  cardDetails: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
