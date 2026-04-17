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
  { id: 'RENTER', label: 'Locatários' },
];

const CREATE_ACTIONS = [
  { label: 'Morador', icon: 'home-outline', type: 'RESIDENT' },
  { label: 'Visitante', icon: 'person-add-outline', type: 'VISITOR' },
  { label: 'Prestador', icon: 'construct-outline', type: 'SERVICE_PROVIDER' },
  { label: 'Locatário', icon: 'key-outline', type: 'RENTER' },
] as const;

export default function PeopleScreen() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const residentAccessAllowed = isResidentFeatureEnabled(residentAppConfig, 'access');
  const vehiclesEnabled = isResidentFeatureEnabled(residentAppConfig, 'vehicles');

  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeople = useCallback(async () => {
    if (!residentAccessAllowed) {
      setPeople([]);
      setError('Sua conta não pode consultar os cadastros desta unidade.');
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
        setError('Não foi possível carregar os cadastros agora. Tente novamente em instantes.');
      } else if (err.response.status === 403) {
        setError('Sua conta não pode consultar os cadastros desta unidade.');
      } else {
        setError('Não foi possível carregar os cadastros agora.');
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
      <Text style={styles.title}>Acessos</Text>
      <Text style={styles.subtitle}>Cadastre pessoas da unidade e acompanhe as permissões mais importantes.</Text>

      {!residentAccessAllowed ? (
        <View style={styles.noticeBox}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.warning} />
          <Text style={styles.noticeText}>O controle de acesso desta unidade não está disponível para esta conta.</Text>
        </View>
      ) : null}

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

      {residentAccessAllowed ? (
        <>
          <TouchableOpacity
            style={styles.createHeader}
            activeOpacity={0.86}
            onPress={() => setShowCreateOptions((current) => !current)}
          >
            <View style={styles.createHeaderIcon}>
              <Ionicons name="person-add-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.createHeaderText}>
              <Text style={styles.createTitle}>Quer cadastrar alguém?</Text>
              <Text style={styles.createSubtitle}>Morador, visitante, prestador ou locatário.</Text>
            </View>
            <Ionicons name={showCreateOptions ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSubtle} />
          </TouchableOpacity>

          {showCreateOptions ? (
            <View style={styles.createGrid}>
              {CREATE_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.type}
                  style={styles.createButton}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/people/access-form?type=${action.type}`)}
                >
                  <Ionicons name={action.icon} size={18} color={colors.primary} />
                  <Text style={styles.createButtonText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <View style={styles.shortcutRow}>
        {vehiclesEnabled ? (
          <TouchableOpacity style={styles.shortcutButton} activeOpacity={0.85} onPress={() => router.push('/people/vehicles')}>
            <Ionicons name="car-outline" size={18} color={colors.primary} />
            <Text style={styles.shortcutText}>Veículos</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.shortcutButton} activeOpacity={0.85} onPress={() => router.push('/people/visits')}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.shortcutText}>Previstos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutButton}
          activeOpacity={0.85}
          onPress={() => router.push('/people/access-history')}
        >
          <Ionicons name="walk-outline" size={18} color={colors.primary} />
          <Text style={styles.shortcutText}>Últimos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Pessoas autorizadas</Text>

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
  );

  if (!residentAccessAllowed) {
    return (
      <View style={styles.container}>
        <FeatureLockedState
          icon="lock-closed-outline"
          title="Acessos indisponiveis"
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
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14, textAlign: 'justify' },
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, marginLeft: 8 },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 14,
  },
  createHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createHeaderText: { flex: 1 },
  createTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 2 },
  createSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'justify' },
  createGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  createButton: {
    width: '47.5%',
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: { color: colors.text, fontSize: 12, fontWeight: '800', flex: 1, textAlign: 'center' },
  shortcutRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
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
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 16 },
  filterList: { paddingTop: 12, paddingBottom: 6 },
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
