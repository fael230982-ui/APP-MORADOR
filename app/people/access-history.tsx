import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { listAccessLogs, type AccessLog } from '../../services/accessLogs';

const FILTERS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ENTRY', label: 'Entradas' },
  { id: 'EXIT', label: 'Saidas' },
  { id: 'DENIED', label: 'Negados' },
] as const;

function formatDateTime(value?: string | null) {
  if (!value) return 'Nao informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function directionLabel(value: string) {
  if (value === 'EXIT') return 'Saida';
  return 'Entrada';
}

export default function AccessHistoryScreen() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAccessLogs(50);
      setLogs(data);
    } catch (err: any) {
      setError(
        err?.response?.status === 403
          ? 'O historico de acessos ainda nao esta disponivel para sua conta.'
          : 'Nao foi possivel carregar o historico de acessos agora.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(loadLogs);

  const counts = useMemo(
    () => ({
      entries: logs.filter((item) => item.direction === 'ENTRY' && item.result !== 'DENIED').length,
      exits: logs.filter((item) => item.direction === 'EXIT' && item.result !== 'DENIED').length,
      denied: logs.filter((item) => item.result === 'DENIED').length,
    }),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    if (filter === 'DENIED') return logs.filter((item) => item.result === 'DENIED');
    if (filter === 'ENTRY') return logs.filter((item) => item.direction === 'ENTRY' && item.result !== 'DENIED');
    if (filter === 'EXIT') return logs.filter((item) => item.direction === 'EXIT' && item.result !== 'DENIED');
    return logs;
  }, [filter, logs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Ultimos acessos',
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
        <Text style={styles.subtitle}>Entradas e saidas registradas para a sua unidade.</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{counts.entries}</Text>
            <Text style={styles.summaryLabel}>entradas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{counts.exits}</Text>
            <Text style={styles.summaryLabel}>saidas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, counts.denied > 0 && styles.deniedValue]}>{counts.denied}</Text>
            <Text style={styles.summaryLabel}>negados</Text>
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
      </View>

      {loading && logs.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando historico...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLogs} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="walk-outline"
              title="Nenhum acesso registrado"
              description={error || 'Entradas e saidas validadas na portaria aparecerao aqui.'}
            />
          }
          renderItem={({ item }) => {
            const denied = item.result === 'DENIED';
            return (
              <View style={styles.card}>
                <View style={[styles.iconBox, denied && styles.iconBoxDenied]}>
                  <Ionicons
                    name={denied ? 'close-circle-outline' : item.direction === 'EXIT' ? 'exit-outline' : 'enter-outline'}
                    size={22}
                    color={denied ? colors.danger : colors.primary}
                  />
                </View>
                <View style={styles.cardTextArea}>
                  <Text style={styles.cardTitle}>{item.personName || item.classificationLabel || 'Acesso registrado'}</Text>
                  <Text style={styles.cardSubtitle}>
                    {denied ? 'Acesso negado' : directionLabel(item.direction)}
                    {item.location ? ` • ${item.location}` : ''}
                  </Text>
                  <Text style={styles.cardMeta}>{formatDateTime(item.timestamp)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  header: { padding: 18, paddingBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: '700', marginBottom: 12 },
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
  deniedValue: { color: colors.danger },
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDenied: { backgroundColor: colors.dangerSoft },
  cardTextArea: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  cardSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  cardMeta: { color: colors.textSubtle, fontSize: 12, marginTop: 6, fontWeight: '700' },
});
