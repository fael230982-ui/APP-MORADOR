import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserAvatar from '../../components/UserAvatar';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useAuth } from '../../hooks/useAuth';
import { getAuthImageHeaders } from '../../services/api';
import { facialStatusService, getFacialStatusLabel, type FacialSyncStatus } from '../../services/facialStatus';
import { loadResidentOverview } from '../../services/residentOverview';
import { residentRealtimeService } from '../../services/residentRealtime';
import { useAuthStore } from '../../store/useAuthStore';
import { displayEmail } from '../../utils/privacy';

export default function ProfileScreen() {
  const { user, signOut, acceptedTermsVersion, currentTermsVersion } = useAuth();
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const unitLabel = selectedUnitName || user?.selectedUnitName || user?.unitName || 'Unidade não selecionada';
  const profileLabel = getProfileLabel(user?.role);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [facialStatus, setFacialStatus] = useState<FacialSyncStatus>({ state: 'UNKNOWN' });
  const [realtimeReady, setRealtimeReady] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const legalNeedsUpdate = useMemo(
    () => !!currentTermsVersion && acceptedTermsVersion !== currentTermsVersion,
    [acceptedTermsVersion, currentTermsVersion]
  );
  const fallbackPhotoUri = facialStatus.localPhotoDataUri ?? facialStatus.localPhotoUri ?? null;
  const effectivePhotoUri = user?.photoUri ?? facialStatus.photoUri ?? fallbackPhotoUri ?? null;
  const phoneLabel = user?.phone?.trim() || 'Não informado';
  const photoSource =
    effectivePhotoUri && /^https?:\/\//i.test(effectivePhotoUri)
      ? { uri: effectivePhotoUri, headers: getAuthImageHeaders() }
      : effectivePhotoUri
        ? { uri: effectivePhotoUri }
        : null;

  const loadProfileCounters = useCallback(async () => {
    const [overview, faceStatus] = await Promise.all([
      loadResidentOverview({ messageLimit: 20, upcomingVisitsLimit: 1 }).catch(() => null),
      facialStatusService.get().catch(
        (): FacialSyncStatus => ({ state: 'UNKNOWN', updatedAt: null, photoUri: null })
      ),
    ]);

    setUnreadNotificationsCount((current) => (overview?.notifications.available ? overview.notifications.unread : current));
    setFacialStatus(overview?.facial ?? faceStatus);
  }, []);

  useAutoRefresh(loadProfileCounters, {
    intervalMs: 45000,
    topics: ['overview', 'profile', 'messages', 'notifications', 'unit', 'realtime'],
  });

  React.useEffect(() => {
    facialStatusService
      .get()
      .then((status) => setFacialStatus(status))
      .catch(() => setFacialStatus({ state: 'UNKNOWN' }));
  }, []);

  React.useEffect(() => {
    return residentRealtimeService.subscribe((snapshot) => {
      setRealtimeReady(snapshot.status === 'prepared' || snapshot.status === 'connected');
    });
  }, []);

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={effectivePhotoUri ? 0.88 : 1}
          disabled={!effectivePhotoUri}
          onPress={() => setShowPhotoModal(true)}
          style={styles.avatarButton}
        >
          <UserAvatar
            name={user?.name}
            photoUri={effectivePhotoUri}
            fallbackPhotoUri={fallbackPhotoUri}
            cacheKey={user?.faceUpdatedAt ?? facialStatus.updatedAt ?? effectivePhotoUri ?? fallbackPhotoUri}
            size={86}
            textSize={28}
            iconFallback={<Ionicons name="person" size={42} color={colors.white} />}
          />
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name || 'Morador'}</Text>
        <Text style={styles.userEmail}>{displayEmail(user?.email, 'SHARED_SUMMARY') || ''}</Text>
        <View style={styles.unitBadge}>
          <Ionicons name="business-outline" size={16} color={colors.primary} />
          <Text style={styles.unitBadgeText}>{unitLabel}</Text>
        </View>
        {effectivePhotoUri ? <Text style={styles.avatarHint}>Toque na foto para ampliar.</Text> : null}
      </View>

      <TouchableOpacity style={styles.infoCard} activeOpacity={0.86} onPress={() => router.push('/unit-dashboard')}>
        <Text style={styles.infoLabel}>Minha unidade</Text>
        <Text style={styles.infoValue}>{unitLabel}</Text>
        <Text style={styles.infoHint}>Toque para ver o resumo de segurança, acessos e avisos.</Text>
      </TouchableOpacity>

      {legalNeedsUpdate ? (
        <TouchableOpacity style={styles.warningCard} activeOpacity={0.86} onPress={() => router.push('/legal/privacy')}>
          <Ionicons name="document-text-outline" size={20} color={colors.warning} />
          <View style={styles.warningTextArea}>
            <Text style={styles.warningTitle}>Política atualizada</Text>
            <Text style={styles.warningText}>
              Sua conta aceitou a versão {acceptedTermsVersion || 'anterior'}, mas o app já está publicando a versão {currentTermsVersion}.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ) : null}

      {!effectivePhotoUri ? (
        <TouchableOpacity style={styles.warningCard} activeOpacity={0.86} onPress={() => router.push('/profile/edit')}>
          <Ionicons name="camera-outline" size={20} color={colors.warning} />
          <View style={styles.warningTextArea}>
            <Text style={styles.warningTitle}>Foto ainda não cadastrada</Text>
            <Text style={styles.warningText}>Cadastre uma foto recente para melhorar sua identificação no app.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.profileDetails}>
        <Text style={styles.profileSectionTitle}>Dados da conta</Text>
        <InfoLine label="Nome" value={user?.name || 'Morador'} />
        <InfoLine label="E-mail" value={displayEmail(user?.email, 'SHARED_SUMMARY')} />
        <InfoLine label="Telefone" value={phoneLabel} />
        <InfoLine label="Perfil" value={profileLabel} />
        <InfoLine label="Biometria facial" value={getFacialStatusLabel(facialStatus)} />
        <InfoLine label="Sincronização" value={realtimeReady ? 'Atualização automática ativa' : 'Atualização periódica'} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Conta e preferências</Text>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/edit')}>
        <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Dados do perfil</Text>
          <Text style={styles.menuSubtitle}>Nome, e-mail, telefone e foto da conta</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/resident-notifications')}>
        <Ionicons name="mail-unread-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Notificações</Text>
          <Text style={styles.menuSubtitle}>Avisos recebidos da unidade</Text>
        </View>
        {unreadNotificationsCount > 0 ? <CountBadge value={unreadNotificationsCount} /> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/notifications')}>
        <Ionicons name="options-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Preferências de aviso</Text>
          <Text style={styles.menuSubtitle}>Destaques e alertas deste aparelho</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/face-enrollment')}>
        <Ionicons name="scan-circle-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Biometria facial</Text>
          <Text style={styles.menuSubtitle}>Cadastro e conferência do rosto</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ajuda e informações</Text>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/resident-actions')}>
        <Ionicons name="shield-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Ações rápidas</Text>
          <Text style={styles.menuSubtitle}>Pânico e entrada assistida</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/support')}>
        <Ionicons name="headset-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Suporte</Text>
          <Text style={styles.menuSubtitle}>Dados da conta e contato</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/diagnostics')}>
        <Ionicons name="pulse-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Diagnósticos locais</Text>
          <Text style={styles.menuSubtitle}>Erros e avisos recentes de integração deste aparelho</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/privacy')}>
        <Ionicons name="document-text-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Privacidade e termos</Text>
          <Text style={styles.menuSubtitle}>
            {currentTermsVersion
              ? `Vigente: ${currentTermsVersion}${acceptedTermsVersion ? ` | Aceita: ${acceptedTermsVersion}` : ''}`
              : acceptedTermsVersion
                ? `Versão aceita: ${acceptedTermsVersion}`
                : 'Política de privacidade e termos do app'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/about')}>
        <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
        <View style={styles.menuTextArea}>
          <Text style={styles.menuTitle}>Sobre o app</Text>
          <Text style={styles.menuSubtitle}>Versão e canais oficiais</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
        <View style={styles.photoModalOverlay}>
          <TouchableOpacity style={styles.photoModalBackdrop} activeOpacity={1} onPress={() => setShowPhotoModal(false)} />
          <View style={styles.photoModalCard}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Foto do perfil</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {photoSource ? <Image source={photoSource} style={styles.photoModalImage} resizeMode="contain" /> : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function CountBadge({ value }: { value: number }) {
  return (
    <View style={styles.countBadge}>
      <Text style={styles.countBadgeText}>{value > 99 ? '99+' : String(value)}</Text>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLineLabel}>{label}</Text>
      <Text style={styles.infoLineValue}>{value}</Text>
    </View>
  );
}

function getProfileLabel(role?: string | null) {
  if (!role) return 'Morador';
  if (role === 'MORADOR' || role === 'RESIDENT') return 'Morador';
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingTop: 56, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 22 },
  avatarButton: { marginBottom: 12 },
  avatarHint: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
  userName: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  userEmail: { color: colors.textMuted, fontSize: 14, marginTop: 4, textAlign: 'center' },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  unitBadgeText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  infoValue: { color: colors.text, fontSize: 18, fontWeight: '900' },
  infoHint: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: 14,
    marginBottom: 12,
  },
  warningTextArea: { flex: 1 },
  warningTitle: { color: colors.text, fontSize: 14, fontWeight: '900', marginBottom: 3 },
  warningText: { color: colors.text, fontSize: 12, lineHeight: 18 },
  profileDetails: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 12,
  },
  profileSectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 4, paddingTop: 4 },
  infoLine: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLineLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 3 },
  infoLineValue: { color: colors.text, fontSize: 14, fontWeight: '800' },
  sectionHeader: { marginTop: 4, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  menuTextArea: { flex: 1 },
  menuTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  menuSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 18 },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { color: colors.white, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDA29B',
    marginTop: 8,
  },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: '800' },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  photoModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  photoModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoModalTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  photoModalImage: {
    width: '100%',
    height: 340,
    borderRadius: 12,
    backgroundColor: colors.cardSoft,
  },
});
