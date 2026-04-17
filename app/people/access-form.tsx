import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { lookupCpfProfile } from '../../services/cpfLookup';
import { createPerson, createVisitForecast } from '../../services/persons';
import { useAuthStore } from '../../store/useAuthStore';
import type { Person } from '../../types/person';

type AccessType = 'RESIDENT' | 'VISITOR' | 'SERVICE_PROVIDER' | 'RENTER';
type PickerTarget = 'startDate' | 'endDate' | 'startTime' | 'endTime' | 'birthDate' | null;

const ACCESS_TYPES: { id: AccessType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'RESIDENT', label: 'Morador', icon: 'home-outline' },
  { id: 'VISITOR', label: 'Visitante', icon: 'person-add-outline' },
  { id: 'SERVICE_PROVIDER', label: 'Prestador', icon: 'construct-outline' },
  { id: 'RENTER', label: 'Locatario', icon: 'key-outline' },
];

const WEEKDAYS = [
  { id: 'MONDAY', label: 'Seg' },
  { id: 'TUESDAY', label: 'Ter' },
  { id: 'WEDNESDAY', label: 'Qua' },
  { id: 'THURSDAY', label: 'Qui' },
  { id: 'FRIDAY', label: 'Sex' },
  { id: 'SATURDAY', label: 'Sab' },
  { id: 'SUNDAY', label: 'Dom' },
];

function isAccessType(value?: string): value is AccessType {
  return value === 'RESIDENT' || value === 'VISITOR' || value === 'SERVICE_PROVIDER' || value === 'RENTER';
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 0, 0);
  return next;
}

