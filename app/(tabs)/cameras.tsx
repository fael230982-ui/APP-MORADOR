import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraSkeleton from '../../components/CameraSkeleton';
import EmptyState from '../../components/EmptyState';
import FeatureLockedState from '../../components/FeatureLockedState';
import SectionHeader from '../../components/SectionHeader';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { colors } from '../../constants/colors';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useApi } from '../../hooks/useApi';
import { getAuthImageHeaders } from '../../services/api';
import { cameraService } from '../../services/cameraService';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';
import type { Camera } from '../../types/camera';

function cameraStatusLabel(value?: string | null) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'offline') return 'Offline';
  if (normalized === 'online') return 'Online';
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Status';
}

function cameraPreferredMediaLabel(camera: Camera) {
  if (camera.preferredMedia === 'webRtcUrl' || camera.preferredMedia === 'hlsUrl' || camera.preferredMedia === 'liveUrl') {
    return 'Prioridade de midia: video ao vivo';
  }

  if (camera.preferredMedia === 'imageStreamUrl' || camera.preferredMedia === 'mjpegUrl') {
    return 'Prioridade de midia: imagem em tempo real';
  }

  if (camera.preferredMedia === 'snapshotUrl' || camera.preferredMedia === 'thumbnailUrl') {
    return 'Prioridade de midia: imagem sob demanda';
  }

  return 'Prioridade de midia: ainda nao definida';
}

