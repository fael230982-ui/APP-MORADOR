import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserAvatar from '../../components/UserAvatar';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useAuth } from '../../hooks/useAuth';
import { useResidentPhoto } from '../../hooks/useResidentPhoto';
import { getAuthImageHeaders } from '../../services/api';
import { facialStatusService, getFacialStatusLabel, type FacialSyncStatus } from '../../services/facialStatus';

function getFeedback(status: 'PENDING_PROCESSING' | 'NOT_REGISTERED') {
  if (status === 'PENDING_PROCESSING') {
    return 'Sua foto foi salva. O cadastro facial foi enviado e agora aguarda sincronizacao do backend.';
  }

  return 'Sua foto foi salva para uso no app.';
}

function statusTone(status: FacialSyncStatus['state']) {
  if (status === 'READY') return { background: colors.successSoft, color: colors.success };
  if (status === 'PENDING_PROCESSING') return { background: colors.warningSoft, color: colors.warning };
  if (status === 'FAILED' || status === 'BLOCKED') return { background: colors.dangerSoft, color: colors.danger };
  return { background: colors.cardSoft, color: colors.textMuted };
}

function formatDate(value?: string | null) {
  if (!value) return 'Sem registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function buildPhotoPreviewSource(uri?: string | null, refreshKey?: number) {
  if (!uri) return null;
  const isRemote = /^https?:\/\//i.test(uri);
  if (!isRemote) {
    return { uri };
  }

  const separator = uri.includes('?') ? '&' : '?';
  return {
    uri: `${uri}${separator}photoTs=${refreshKey ?? 'static'}`,
    headers: getAuthImageHeaders(),
  };
}

export default function FaceEnrollmentScreen() {
  const { user } = useAuth();
  const { takePhoto, pickPhoto, uploading, isIosExpoGo } = useResidentPhoto();
  const [syncStatus, setSyncStatus] = useState<FacialSyncStatus>({ state: 'UNKNOWN' });
  const [imageFailed, setImageFailed] = useState(false);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(() => Date.now());
  const fallbackPhotoUri = syncStatus.localPhotoDataUri ?? syncStatus.localPhotoUri ?? null;
  const effectivePhotoUri = fallbackPhotoUri ?? user?.photoUri ?? syncStatus.photoUri ?? null;
  const previewSource = buildPhotoPreviewSource(effectivePhotoUri, photoRefreshKey);

  const loadStatus = useCallback(async () => {
    const current = await facialStatusService.get();
    setSyncStatus(current);
  }, []);

  useAutoRefresh(loadStatus, { intervalMs: 30000, topics: ['profile', 'realtime'] });

  async function handleAction(action: () => Promise<Awaited<ReturnType<typeof takePhoto>>>) {
    try {
      const result = await action();
      if (!result) return;

      const current = await facialStatusService.get();
      setSyncStatus(current);
      setImageFailed(false);
      setPhotoRefreshKey(Date.now());
      Alert.alert('Cadastro atualizado', getFeedback(result.facialSyncStatus));
    } catch (err: any) {
      if (err?.code === 'PHOTO_PICKER_PERMISSION_ERROR') {
        Alert.alert('Permissao indisponivel', 'O Expo Go nao conseguiu abrir a camera ou a galeria agora. Feche e abra o app novamente e tente mais uma vez.');
        return;
      }
      const status = err?.cause?.response?.status ?? err?.response?.status;

      if (err?.code === 'PROFILE_UPDATE_FAILED_AFTER_UPLOAD' && (status === 403 || status === 404 || status === 405)) {
        Alert.alert(
          'Vinculo em liberacao',
          'A foto foi enviada, mas sua conta ainda nao pode salvar essa imagem no perfil neste ambiente.'
        );
        return;
      }

      Alert.alert('Nao foi possivel concluir agora', 'Tente novamente em instantes.');
    }
  }

  const tone = statusTone(syncStatus.state);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Biometria facial',
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
        <Text style={styles.title}>Cadastro facial</Text>
        <Text style={styles.subtitle}>
          Use uma foto frontal, com boa iluminacao e o rosto centralizado. Essa imagem pode ser usada nos leitores
          faciais quando o backend estiver liberado.
        </Text>
      </View>

      <View style={styles.previewCard}>
        {previewSource && !imageFailed ? (
          <Image
            source={previewSource}
            style={styles.previewImage}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <UserAvatar
            name={user?.name || 'Morador'}
            photoUri={effectivePhotoUri}
            fallbackPhotoUri={fallbackPhotoUri}
            size={140}
            textSize={48}
            iconFallback={<Ionicons name="person" size={64} color={colors.white} />}
          />
        )}
        <Text style={styles.previewTitle}>Foto atual</Text>
        <Text style={styles.previewText}>
          Sempre que possivel, mantenha a foto recente. Isso melhora identificacao no app e no fluxo facial.
        </Text>
      </View>

      <View style={styles.statusCard}>
        <View style={[styles.statusPill, { backgroundColor: tone.background }]}>
          <Text style={[styles.statusPillText, { color: tone.color }]}>{getFacialStatusLabel(syncStatus)}</Text>
        </View>
        <Text style={styles.statusText}>Ultima atualizacao: {formatDate(syncStatus.updatedAt)}</Text>
        {syncStatus.backendErrorMessage ? <Text style={styles.errorHintText}>Retorno do backend: {syncStatus.backendErrorMessage}</Text> : null}
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.noticeText}>
          O app ja consegue salvar a imagem no perfil. Se o motor facial ainda nao aceitar o envio, a sincronizacao
          fica pendente sem impedir o uso da foto no app.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Tirar foto" onPress={() => handleAction(takePhoto)} loading={uploading} />
        <View style={styles.buttonSpacer} />
        <PrimaryButton
          title={isIosExpoGo() ? 'Galeria indisponivel no Expo Go' : 'Escolher foto da galeria'}
          variant="secondary"
          onPress={() => handleAction(pickPhoto)}
          disabled={uploading || isIosExpoGo()}
        />
      </View>

      {isIosExpoGo() ? (
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.noticeText}>
            No iPhone com Expo Go, escolher foto pela galeria pode falhar. Use `Tirar foto` durante os testes ou valide a galeria em uma build nativa.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  backButton: { marginLeft: 10 },
  header: { alignItems: 'center', marginTop: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  previewCard: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  previewImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  previewTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  previewText: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  statusCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'flex-start',
  },
  statusPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8 },
  statusPillText: { fontSize: 12, fontWeight: '900' },
  statusText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  errorHintText: { color: colors.danger, fontSize: 12, lineHeight: 18, marginTop: 8, fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 18,
  },
  noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  footer: { marginTop: 'auto', marginBottom: 20 },
  buttonSpacer: { height: 12 },
});
