import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import UserAvatar from '../../components/UserAvatar';
import { colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useResidentPhoto } from '../../hooks/useResidentPhoto';
import { residentProfileService } from '../../services/residentProfile';
import { useAuthStore } from '../../store/useAuthStore';

function normalizeField(value?: string | null) {
  return value?.trim() || '';
}

function isValidEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPhotoFeedback(status: 'PENDING_PROCESSING' | 'NOT_REGISTERED') {
  if (status === 'PENDING_PROCESSING') {
    return 'A foto foi salva no perfil. O cadastro facial foi enviado e agora aguarda sincronizacao do backend.';
  }

  return 'A foto foi salva no perfil.';
}

export default function EditProfileScreen() {
  const { user, refreshMe } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);
  const { takePhoto, pickPhoto, uploading } = useResidentPhoto();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  const originalName = normalizeField(user?.name);
  const originalEmail = normalizeField(user?.email);
  const originalPhone = normalizeField(user?.phone);

  const normalizedName = normalizeField(name);
  const normalizedEmail = normalizeField(email);
  const normalizedPhone = normalizeField(phone);

  const hasChanges =
    normalizedName !== originalName || normalizedEmail !== originalEmail || normalizedPhone !== originalPhone;

  const emailIsValid = useMemo(() => isValidEmail(normalizedEmail), [normalizedEmail]);
  const canSave = hasChanges && !!normalizedName && emailIsValid && !saving && !uploading;

  async function handleRefresh() {
    try {
      const profile = await refreshMe();
      updateUser(profile);
      Alert.alert('Pronto', 'Dados atualizados.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel atualizar os dados agora.');
    }
  }

  async function handlePhotoAction(action: () => Promise<Awaited<ReturnType<typeof takePhoto>>>) {
    try {
      const result = await action();
      if (!result) return;

      Alert.alert('Foto atualizada', getPhotoFeedback(result.facialSyncStatus));
    } catch (err: any) {
      const status = err?.cause?.response?.status ?? err?.response?.status;

      if (err?.code === 'PROFILE_UPDATE_FAILED_AFTER_UPLOAD' && (status === 403 || status === 404 || status === 405)) {
        Alert.alert(
          'Vinculo em liberacao',
          'A foto foi enviada, mas sua conta ainda nao pode salvar essa imagem no perfil neste ambiente.'
        );
        return;
      }

      Alert.alert('Nao foi possivel atualizar a foto', 'Tente novamente em instantes.');
    }
  }

  async function handleSave() {
    if (!normalizedName) {
      Alert.alert('Nome obrigatorio', 'Informe seu nome para continuar.');
      return;
    }

    if (!emailIsValid) {
      Alert.alert('E-mail invalido', 'Revise o e-mail informado antes de salvar.');
      return;
    }

    if (!hasChanges) {
      Alert.alert('Sem alteracoes', 'Faca alguma mudanca antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await residentProfileService.updateProfile({
        name: normalizedName || undefined,
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
      });
      updateUser(updatedProfile);
      Alert.alert('Dados atualizados', 'As informacoes do seu perfil foram salvas.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) {
        Alert.alert('Edicao em liberacao', 'A atualizacao do perfil ainda nao esta disponivel para sua conta.');
      } else {
        Alert.alert('Nao foi possivel salvar', err?.response?.data?.message || 'Tente novamente em instantes.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Dados do perfil',
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
          <Text style={styles.noticeTitle}>Perfil da conta</Text>
          <Text style={styles.noticeText}>
            A API v4.0 ja preve atualizacao do perfil do morador. Se a liberacao ainda nao estiver ativa em producao,
            o app continua consultando os dados normalmente.
          </Text>
        </View>

        <View style={styles.photoCard}>
          <UserAvatar
            name={user?.name || 'Morador'}
            photoUri={user?.photoUri}
            size={92}
            textSize={34}
            iconFallback={<Ionicons name="person" size={42} color={colors.white} />}
          />
          <View style={styles.photoTextArea}>
            <Text style={styles.photoTitle}>Foto do morador</Text>
            <Text style={styles.photoText}>
              Esta imagem aparece no app e pode ser usada nos fluxos de leitura facial quando o backend estiver
              liberado.
            </Text>
          </View>
        </View>

        <View style={styles.photoActions}>
          <PrimaryButton
            title="Tirar foto"
            onPress={() => handlePhotoAction(takePhoto)}
            loading={uploading}
            disabled={saving || uploading}
            style={styles.photoButton}
          />
          <PrimaryButton
            title="Escolher foto"
            onPress={() => handlePhotoAction(pickPhoto)}
            variant="secondary"
            disabled={saving || uploading}
            style={styles.photoButton}
          />
        </View>

        <View style={styles.helperBox}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={styles.helperText}>
            Alterou nome, telefone, e-mail ou foto recentemente? Toque em atualizar para buscar os dados mais novos da
            sua conta.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, normalizedEmail && !emailIsValid ? styles.inputError : undefined]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="voce@exemplo.com"
            placeholderTextColor={colors.textMuted}
          />
          {normalizedEmail && !emailIsValid ? <Text style={styles.errorText}>Revise o e-mail informado.</Text> : null}

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nao informado"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.statusText}>
          {uploading
            ? 'Enviando foto...'
            : hasChanges
              ? 'Alteracoes prontas para salvar.'
              : 'Nenhuma alteracao pendente.'}
        </Text>

        <PrimaryButton title="Salvar alteracoes" loading={saving} onPress={handleSave} disabled={!canSave} />
        <View style={styles.buttonSpacer} />
        <PrimaryButton title="Atualizar dados da conta" onPress={handleRefresh} disabled={saving || uploading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  backButton: { marginLeft: 10 },
  content: { padding: 20, paddingBottom: 100 },
  notice: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  noticeTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 6 },
  noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  photoCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  photoTextArea: { flex: 1 },
  photoTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 6 },
  photoText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  photoActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoButton: { flex: 1 },
  helperBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  helperText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: -6, marginBottom: 12, fontWeight: '700' },
  statusText: { color: colors.textMuted, fontSize: 12, marginBottom: 16, textAlign: 'center', fontWeight: '700' },
  buttonSpacer: { height: 12 },
});
