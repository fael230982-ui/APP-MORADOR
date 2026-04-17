import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeveloperSignature from '../../components/DeveloperSignature';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import UserAvatar from '../../components/UserAvatar';
import { colors } from '../../constants/colors';
import { getPersonAccessSummary, getPersonById, updatePersonStatus } from '../../services/persons';
import type { Person, PersonAccessSummary } from '../../types/person';
import { maskDocument, maskEmail, maskPhone } from '../../utils/privacy';

function statusType(status: Person['status']) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'EXPIRED') return 'warning';
  return 'danger';
}

function formatDate(value?: string | null) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={styles.detailTextArea}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Não informado'}</Text>
      </View>
    </View>
  );
}

function weekdayLabel(value: string) {
  const labels: Record<string, string> = {
    MONDAY: 'Seg',
    TUESDAY: 'Ter',
    WEDNESDAY: 'Qua',
    THURSDAY: 'Qui',
    FRIDAY: 'Sex',
    SATURDAY: 'Sáb',
    SUNDAY: 'Dom',
  };
  return labels[value] || value;
}

export default function ViewPersonScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [accessSummary, setAccessSummary] = useState<PersonAccessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPerson = useCallback(async () => {
    if (!personId) return;

    try {
      setLoading(true);
      setError(null);
      const [data, summary] = await Promise.all([getPersonById(String(personId)), getPersonAccessSummary(String(personId)).catch(() => null)]);
      setPerson(data);
      setAccessSummary(summary);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Cadastro não encontrado.');
      } else if (err?.response?.status === 403) {
        setError('Sua conta ainda não pode abrir este cadastro.');
      } else {
        setError('Não foi possível carregar os dados deste cadastro.');
      }
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadPerson();
  }, [loadPerson]);

  async function changeStatus(nextStatus: Person['status']) {
    if (!person) return;

    try {
      setSavingStatus(true);
      const updated = await updatePersonStatus(person.id, nextStatus);
      setPerson(updated);
      Alert.alert('Pronto', 'Status atualizado.');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    } finally {
      setSavingStatus(false);
    }
  }

  function confirmDeactivate() {
    Alert.alert('Inativar cadastro', 'Deseja inativar este cadastro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Inativar', style: 'destructive', onPress: () => changeStatus('INACTIVE') },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Detalhes" showBack />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando cadastro...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !person) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Detalhes" showBack />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || 'Cadastro não encontrado.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Detalhes" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {person.photoUrl ? (
            <Image source={{ uri: person.photoUrl }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <UserAvatar
                name={person.name}
                photoUri={person.photoUrl}
                size={88}
                textSize={30}
                iconFallback={<Ionicons name="person-outline" size={42} color={colors.white} />}
              />
            </View>
          )}

          <View style={styles.personHeader}>
            <View style={styles.nameArea}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.category}>{person.categoryLabel}</Text>
            </View>
            <StatusBadge label={person.statusLabel} type={statusType(person.status)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do cadastro</Text>
          <DetailRow icon="id-card-outline" label="Documento" value={maskDocument(person.document)} />
          <DetailRow icon="call-outline" label="Telefone" value={maskPhone(person.phone)} />
          <DetailRow icon="mail-outline" label="E-mail" value={maskEmail(person.email)} />
          <DetailRow icon="home-outline" label="Unidade" value={person.unitName || person.unitNames?.join(', ')} />
          <DetailRow icon="calendar-outline" label="Início" value={formatDate(person.startDate)} />
          <DetailRow icon="calendar-clear-outline" label="Validade" value={formatDate(person.endDate)} />
          {person.accessGroupNames?.length ? (
            <DetailRow icon="shield-checkmark-outline" label="Grupos de acesso" value={person.accessGroupNames.join(', ')} />
          ) : null}
        </View>

        {person.status !== 'ACTIVE' ? (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.noticeText}>
              Este cadastro não está ativo no momento. Revise a validade e o status antes de tentar usar a autorização.
            </Text>
          </View>
        ) : null}

        {accessSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo de acessos</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem label="Hoje" value={accessSummary.accessesToday} />
              <SummaryItem label="Entradas" value={accessSummary.entries} />
              <SummaryItem label="Saídas" value={accessSummary.exits} />
              <SummaryItem label="Negados" value={accessSummary.denied} danger={accessSummary.denied > 0} />
            </View>
            <DetailRow
              icon="walk-outline"
              label="Situação agora"
              value={accessSummary.isInsideNow ? 'Dentro do condomínio' : 'Fora ou sem entrada aberta'}
            />
            <DetailRow icon="time-outline" label="Último acesso" value={formatDateTime(accessSummary.lastAccessAt)} />
            <DetailRow icon="location-outline" label="Local" value={accessSummary.location || accessSummary.cameraName} />
          </View>
        ) : null}

        {person.serviceType || person.serviceCompany || person.vehiclePlate || person.authorizedWeekdays?.length || person.accessStartTime || person.accessEndTime || person.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regras de acesso</Text>
            <DetailRow icon="construct-outline" label="Serviço" value={person.serviceType} />
            <DetailRow icon="business-outline" label="Empresa" value={person.serviceCompany} />
            <DetailRow icon="car-outline" label="Veiculo" value={person.vehiclePlate} />
            <DetailRow
              icon="calendar-number-outline"
              label="Dias autorizados"
              value={person.authorizedWeekdays?.map(weekdayLabel).join(', ')}
            />
            <DetailRow
              icon="time-outline"
              label="Horário"
              value={person.accessStartTime || person.accessEndTime ? `${person.accessStartTime || '--:--'} às ${person.accessEndTime || '--:--'}` : null}
            />
            <DetailRow icon="document-text-outline" label="Observações" value={person.notes} />
          </View>
        ) : null}

        <View style={styles.actions}>
          {person.status === 'INACTIVE' ? (
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} disabled={savingStatus} onPress={() => changeStatus('ACTIVE')}>
              <Text style={styles.primaryButtonText}>{savingStatus ? 'Atualizando...' : 'Reativar cadastro'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} disabled={savingStatus} onPress={confirmDeactivate}>
              <Text style={styles.dangerButtonText}>{savingStatus ? 'Atualizando...' : 'Inativar cadastro'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <DeveloperSignature />
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, danger && styles.summaryValueDanger]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 100 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  errorBox: {
    margin: 18,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 16,
  },
  errorText: { color: colors.text, lineHeight: 20 },
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 14,
    marginBottom: 14,
  },
  noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  photo: { width: '100%', height: 220, borderRadius: 8, backgroundColor: colors.cardSoft },
  photoPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 16 },
  nameArea: { flex: 1 },
  name: { color: colors.text, fontSize: 24, fontWeight: '900' },
  category: { color: colors.textMuted, fontSize: 14, fontWeight: '700', marginTop: 4 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTextArea: { flex: 1 },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 3 },
  detailValue: { color: colors.text, fontSize: 15, lineHeight: 20 },
  summaryGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryItem: { flex: 1, backgroundColor: colors.cardSoft, borderRadius: 8, padding: 10, alignItems: 'center' },
  summaryValue: { color: colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  summaryValueDanger: { color: colors.danger },
  summaryLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  actions: { gap: 10 },
  actionButton: { borderRadius: 8, padding: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontWeight: '900' },
  dangerButton: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  dangerButtonText: { color: colors.danger, fontWeight: '900' },
  secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryButtonText: { color: colors.text, fontWeight: '800' },
});
