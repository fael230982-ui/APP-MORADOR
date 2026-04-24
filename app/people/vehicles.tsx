import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { vehiclesService } from '../../services/vehicles';
import { useAuthStore } from '../../store/useAuthStore';
import type { Vehicle, VehicleType } from '../../types/vehicle';

const VEHICLE_TYPES: { id: VehicleType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'carro', label: 'Carro', icon: 'car-outline' },
  { id: 'moto', label: 'Moto', icon: 'bicycle-outline' },
  { id: 'caminhao', label: 'Caminhao', icon: 'bus-outline' },
  { id: 'outro', label: 'Outro', icon: 'ellipsis-horizontal-circle-outline' },
];

const STATUS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativo', label: 'Ativos' },
  { id: 'bloqueado', label: 'Bloqueados' },
] as const;

function typeLabel(value: VehicleType) {
  return VEHICLE_TYPES.find((item) => item.id === value)?.label || 'Veiculo';
}

function statusLabel(value: string) {
  if (value === 'bloqueado') return 'Bloqueado';
  if (value === 'inativo') return 'Inativo';
  return 'Ativo';
}

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

function isValidPlate(value: string) {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(value);
}

export default function VehiclesScreen() {
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [tag, setTag] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<VehicleType>('carro');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingVehicleId, setUpdatingVehicleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manageBlocked, setManageBlocked] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['id']>('todos');

  const activeVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.status === 'ativo').length, [vehicles]);
  const blockedVehicles = useMemo(() => vehicles.filter((vehicle) => vehicle.status === 'bloqueado').length, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesStatus = statusFilter === 'todos' ? true : vehicle.status === statusFilter;
      const haystack = [vehicle.plate, vehicle.brand, vehicle.model, vehicle.color, vehicle.ownerName, vehicle.tag]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = normalizedSearch ? haystack.includes(normalizedSearch) : true;

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, vehicles]);

  const normalizedPlate = normalizePlate(plate);
  const plateHasTypedValue = normalizedPlate.length > 0;
  const plateIsValid = isValidPlate(normalizedPlate);
  const shouldShowPlateError = plateHasTypedValue && !plateIsValid;
  const canCreate = !!selectedUnitId && !saving && !manageBlocked && plateIsValid;

  const resetForm = () => {
    setPlate('');
    setBrand('');
    setModel('');
    setColor('');
    setTag('');
    setNotes('');
    setType('carro');
  };

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setManageBlocked(false);
      const data = await vehiclesService.listUnitVehicles();
      setVehicles(data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Sua conta ainda nao pode consultar veiculos desta unidade.');
        setManageBlocked(true);
      } else if (err?.response?.status === 404) {
        setError('A consulta de veiculos ainda nao esta disponivel.');
      } else {
        setError('Nao foi possivel carregar os veiculos agora.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useAutoRefresh(loadVehicles, { enabled: !!selectedUnitId, intervalMs: 30000, topics: ['vehicles', 'unit', 'realtime'] });

  async function handleCreate() {
    if (!selectedUnitId) {
      Alert.alert('Unidade obrigatoria', 'Selecione uma unidade antes de cadastrar veiculos.');
      return;
    }

    if (!plateIsValid) {
      Alert.alert('Placa obrigatoria', 'Informe a placa completa do veiculo.');
      return;
    }

    try {
      setSaving(true);
      const created = await vehiclesService.createVehicle({
        plate: normalizedPlate,
        brand: brand.trim() || null,
        model: model.trim() || null,
        color: color.trim() || null,
        type,
        unitId: selectedUnitId,
        tag: tag.trim() || null,
        notes: notes.trim() || null,
      });
      setVehicles((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      resetForm();
      setShowForm(false);
      Alert.alert('Veiculo cadastrado', 'O veiculo foi vinculado a sua unidade.');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setManageBlocked(true);
        Alert.alert('Cadastro ainda nao liberado', 'Sua conta ainda nao pode cadastrar veiculos da unidade.');
      } else {
        const message = err?.response?.data?.message || 'Nao foi possivel cadastrar o veiculo agora.';
        Alert.alert('Cadastro nao concluido', String(message));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(vehicle: Vehicle) {
    const nextStatus = vehicle.status === 'bloqueado' ? 'ativo' : 'bloqueado';
    const actionLabel = nextStatus === 'bloqueado' ? 'bloquear' : 'reativar';

    Alert.alert(
      nextStatus === 'bloqueado' ? 'Bloquear veiculo' : 'Reativar veiculo',
      `Deseja ${actionLabel} o veiculo ${vehicle.plate}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: nextStatus === 'bloqueado' ? 'Bloquear' : 'Reativar',
          style: nextStatus === 'bloqueado' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setUpdatingVehicleId(vehicle.id);
              const updated = await vehiclesService.updateVehicle(vehicle.id, {
                plate: vehicle.plate,
                brand: vehicle.brand,
                model: vehicle.model,
                color: vehicle.color,
                type: vehicle.type,
                ownerId: vehicle.ownerId,
                unitId: vehicle.unitId,
                tag: vehicle.tag,
                notes: vehicle.notes,
                status: nextStatus,
              });
              setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            } catch (err: any) {
              if (err?.response?.status === 403) {
                setManageBlocked(true);
                Alert.alert('Acao ainda nao liberada', 'Sua conta ainda nao pode alterar veiculos da unidade.');
              } else {
                Alert.alert('Nao foi possivel atualizar', err?.response?.data?.message || 'Tente novamente em instantes.');
              }
            } finally {
              setUpdatingVehicleId(null);
            }
          },
        },
      ]
    );
  }

  function handleDelete(vehicle: Vehicle) {
    Alert.alert('Remover veiculo', `Deseja remover ${vehicle.plate} da unidade?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            setUpdatingVehicleId(vehicle.id);
            await vehiclesService.deleteVehicle(vehicle.id);
            setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
          } catch (err: any) {
            if (err?.response?.status === 403) {
              setManageBlocked(true);
              Alert.alert('Acao ainda nao liberada', 'Sua conta ainda nao pode remover veiculos da unidade.');
            } else {
              Alert.alert('Nao foi possivel remover', err?.response?.data?.message || 'Tente novamente em instantes.');
            }
          } finally {
            setUpdatingVehicleId(null);
          }
        },
      },
    ]);
  }

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleMainRow}>
        <View style={styles.vehicleIcon}>
          <Ionicons
            name={VEHICLE_TYPES.find((vehicleType) => vehicleType.id === item.type)?.icon || 'car-outline'}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.vehicleTextArea}>
          <Text style={styles.vehiclePlate}>{item.plate}</Text>
          <Text style={styles.vehicleMeta}>
            {[typeLabel(item.type), item.brand, item.model, item.color].filter(Boolean).join(' • ')}
          </Text>
          {item.ownerName ? <Text style={styles.vehicleOwner}>{item.ownerName}</Text> : null}
          {item.tag ? <Text style={styles.vehicleTag}>Tag ou controle: {item.tag}</Text> : null}
        </View>
        <Text
          style={[
            styles.statusPill,
            item.status === 'bloqueado' && styles.statusBlocked,
            item.status === 'inativo' && styles.statusInactive,
          ]}
        >
          {statusLabel(item.status)}
        </Text>
      </View>

      <View style={styles.vehicleActions}>
        <TouchableOpacity
          style={styles.vehicleActionButton}
          disabled={updatingVehicleId === item.id}
          onPress={() => handleToggleStatus(item)}
        >
          <Ionicons
            name={item.status === 'bloqueado' ? 'checkmark-circle-outline' : 'ban-outline'}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.vehicleActionText}>{item.status === 'bloqueado' ? 'Reativar' : 'Bloquear'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.vehicleActionButton, styles.vehicleDangerAction]}
          disabled={updatingVehicleId === item.id}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.vehicleDangerActionText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!selectedUnitId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Veiculos',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />

        <View style={styles.emptyScreen}>
          <EmptyState
            icon="car-outline"
            title="Escolha uma unidade"
            description="Selecione a unidade que deseja gerenciar para ver ou cadastrar veiculos autorizados."
          />
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
          headerTitle: 'Veiculos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVehicles} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.subtitle}>{selectedUnitName || 'Unidade ativa'}</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{vehicles.length}</Text>
                <Text style={styles.summaryLabel}>cadastrados</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{activeVehicles}</Text>
                <Text style={styles.summaryLabel}>ativos</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, blockedVehicles > 0 && styles.summaryDanger]}>{blockedVehicles}</Text>
                <Text style={styles.summaryLabel}>bloqueados</Text>
              </View>
            </View>

            {error ? (
              <View style={styles.noticeCard}>
                <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
                <Text style={styles.noticeText}>{error}</Text>
              </View>
            ) : null}

            {manageBlocked ? (
              <View style={styles.noticeCard}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.warning} />
                <Text style={styles.noticeText}>
                  Sua conta ainda depende de liberacao do backend para cadastrar, editar ou remover veiculos da unidade.
                </Text>
              </View>
            ) : null}

            <View style={styles.searchCard}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por placa, marca, modelo ou tag"
                placeholderTextColor={colors.textSubtle}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filters}>
              {STATUS_FILTERS.map((item) => {
                const active = statusFilter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.filterButton, active && styles.filterButtonActive]}
                    onPress={() => setStatusFilter(item.id)}
                  >
                    <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.primaryRowAction} activeOpacity={0.86} onPress={() => setShowForm((current) => !current)}>
              <Ionicons name={showForm ? 'remove-circle-outline' : 'add-circle-outline'} size={18} color={colors.white} />
              <Text style={styles.primaryRowActionText}>{showForm ? 'Fechar cadastro' : 'Cadastrar veiculo'}</Text>
            </TouchableOpacity>

            {showForm ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Novo veiculo</Text>

                <Text style={styles.inputLabel}>Placa</Text>
                <TextInput
                  value={plate}
                  onChangeText={(value) => setPlate(normalizePlate(value))}
                  placeholder="ABC1D23"
                  placeholderTextColor={colors.textSubtle}
                  style={[styles.input, shouldShowPlateError ? styles.inputError : undefined]}
                  autoCapitalize="characters"
                  maxLength={7}
                />
                {shouldShowPlateError ? <Text style={styles.errorText}>Digite uma placa valida, como ABC1234 ou ABC1D23.</Text> : null}

                <Text style={styles.inputLabel}>Tipo</Text>
                <View style={styles.typeGrid}>
                  {VEHICLE_TYPES.map((item) => {
                    const active = item.id === type;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.typeButton, active && styles.typeButtonActive]}
                        onPress={() => setType(item.id)}
                      >
                        <Ionicons name={item.icon} size={18} color={active ? colors.white : colors.primary} />
                        <Text style={[styles.typeButtonText, active && styles.typeButtonTextActive]}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>Marca</Text>
                <TextInput
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Ex.: Toyota"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Modelo</Text>
                <TextInput
                  value={model}
                  onChangeText={setModel}
                  placeholder="Ex.: Corolla"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Cor</Text>
                <TextInput
                  value={color}
                  onChangeText={setColor}
                  placeholder="Ex.: Prata"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Tag ou controle</Text>
                <TextInput
                  value={tag}
                  onChangeText={setTag}
                  placeholder="Opcional"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Observacoes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Opcional"
                  placeholderTextColor={colors.textSubtle}
                  style={[styles.input, styles.textArea]}
                  multiline
                />

                <PrimaryButton title="Salvar veiculo" loading={saving} disabled={!canCreate} onPress={handleCreate} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Carregando veiculos...</Text>
            </View>
          ) : (
            <EmptyState
              icon="car-outline"
              title="Nenhum veiculo nesta lista"
              description="Os veiculos autorizados para esta unidade vao aparecer aqui."
            />
          )
        }
      />
      <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  list: { padding: 18, paddingBottom: 100 },
  subtitle: { color: colors.textMuted, fontSize: 13, fontWeight: '800', marginBottom: 12 },
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
  summaryDanger: { color: colors.danger },
  summaryLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  noticeCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: colors.text, minHeight: 48, fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterButtonText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  filterButtonTextActive: { color: colors.white },
  primaryRowAction: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  primaryRowActionText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  inputLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 6, marginTop: 8 },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 6, marginBottom: 2, fontWeight: '700' },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeButton: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  typeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  typeButtonTextActive: { color: colors.white },
  vehicleCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  vehicleMainRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTextArea: { flex: 1 },
  vehiclePlate: { color: colors.text, fontSize: 18, fontWeight: '900' },
  vehicleMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  vehicleOwner: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 4 },
  vehicleTag: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  statusPill: {
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  statusBlocked: { backgroundColor: colors.dangerSoft, color: colors.danger },
  statusInactive: { backgroundColor: colors.cardSoft, color: colors.textMuted },
  vehicleActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  vehicleActionButton: {
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  vehicleActionText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  vehicleDangerAction: { borderColor: colors.danger },
  vehicleDangerActionText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  emptyScreen: { flex: 1, justifyContent: 'center', paddingHorizontal: 18, paddingBottom: 40 },
  selectUnitButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  selectUnitButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