function combineDateAndTime(date: Date, time: Date) {
  const next = new Date(date);
  next.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return next;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatIsoDate(value?: string | null) {
  if (!value) return 'Nao informada';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAgeFromBirthDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  const dayDiff = today.getDate() - day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function typeLabel(type: AccessType) {
  return ACCESS_TYPES.find((item) => item.id === type)?.label || 'Pessoa';
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}

function maskCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export default function AccessFormScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { user } = useAuth();
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const initialType = isAccessType(params.type) ? params.type : 'VISITOR';

  const [type, setType] = useState<AccessType>(initialType);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(18, 0, 0, 0);
    return date;
  });
  const [weekdays, setWeekdays] = useState<string[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
  const [minorFacialConsent, setMinorFacialConsent] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianDocument, setGuardianDocument] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [saving, setSaving] = useState(false);
  const [cpfLookupLoading, setCpfLookupLoading] = useState(false);

  const requiresPeriod = type !== 'RESIDENT';
  const requiresSchedule = type === 'SERVICE_PROVIDER';
  const age = useMemo(() => getAgeFromBirthDate(birthDate), [birthDate]);
  const isMinor = age !== null && age < 18;
  const cpfDigits = useMemo(() => normalizeCpf(document), [document]);
  const canLookupCpf = (type === 'VISITOR' || type === 'SERVICE_PROVIDER') && cpfDigits.length === 11;

  const helperText = useMemo(() => {
    if (type === 'RESIDENT') return 'Moradores ficam vinculados a unidade sem validade.';
    if (type === 'SERVICE_PROVIDER') return 'Prestadores usam validade, dias da semana e faixa de horario.';
    if (type === 'RENTER') return 'Locatarios usam data de inicio e data final.';
    return 'Visitantes usam data de inicio e data final.';
  }, [type]);

  const minorNoticeText = minorFacialConsent
    ? 'A autorizacao estruturada do responsavel legal sera enviada junto do cadastro para cumprir o contrato oficial de facial de menor.'
    : 'Por padrao, nao enviamos foto de menores de idade para leitores faciais. So libere isso com autorizacao estruturada do responsavel legal.';

  function toggleWeekday(day: string) {
    setWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  }

  function handleDocumentChange(value: string) {
    const normalized = normalizeCpf(value);
    if (normalized.length <= 11) {
      setDocument(maskCpf(normalized));
      return;
    }

    setDocument(value);
  }

  async function handleCpfLookup() {
    if (!canLookupCpf) {
      Alert.alert('CPF incompleto', 'Digite um CPF valido com 11 numeros para consultar os dados.');
      return;
    }

    try {
      setCpfLookupLoading(true);
      const result = await lookupCpfProfile(document);

      if (!result) {
        Alert.alert('Consulta indisponivel', 'A consulta canonica por CPF nao retornou dados para este documento neste momento.');
        return;
      }

      if (result.fullName && !name.trim()) {
        setName(result.fullName);
      }

      if (result.birthDate) {
        setBirthDate(result.birthDate);
      }

      Alert.alert('Dados preenchidos', 'Nome completo e data de nascimento foram atualizados quando disponiveis.');
    } catch {
      Alert.alert('Nao foi possivel consultar', 'Tente novamente em instantes.');
    } finally {
      setCpfLookupLoading(false);
    }
  }

  function validate() {
    if (!selectedUnitId) {
      Alert.alert('Unidade obrigatoria', 'Selecione uma unidade antes de autorizar acessos.');
      return false;
    }

    if (!name.trim()) {
      Alert.alert('Nome obrigatorio', 'Informe o nome completo.');
      return false;
    }

    if (requiresPeriod && endDate < startDate) {
      Alert.alert('Periodo invalido', 'A data final precisa ser igual ou posterior a data inicial.');
      return false;
    }

    if (requiresSchedule) {
      if (!serviceType.trim()) {
        Alert.alert('Servico obrigatorio', 'Informe o tipo de servico.');
        return false;
      }

      if (weekdays.length === 0) {
        Alert.alert('Dias obrigatorios', 'Marque pelo menos um dia autorizado.');
        return false;
      }

      if (endTime <= startTime) {
        Alert.alert('Horario invalido', 'O horario final precisa ser posterior ao horario inicial.');
        return false;
      }
    }

    if (isMinor && minorFacialConsent) {
      if (!guardianName.trim()) {
        Alert.alert('Responsavel obrigatorio', 'Informe o nome do responsavel legal.');
        return false;
      }

      if (!guardianDocument.trim()) {
        Alert.alert('Documento obrigatorio', 'Informe o documento do responsavel legal.');
        return false;
      }

      if (!guardianRelationship.trim()) {
        Alert.alert('Relacao obrigatoria', 'Informe a relacao do responsavel legal com o menor.');
        return false;
      }
    }

    return true;
  }

  function buildMinorFacialAuthorization() {
    if (!isMinor) return null;

    return {
      authorized: minorFacialConsent,
      guardianName: minorFacialConsent ? guardianName.trim() || null : null,
      guardianDocument: minorFacialConsent ? guardianDocument.trim() || null : null,
      relationship: minorFacialConsent ? guardianRelationship.trim() || null : null,
      authorizationSource: 'RESIDENT_APP_DECLARATION',
      authorizedAt: minorFacialConsent ? new Date().toISOString() : null,
      notes: minorFacialConsent ? 'Autorizacao declarada no App Morador.' : 'Menor sem autorizacao facial.',
    } as const;
  }

  function buildNotes() {
    const parts: string[] = [];

    if (birthDate) parts.push(`Data de nascimento: ${formatIsoDate(birthDate)}`);
    if (age !== null) parts.push(`Idade calculada: ${age} anos`);

    if (isMinor) {
      parts.push('Menor de idade: sim');
      parts.push(`Autorizacao facial de menor: ${minorFacialConsent ? 'sim' : 'nao'}`);
      if (minorFacialConsent) {
        parts.push(`Responsavel legal: ${guardianName.trim()}`);
        parts.push(`Documento do responsavel: ${guardianDocument.trim()}`);
        if (guardianRelationship.trim()) {
          parts.push(`Relacao com o menor: ${guardianRelationship.trim()}`);
        }
      }
    }

    if (serviceType.trim()) parts.push(`Servico: ${serviceType.trim()}`);
    if (requiresSchedule) {
      const weekdayLabels = WEEKDAYS.filter((day) => weekdays.includes(day.id))
        .map((day) => day.label)
        .join(', ');
      parts.push(`Dias autorizados: ${weekdayLabels}`);
      parts.push(`Horario autorizado: ${formatTime(startTime)} as ${formatTime(endTime)}`);
    }
    if (notes.trim()) parts.push(`Observacoes: ${notes.trim()}`);

    return parts.join('\n') || null;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const unitId = selectedUnitId;
    if (!unitId) return;

    try {
      setSaving(true);

      if (type === 'RESIDENT') {
        await createPerson({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          document: document.trim() || null,
          documentType: cpfDigits.length === 11 ? 'CPF' : document.trim() ? 'RG' : null,
          birthDate,
          category: 'RESIDENT',
          unitId,
          unitIds: [unitId],
          notes: buildNotes(),
          minorFacialAuthorization: buildMinorFacialAuthorization(),
        });
      } else {
        const expectedEntryAt = requiresSchedule ? combineDateAndTime(startDate, startTime) : startOfDay(startDate);
        const expectedExitAt = requiresSchedule ? combineDateAndTime(endDate, endTime) : endOfDay(endDate);

        const createdVisit = await createVisitForecast({
          unitId,
          residentUserId: user?.id || null,
          visitorName: name.trim(),
          visitorDocument: document.trim() || null,
          visitorPhone: phone.trim() || null,
          category: type as Person['category'],
          notes: buildNotes(),
          expectedEntryAt: expectedEntryAt.toISOString(),
          expectedExitAt: expectedExitAt.toISOString(),
          birthDate,
          minorFacialAuthorization: buildMinorFacialAuthorization(),
        });

        router.replace({
          pathname: '/people/access-success',
          params: {
            id: createdVisit?.id || '',
            type,
            name: name.trim(),
            unitName: selectedUnitName || 'Unidade ativa',
            period: requiresPeriod ? `${formatDate(startDate)} ate ${formatDate(endDate)}` : 'Sem validade',
            schedule: requiresSchedule
              ? `${weekdays.map((day) => WEEKDAYS.find((item) => item.id === day)?.label || day).join(', ')} - ${formatTime(startTime)} as ${formatTime(endTime)}`
              : '',
          },
        });
        return;
      }

      router.replace({
        pathname: '/people/access-success',
        params: {
          type,
          name: name.trim(),
          unitName: selectedUnitName || 'Unidade ativa',
          period: requiresPeriod ? `${formatDate(startDate)} ate ${formatDate(endDate)}` : 'Sem validade',
          schedule: requiresSchedule
            ? `${weekdays.map((day) => WEEKDAYS.find((item) => item.id === day)?.label || day).join(', ')} - ${formatTime(startTime)} as ${formatTime(endTime)}`
            : '',
        },
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 403) {
        Alert.alert('Acesso nao liberado', 'Sua conta ainda nao pode fazer este cadastro.');
      } else {
        Alert.alert('Nao foi possivel salvar', message || 'Tente novamente em instantes.');
      }
    } finally {
      setSaving(false);
    }
  }

  function onPickerChange(_: unknown, value?: Date) {
    if (!value) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === 'startDate') setStartDate(value);
    if (pickerTarget === 'endDate') setEndDate(value);
    if (pickerTarget === 'startTime') setStartTime(value);
    if (pickerTarget === 'endTime') setEndTime(value);
    if (pickerTarget === 'birthDate') setBirthDate(toIsoDate(value));
    setPickerTarget(null);
  }

  function pickerValue() {
    if (pickerTarget === 'endDate') return endDate;
    if (pickerTarget === 'startTime') return startTime;
    if (pickerTarget === 'endTime') return endTime;
    if (pickerTarget === 'birthDate') {
      return birthDate ? new Date(`${birthDate}T12:00:00`) : new Date(2010, 0, 1);
    }
    return startDate;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Autorizar acesso',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.typeGrid}>
          {ACCESS_TYPES.map((item) => {
            const active = item.id === type;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[styles.typeButton, active && styles.typeButtonActive]}
                onPress={() => setType(item.id)}
              >
                <Ionicons name={item.icon} size={20} color={active ? colors.white : colors.primary} />
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{typeLabel(type)}</Text>
          <Text style={styles.noticeText}>{helperText} Preencha os dados abaixo para liberar a entrada.</Text>
        </View>

        <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Nome da pessoa" />

        <View style={styles.field}>
          <Text style={styles.label}>CPF ou documento</Text>
          <TextInput
            value={document}
            onChangeText={handleDocumentChange}
            placeholder="Opcional"
            keyboardType="numbers-and-punctuation"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
          />
          {(type === 'VISITOR' || type === 'SERVICE_PROVIDER') ? (
            <TouchableOpacity
              style={[styles.inlineAction, (!canLookupCpf || cpfLookupLoading) && styles.inlineActionDisabled]}
              onPress={() => {
                void handleCpfLookup();
              }}
              disabled={!canLookupCpf || cpfLookupLoading}
            >
              <Ionicons name="search-outline" size={16} color={colors.primary} />
              <Text style={styles.inlineActionText}>{cpfLookupLoading ? 'Consultando...' : 'Consultar CPF'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Field label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="Opcional"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.row}>
          <DateField label="Nascimento" value={formatIsoDate(birthDate)} onPress={() => setPickerTarget('birthDate')} />
          <View style={styles.ageCard}>
            <Text style={styles.label}>Idade</Text>
            <View style={styles.ageValueBox}>
              <Text style={styles.ageValue}>{age === null ? '--' : age}</Text>
              <Text style={styles.ageSuffix}>anos</Text>
            </View>
          </View>
        </View>

        {isMinor ? (
          <View style={styles.minorCard}>
            <View style={styles.minorHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.warning} />
              <Text style={styles.minorTitle}>Menor de idade identificado</Text>
            </View>
            <Text style={styles.minorText}>{minorNoticeText}</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.85}
              onPress={() => setMinorFacialConsent((current) => !current)}
            >
              <Ionicons
                name={minorFacialConsent ? 'checkbox-outline' : 'square-outline'}
                size={20}
                color={minorFacialConsent ? colors.primary : colors.textMuted}
              />
              <Text style={styles.checkboxText}>
                Sou responsavel legal e autorizo o envio da foto para o fluxo facial conforme o contrato oficial de menor.
              </Text>
            </TouchableOpacity>

            {minorFacialConsent ? (
              <>
                <Field
                  label="Nome do responsavel legal"
                  value={guardianName}
                  onChangeText={setGuardianName}
                  placeholder="Nome completo do responsavel"
                />
                <Field
                  label="Documento do responsavel"
                  value={guardianDocument}
                  onChangeText={setGuardianDocument}
                  placeholder="CPF ou documento"
                  keyboardType="numbers-and-punctuation"
                />
                <Field
                  label="Relacao com o menor"
                  value={guardianRelationship}
                  onChangeText={setGuardianRelationship}
                  placeholder="Ex.: mae, pai ou responsavel legal"
                />
              </>
            ) : null}
          </View>
        ) : null}

        {requiresPeriod ? (
          <View style={styles.row}>
            <DateField label="Inicio" value={formatDate(startDate)} onPress={() => setPickerTarget('startDate')} />
            <DateField label="Fim" value={formatDate(endDate)} onPress={() => setPickerTarget('endDate')} />
          </View>
        ) : null}

        {requiresSchedule ? (
          <>
            <Field
              label="Tipo de servico"
              value={serviceType}
              onChangeText={setServiceType}
              placeholder="Ex.: limpeza, obra ou cuidador"
            />

            <Text style={styles.label}>Dias autorizados</Text>
            <View style={styles.weekdayGrid}>
              {WEEKDAYS.map((day) => {
                const active = weekdays.includes(day.id);
                return (
                  <TouchableOpacity
                    key={day.id}
                    style={[styles.weekdayButton, active && styles.weekdayButtonActive]}
                    onPress={() => toggleWeekday(day.id)}
                  >
                    <Text style={[styles.weekdayText, active && styles.weekdayTextActive]}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <DateField label="Entrada" value={formatTime(startTime)} onPress={() => setPickerTarget('startTime')} />
              <DateField label="Saida" value={formatTime(endTime)} onPress={() => setPickerTarget('endTime')} />
            </View>
          </>
        ) : null}

        <Field
          label="Observacoes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opcional"
          multiline
          inputStyle={styles.textarea}
        />

        <PrimaryButton title="Salvar autorizacao" loading={saving} onPress={handleSubmit} />

        {pickerTarget ? (
          <DateTimePicker
            value={pickerValue()}
            mode={pickerTarget === 'startTime' || pickerTarget === 'endTime' ? 'time' : 'date'}
            display="default"
            onChange={onPickerChange}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  inputStyle,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; inputStyle?: object }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={[styles.input, inputStyle]} placeholderTextColor={colors.textSubtle} />
    </View>
  );
}

function DateField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <View style={styles.dateField}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} activeOpacity={0.85} onPress={onPress}>
        <Text style={styles.dateText}>{value}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 18, paddingBottom: 100 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  typeButton: {
    width: '47.5%',
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  typeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { color: colors.text, fontSize: 13, fontWeight: '900' },
  typeTextActive: { color: colors.white },
  notice: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  noticeTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 5 },
  noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  field: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 7 },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  inlineAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardSoft,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  inlineActionDisabled: { opacity: 0.5 },
  inlineActionText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  textarea: { minHeight: 92, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dateField: { flex: 1 },
  ageCard: { flex: 1 },
  ageValueBox: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ageValue: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  ageSuffix: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  dateButton: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { color: colors.text, fontSize: 14, fontWeight: '800' },
  minorCard: {
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 14,
    marginBottom: 14,
  },
  minorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  minorTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  minorText: { color: colors.text, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12, marginBottom: 8 },
  checkboxText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19, textAlign: 'justify' },
  weekdayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  weekdayButton: {
    minWidth: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 11,
    alignItems: 'center',
  },
  weekdayButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  weekdayText: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  weekdayTextActive: { color: colors.white },
});