export default function CamerasScreen() {
  const { data: cameras, loading, execute } = useApi<Camera[]>(cameraService.getUnitCameras);
  const [previewStatusByCamera, setPreviewStatusByCamera] = useState<Record<string, string>>({});
  const [liveUrlByCamera, setLiveUrlByCamera] = useState<Record<string, string>>({});
  const [previewByCamera, setPreviewByCamera] = useState<Record<string, string>>({});
  const [failedPreviewByCamera, setFailedPreviewByCamera] = useState<Record<string, string[]>>({});
  const [checkedAtByCamera, setCheckedAtByCamera] = useState<Record<string, Date>>({});
  const [fullscreenCamera, setFullscreenCamera] = useState<{ camera: Camera; liveUrl: string; previewUrl: string } | null>(null);
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const selectedUnitName = useAuthStore((state) => state.selectedUnitName);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const [error, setError] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');

  const loadCameras = useCallback(async () => {
    setError(null);
    await execute().catch((err: any) => {
      setError(err?.response?.data?.message || 'Nao foi possivel carregar as cameras agora.');
    });
  }, [execute]);

  useAutoRefresh(loadCameras, { intervalMs: 30000, topics: ['cameras', 'unit', 'realtime'] });

  async function handleLoadStream(camera: Camera) {
    try {
      const streaming = await cameraService.getStreaming(camera.id);
      const nestedLiveCandidates = extractNestedLiveCandidates(streaming.streams);
      const liveVideoUrl =
        pickDeclaredLiveVideoUrl([
          streaming.preferredLiveUrl,
          streaming.webRtcUrl,
          streaming.hlsUrl,
          streaming.liveUrl,
          camera.preferredLiveUrl,
          camera.webRtcUrl,
          camera.hlsUrl,
          camera.liveUrl,
          ...nestedLiveCandidates,
        ]) || pickPlayableVideoUrl([streaming.streamUrl, camera.streamUrl]);
      const previewUrl = pickPlayableImageUrl([
        streaming.preferredStillUrl,
        streaming.snapshotUrl,
        streaming.frameUrl,
        streaming.previewUrl,
        camera.preferredStillUrl,
        camera.snapshotUrl,
        camera.frameUrl,
        camera.previewUrl,
        camera.thumbnailUrl,
        cameraService.snapshotUrl(camera.id),
        streaming.imageStreamUrl,
        streaming.mjpegUrl,
        camera.imageStreamUrl,
        camera.mjpegUrl,
        cameraService.imageStreamUrl(camera.id),
      ]);

      setPreviewStatusByCamera((current) => ({
        ...current,
        [camera.id]: liveVideoUrl
          ? 'Video ao vivo disponivel.'
          : previewUrl
            ? 'Video ao vivo indisponivel agora. Exibindo uma imagem atual da camera.'
            : 'A camera nao entregou video nem imagem agora.',
      }));
      setLiveUrlByCamera((current) => ({ ...current, [camera.id]: liveVideoUrl }));
      setCheckedAtByCamera((current) => ({ ...current, [camera.id]: new Date() }));

      if (previewUrl) {
        setPreviewByCamera((current) => ({ ...current, [camera.id]: previewUrl }));
      }
    } catch {
      setPreviewStatusByCamera((current) => ({
        ...current,
        [camera.id]: 'Nao foi possivel consultar o video agora. Exibindo imagem quando disponivel.',
      }));
      setLiveUrlByCamera((current) => ({ ...current, [camera.id]: '' }));
      setCheckedAtByCamera((current) => ({ ...current, [camera.id]: new Date() }));
    }
  }

  function handleRefreshImage(camera: Camera) {
    setFailedPreviewByCamera((current) => ({ ...current, [camera.id]: [] }));
    setPreviewByCamera((current) => ({
      ...current,
      [camera.id]: camera.snapshotUrl || camera.thumbnailUrl || cameraService.snapshotUrl(camera.id),
    }));
    setPreviewStatusByCamera((current) => ({
      ...current,
      [camera.id]: 'Imagem atualizada para conferencia rapida.',
    }));
    setCheckedAtByCamera((current) => ({ ...current, [camera.id]: new Date() }));
  }

  const renderItem = ({ item }: { item: Camera }) => {
    const failedPreviewUrls = failedPreviewByCamera[item.id] || [];
    const liveUrl =
      liveUrlByCamera[item.id] ||
      pickDeclaredLiveVideoUrl([item.preferredLiveUrl, item.webRtcUrl, item.hlsUrl, item.liveUrl]) ||
      pickPlayableVideoUrl([item.streamUrl]);
    const previewCandidates = getPreviewCandidates(item, previewByCamera[item.id]).filter((url) => !failedPreviewUrls.includes(url));
    const previewUrl = previewCandidates[0] || '';

    return (
      <View style={styles.cameraCard}>
        <TouchableOpacity
          style={styles.videoPlaceholder}
          activeOpacity={0.92}
          onPress={() => setFullscreenCamera({ camera: item, liveUrl, previewUrl })}
          disabled={!liveUrl && !previewUrl}
        >
          <CameraVisual
            liveUrl={liveUrl}
            previewUrl={previewUrl}
            refreshTick={checkedAtByCamera[item.id]?.getTime() || 0}
            failedPreviewUrls={failedPreviewUrls}
            onPreviewError={() => {
              if (!previewUrl) return;
              setFailedPreviewByCamera((current) => ({
                ...current,
                [item.id]: [...(current[item.id] || []), previewUrl],
              }));
            }}
          />
          <Text style={[styles.onlineBadge, item.status === 'offline' && styles.offlineBadge]}>{cameraStatusLabel(item.status)}</Text>
          <Text style={[styles.modeBadge, liveUrl ? styles.liveBadge : styles.snapshotBadge]}>{liveUrl ? 'Ao vivo' : 'Imagem atual'}</Text>
          {liveUrl || previewUrl ? (
            <View style={styles.fullscreenHint}>
              <Ionicons name="expand-outline" size={14} color={colors.white} />
              <Text style={styles.fullscreenHintText}>Tela cheia</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <Text style={styles.cameraName}>{item.name}</Text>
          <Text style={styles.cameraLocation}>{item.location}</Text>

          {item.accessGroupNames?.length ? (
            <View style={styles.cameraGroupPill}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
              <Text style={styles.cameraGroupText}>{item.accessGroupNames.slice(0, 2).join(', ')}</Text>
            </View>
          ) : null}

          <View style={styles.signalBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <View style={styles.helpTextArea}>
              <Text style={styles.helpText}>
                Quando a camera liberar video ao vivo, ele aparece aqui. Caso contrario, o app mostra uma imagem atual para conferencia.
              </Text>
              <Text style={styles.mediaHintText}>{cameraPreferredMediaLabel(item)}</Text>
            </View>
          </View>

          {previewStatusByCamera[item.id] !== undefined ? (
            <View style={styles.streamStatusBox}>
              <Text style={styles.streamText}>{previewStatusByCamera[item.id]}</Text>
              {checkedAtByCamera[item.id] ? (
                <Text style={styles.lastCheckedText}>
                  Ultima verificacao: {checkedAtByCamera[item.id].toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => handleRefreshImage(item)}>
              <Ionicons name="refresh-outline" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Atualizar imagem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.streamButton} onPress={() => handleLoadStream(item)}>
              <Text style={styles.streamButtonText}>{liveUrl ? 'Atualizar video' : 'Ver ao vivo'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!camerasEnabled) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="Cameras" subtitle="Disponibilidade definida pela configuracao oficial da unidade." />
          <FeatureLockedState
            icon="videocam-outline"
            title="Cameras indisponiveis"
            description="Este condominio nao habilitou a visualizacao de cameras para esta experiencia do morador."
            actionLabel="Voltar para o inicio"
            onAction={() => router.replace('/')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedUnitId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <SectionHeader title="Cameras" subtitle="Escolha uma unidade para ver as cameras vinculadas." />
          <EmptyState
            icon="videocam-outline"
            title="Escolha uma unidade"
            description="Selecione a unidade que deseja acompanhar para abrir as cameras disponiveis."
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <SectionHeader title="Cameras" subtitle={selectedUnitName ? `Unidade ativa: ${selectedUnitName}` : 'Monitoramento em tempo real'} />

        {loading && !cameras ? (
          <View>
            <CameraSkeleton />
            <CameraSkeleton />
          </View>
        ) : (
          <FlatList
            data={cameras}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              error && cameras?.length ? (
                <View style={styles.inlineNotice}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
                  <Text style={styles.inlineNoticeText}>{error}</Text>
                </View>
              ) : null
            }
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCameras} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyCameraBox}>
                <EmptyState
                  icon="videocam-outline"
                  title={error ? 'Cameras indisponiveis' : 'Nenhuma camera disponivel'}
                  description={error || 'Quando houver camera vinculada a sua unidade, ela aparecera aqui.'}
                />
                <TouchableOpacity style={styles.supportButton} activeOpacity={0.86} onPress={() => router.push('/profile/support')}>
                  <Ionicons name="headset-outline" size={18} color={colors.white} />
                  <Text style={styles.supportButtonText}>Pedir ajuda ao suporte</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      <FullscreenCameraModal data={fullscreenCamera} onClose={() => setFullscreenCamera(null)} />
      <UnitSelectionModal visible={showUnitModal} onClose={() => setShowUnitModal(false)} />
    </SafeAreaView>
  );
}

function CameraVisual({
  liveUrl,
  previewUrl,
  refreshTick,
  failedPreviewUrls,
  onPreviewError,
}: {
  liveUrl: string;
  previewUrl: string;
  refreshTick: number;
  failedPreviewUrls: string[];
  onPreviewError?: () => void;
}) {
  if (liveUrl) {
    return <LiveCameraPlayer url={liveUrl} />;
  }

  if (previewUrl) {
    return (
      <Image
        source={{ uri: withRefreshParam(previewUrl, refreshTick), headers: getAuthImageHeaders() }}
        style={styles.snapshot}
        resizeMode="cover"
        onError={onPreviewError}
      />
    );
  }

  return (
    <View style={styles.noPreviewBox}>
      <Ionicons name="videocam-outline" size={30} color={colors.textMuted} />
      <Text style={styles.noPreviewText}>Imagem ao vivo ainda nao disponivel</Text>
      {failedPreviewUrls.length > 0 ? (
        <Text style={styles.noPreviewHint}>O servidor nao entregou uma imagem valida agora. Tente atualizar novamente em instantes.</Text>
      ) : null}
    </View>
  );
}

function FullscreenCameraModal({
  data,
  onClose,
}: {
  data: { camera: Camera; liveUrl: string; previewUrl: string } | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={!!data} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.fullscreenContainer}>
        {data ? (
          <>
            <View style={styles.fullscreenTopBar}>
              <View style={styles.fullscreenTitleArea}>
                <Text style={styles.fullscreenTitle}>{data.camera.name}</Text>
                <Text style={styles.fullscreenSubtitle}>{data.camera.location}</Text>
              </View>
              <TouchableOpacity style={styles.fullscreenCloseButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.fullscreenVideoArea}>
              <CameraVisual liveUrl={data.liveUrl} previewUrl={data.previewUrl} refreshTick={Date.now()} failedPreviewUrls={[]} />
            </View>

            <View style={styles.fullscreenBottomBar}>
              <Text style={styles.fullscreenMode}>{data.liveUrl ? 'Video ao vivo' : 'Imagem atual'}</Text>
              <Text style={styles.fullscreenHintBottom}>Toque no X para voltar</Text>
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}

function LiveCameraPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(
    {
      uri: url,
      headers: getAuthImageHeaders(),
    },
    (instance) => {
      instance.loop = true;
      instance.play();
    }
  );

  return <VideoView style={styles.snapshot} player={player} nativeControls contentFit="cover" />;
}

function isImagePreviewUrl(url?: string | null) {
  if (!url) return false;
  const value = url.toLowerCase();
  if (value.startsWith('rtsp://')) return false;
  if (value.includes('.m3u8') || value.includes('webrtc') || value.includes('rtmp://')) return false;
  return true;
}

function pickPlayableImageUrl(urls: (string | null | undefined)[]) {
  return urls.find(isImagePreviewUrl) || '';
}

function isPlayableVideoUrl(url?: string | null) {
  if (!url) return false;
  const value = url.toLowerCase();
  if (value.startsWith('rtsp://') || value.includes('rtmp://')) return false;
  if (value.includes('snapshot') || value.includes('thumbnail') || value.includes('preview') || value.includes('frame')) return false;
  if (value.includes('image-stream') || value.includes('mjpeg') || value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png')) return false;
  return value.includes('.m3u8') || value.includes('/hls') || value.includes('hlsurl') || value.includes('/live') || value.includes('liveurl');
}

function pickDeclaredLiveVideoUrl(urls: (string | null | undefined)[]) {
  return urls.find(isPlayableVideoUrl) || '';
}

function pickPlayableVideoUrl(urls: (string | null | undefined)[]) {
  return urls.find(isPlayableVideoUrl) || '';
}

function getPreviewCandidates(camera: Camera, preferredUrl?: string | null) {
  const snapshotCandidates = [preferredUrl, camera.snapshotUrl, camera.frameUrl, camera.previewUrl, camera.thumbnailUrl, cameraService.snapshotUrl(camera.id)];
  const streamCandidates = [camera.imageStreamUrl, camera.mjpegUrl, cameraService.imageStreamUrl(camera.id), camera.streamUrl];

  return [...snapshotCandidates, ...streamCandidates].filter(isImagePreviewUrl) as string[];
}

function extractNestedLiveCandidates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item: any) => {
    const candidates = [item?.hlsUrl, item?.hlsURL, item?.liveUrl, item?.liveURL, item?.url, item?.playbackUrl, item?.streamUrl];
    return candidates.filter((candidate): candidate is string => typeof candidate === 'string' && !!candidate.trim());
  });
}

function withRefreshParam(url: string, tick = 0) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_ts=${tick || Date.now()}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 18 },
  list: { paddingBottom: 100 },
  inlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inlineNoticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  selectUnitButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  selectUnitButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  cameraCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapshot: { width: '100%', height: '100%' },
  fullscreenHint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.56)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  fullscreenHintText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  noPreviewBox: { alignItems: 'center', paddingHorizontal: 22 },
  noPreviewText: { color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center' },
  noPreviewHint: { color: colors.textSubtle, fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  onlineBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.success,
    color: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '800',
  },
  offlineBadge: { backgroundColor: colors.danger, color: colors.white },
  modeBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    color: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },
  liveBadge: { backgroundColor: colors.danger },
  snapshotBadge: { backgroundColor: 'rgba(23, 32, 51, 0.72)' },
  cardInfo: { padding: 16 },
  cameraName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cameraLocation: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  cameraGroupPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 8,
  },
  cameraGroupText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  signalBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  helpTextArea: { flex: 1 },
  helpText: { color: colors.text, fontSize: 12, lineHeight: 18 },
  mediaHintText: { color: colors.textSubtle, fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 6 },
  streamStatusBox: {
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  streamText: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  lastCheckedText: { color: colors.textSubtle, fontSize: 11, fontWeight: '800', marginTop: 6 },
  cameraActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  streamButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  streamButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  emptyCameraBox: { flex: 1, alignItems: 'center' },
  supportButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    marginTop: -36,
  },
  supportButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  fullscreenContainer: { flex: 1, backgroundColor: colors.black },
  fullscreenTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  fullscreenTitleArea: { flex: 1 },
  fullscreenTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  fullscreenSubtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 12, marginTop: 3 },
  fullscreenCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenVideoArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fullscreenBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 34,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  fullscreenMode: { color: colors.white, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  fullscreenHintBottom: { color: 'rgba(255,255,255,0.72)', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
