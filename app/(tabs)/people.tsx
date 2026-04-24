import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatureLockedState from '../../components/FeatureLockedState';
import PersonCard from '../../components/PersonCard';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { getPersons } from '../../services/persons';
import { useAuthStore } from '../../store/useAuthStore';
import type { Person } from '../../types/person';

const CATEGORIES = [
  { id: 'ALL', label: 'Tudo' },
  { id: 'RESIDENT', label: 'Moradores' },
  { id: 'VISITOR', label: 'Visitantes' },
  { id: 'SERVICE_PROVIDER', label: 'Prestadores' },
  { id: 'DELIVERER', label: 'Entregadores' },
  { id: 'RENTER', label: 'Locatarios' },
];

export default function PeopleScreen() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const residentAccessAllowed = isResidentFeatureEnabled(residentAppConfig, 'access');
  const vehiclesEnabled = isResidentFeatureEnabled(residentAppConfig, 'vehicles');

  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeople = useCallback(async () => {
    if (!residentAccessAllowed) {
      setPeople([]);
      setError('Sua conta nao pode consultar os cadastros desta unidade.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPersons(selectedCategory);
      setPeople(data);
    } catch (err: any) {
      if (!err?.response) {
        setError('Nao foi possivel carregar os cadastros agora. Tente novamente em instantes.');
      } else if (err.response.status === 403) {
        setError('Sua conta nao pode consultar os cadastros desta unidade.');
      } else {
        setError('Nao foi possivel carregar os cadastros agora.');
      }
    } finally {
      setLoading(false);
    }
  }, [residentAccessAllowed, selectedCategory]);

  useAutoRefresh(loadPeople);

  const filteredPeople = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return people;

    return people.filter((person) => {
      const name = String(person.name || '').toLowerCase();
      const category = String(person.categoryLabel || '').toLowerCase();
      return name.includes(normalized) || category.includes(normalized);
    });
  }, [people, search]);

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Pessoas</Text>
      <Text style={styles.subtitle}>Veja quem esta vinculado a unidade e autorize novos acessos quando precisar.</Text>

      {!residentAccessAllowed ? (
        <View style={styles.noticeBox}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.warning} />
          <Text style={styles.noticeText}>O controle de acesso desta unidade nao esta disponivel para esta conta.</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.createCard} activeOpacity={0.86} onPress={() => router.push('/people/access-form')}>
        <View style={styles.createCardIcon}>
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.createCardTextArea}>
          <Text style={styles.createCardTitle}>Autorizar acesso</Text>
          <Text style={styles.createCardText}>Escolha o tipo de cadastro primeiro e depois conclua o preenchimento.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
      </TouchableOpacity>

      <View style={styles.shortcutRow}>
        {vehiclesEnabled ? (
          <TouchableOpacity style={styles.shortcutButton} activeOpacity={0.85} onPress={() => router.push('/people/vehicles')}>
            <Ionicons name="car-outline" size={18} color={colors.primary} />
            <Text style={styles.shortcutText}>Veiculos</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.shortcutButton} activeOpacity={0.85} onPress={() => router.push('/people/visits')}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.shortcutText}>Previstos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shortcutButton} activeOpacity={0.85} onPress={() => router.push('/people/access-history')}>
          <Ionicons name="walk-outline" size={18} color={colors.primary} />
          <Text style={styles.shortcutText}>Historico</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Lista da unidade</Text>
        <Text style={styles.filterLabel}>Filtrar pessoas</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou tipo"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, selectedCategory === item.id && styles.filterTabActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text style={[styles.filterText, selectedCategory === item.id && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>
    </View>
  );

  if (!residentAccessAllowed) {
    return (
      <View style={styles.container}>
        <FeatureLockedState
          icon="lock-closed-outline"
          title="Pessoas indisponiveis"
          description="O controle de acesso desta unidade nao foi habilitado para esta conta ou para este condominio."
          actionLabel="Voltar para o inicio"
          onAction={() => router.replace('/')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && people.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando pessoas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PersonCard person={item} onPress={() => router.push(`/people/view-person?personId=${item.id}`)} />
          )}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPeople} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{error || 'Nenhuma pessoa encontrada.'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 18, paddingTop: 56, paddingBottom: 12 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14 },
  noticeBox: {
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
  createCard: {
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
  createCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCardTextArea: { flex: 1 },
  createCardTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 2 },
  createCardText: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  shortcutRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  shortcutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  shortcutText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 2,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  filterLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginTop: 8, marginBottom: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, marginLeft: 8 },
  filterList: { paddingTop: 12, paddingBottom: 2 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  list: { paddingBottom: 100 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  emptyBox: { paddingHorizontal: 18, paddingVertical: 24 },
  emptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
