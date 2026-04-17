import api, { resolveApiUrl } from './api';
import { useAuthStore } from '../store/useAuthStore';
import type { Camera, CameraStatus } from '../types/camera';

export type CameraStreamingInfo = {
  provider: string;
  transport: string;
  snapshotUrl: string;
  frameUrl?: string | null;
  previewUrl?: string | null;
  imageStreamUrl: string;
  mjpegUrl?: string | null;
  vmsStreamingUrl?: string | null;
  streamUrl?: string | null;
  hlsUrl?: string | null;
  liveUrl?: string | null;
  webRtcUrl?: string | null;
  rtspUrl?: string | null;
  cameraUuid?: string | null;
  streams?: Record<string, unknown>[];
  preferredMedia?: Camera['preferredMedia'];
};

function normalizeStatus(value: unknown): CameraStatus {
  return String(value || '').toUpperCase() === 'ONLINE' ? 'online' : 'offline';
}

function getPreferredMedia(values: {
  webRtcUrl?: string | null;
  hlsUrl?: string | null;
  liveUrl?: string | null;
  imageStreamUrl?: string | null;
  mjpegUrl?: string | null;
  snapshotUrl?: string | null;
  thumbnailUrl?: string | null;
}): Camera['preferredMedia'] {
  if (values.webRtcUrl) return 'webRtcUrl';
  if (values.hlsUrl) return 'hlsUrl';
  if (values.liveUrl) return 'liveUrl';
  if (values.imageStreamUrl) return 'imageStreamUrl';
  if (values.mjpegUrl) return 'mjpegUrl';
  if (values.snapshotUrl) return 'snapshotUrl';
  if (values.thumbnailUrl) return 'thumbnailUrl';
  return null;
}

function getPreferredStillUrl(values: { snapshotUrl?: string | null; thumbnailUrl?: string | null }) {
  return values.snapshotUrl || values.thumbnailUrl || null;
}

function getPreferredLiveUrl(values: {
  webRtcUrl?: string | null;
  hlsUrl?: string | null;
  imageStreamUrl?: string | null;
  mjpegUrl?: string | null;
  liveUrl?: string | null;
  streamUrl?: string | null;
}) {
  return values.webRtcUrl || values.hlsUrl || values.imageStreamUrl || values.mjpegUrl || values.liveUrl || values.streamUrl || null;
}

function normalizeCamera(raw: any): Camera {
  const camera: Camera = {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? 'Camera'),
    location: raw?.location ?? raw?.description ?? raw?.unitName ?? 'Local nao informado',
    unitId: raw?.unitId ?? null,
    status: normalizeStatus(raw?.status),
    thumbnailUrl: resolveApiUrl(raw?.thumbnailUrl ?? raw?.snapshotUrl ?? null),
    snapshotUrl: resolveApiUrl(raw?.snapshotUrl ?? null),
    frameUrl: resolveApiUrl(raw?.frameUrl ?? null),
    previewUrl: resolveApiUrl(raw?.previewUrl ?? null),
    imageStreamUrl: resolveApiUrl(raw?.imageStreamUrl ?? raw?.mjpegUrl ?? null),
    mjpegUrl: resolveApiUrl(raw?.mjpegUrl ?? raw?.imageStreamUrl ?? null),
    hlsUrl: resolveApiUrl(raw?.hlsUrl ?? raw?.hlsURL ?? null),
    liveUrl: resolveApiUrl(raw?.liveUrl ?? raw?.liveURL ?? raw?.liveStreamUrl ?? null),
    webRtcUrl: resolveApiUrl(raw?.webRtcUrl ?? raw?.webrtcUrl ?? null),
    vmsStreamingUrl: resolveApiUrl(raw?.vmsStreamingUrl ?? null),
    streamUrl: resolveApiUrl(raw?.streamUrl ?? null),
    streamSourceType: raw?.streamSourceType ?? null,
    provider: raw?.provider ?? raw?.streamIntegrationVendor ?? null,
    transport: raw?.transport ?? raw?.streamSourceType ?? null,
    accessGroupIds: raw?.accessGroupIds ?? [],
    accessGroupNames: raw?.accessGroupNames ?? [],
    replayUrl: resolveApiUrl(raw?.replayUrl ?? null),
    replayExpiresAt: raw?.expiresAt ?? raw?.replayExpiresAt ?? null,
    mediaAuthType: raw?.mediaAuthType ?? 'USER_BEARER',
    mediaExpirationSupported: typeof raw?.mediaExpirationSupported === 'boolean' ? raw.mediaExpirationSupported : false,
  };

  return {
    ...camera,
    preferredStillUrl: getPreferredStillUrl(camera),
    preferredLiveUrl: getPreferredLiveUrl(camera),
    preferredMedia: getPreferredMedia(camera),
  };
}

async function getCamerasWithRetry(params?: Record<string, unknown>, skipSelectedUnit = false) {
  try {
    return await api.get('/api/v1/cameras', {
      params,
      headers: skipSelectedUnit ? { 'X-Skip-Selected-Unit': 'true' } : undefined,
    });
  } catch (err: any) {
    if (err?.response?.status === 403 && !skipSelectedUnit) {
      return api.get('/api/v1/cameras', {
        params,
        headers: { 'X-Skip-Selected-Unit': 'true' },
      });
    }

    throw err;
  }
}

function extractCameras(data: any): Camera[] {
  const items = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];
  return items.map(normalizeCamera).filter((camera: Camera) => camera.id);
}

function keepSelectedUnitCameras(cameras: Camera[], selectedUnitId?: string | null) {
  if (!selectedUnitId) return cameras;

  const camerasWithUnit = cameras.filter((camera) => camera.unitId);
  if (camerasWithUnit.length === 0) return cameras;

  return camerasWithUnit.filter((camera) => camera.unitId === selectedUnitId);
}

export const cameraService = {
  async getUnitCameras(): Promise<Camera[]> {
    const { selectedUnitId } = useAuthStore.getState();
    const attempts = [
      { source: 'unitId', params: { unitId: selectedUnitId || undefined }, skipSelectedUnit: false },
      { source: 'auth-scope', params: undefined, skipSelectedUnit: false },
      { source: 'auth-scope-no-selected-header', params: undefined, skipSelectedUnit: true },
      { source: 'unitId-no-selected-header', params: { unitId: selectedUnitId || undefined }, skipSelectedUnit: true },
    ];

    let lastCameras: Camera[] = [];

    for (const attempt of attempts) {
      if (!selectedUnitId && attempt.source !== 'auth-scope') continue;

      let rawCameras: Camera[] = [];
      let cameras: Camera[] = [];

      try {
        const response = await getCamerasWithRetry(attempt.params, attempt.skipSelectedUnit);
        rawCameras = extractCameras(response.data);
        cameras = keepSelectedUnitCameras(rawCameras, selectedUnitId);
      } catch (err: any) {
        console.log(
          `[cameras] erro via ${attempt.source}: status=${err?.response?.status || 'sem-status'} message=${
            err?.response?.data?.message || err?.message || 'sem-mensagem'
          } selectedUnitId=${selectedUnitId || 'none'}`
        );
        throw err;
      }

      lastCameras = cameras;

      console.log(`[cameras] ${cameras.length} item(ns) via ${attempt.source}; raw=${rawCameras.length}`);

      if (cameras.length > 0) {
        return cameras;
      }
    }

    console.log(`[cameras] 0 itens. selectedUnitId=${selectedUnitId || 'none'}`);
    return lastCameras;
  },

  async getStreaming(cameraId: string): Promise<CameraStreamingInfo> {
    const response = await api.get(`/api/v1/cameras/${cameraId}/streaming`);
    const streaming = {
      ...response.data,
      snapshotUrl: resolveApiUrl(response.data?.snapshotUrl) || '',
      frameUrl: resolveApiUrl(response.data?.frameUrl),
      previewUrl: resolveApiUrl(response.data?.previewUrl),
      imageStreamUrl: resolveApiUrl(response.data?.imageStreamUrl ?? response.data?.mjpegUrl) || '',
      mjpegUrl: resolveApiUrl(response.data?.mjpegUrl ?? response.data?.imageStreamUrl),
      vmsStreamingUrl: resolveApiUrl(response.data?.vmsStreamingUrl),
      streamUrl: resolveApiUrl(response.data?.streamUrl),
      hlsUrl: resolveApiUrl(response.data?.hlsUrl ?? response.data?.hlsURL),
      liveUrl: resolveApiUrl(response.data?.liveUrl ?? response.data?.liveURL ?? response.data?.liveStreamUrl),
      webRtcUrl: resolveApiUrl(response.data?.webRtcUrl ?? response.data?.webrtcUrl),
      rtspUrl: response.data?.rtspUrl ?? null,
    };

    return {
      ...streaming,
      preferredStillUrl: getPreferredStillUrl(streaming),
      preferredLiveUrl: getPreferredLiveUrl(streaming),
      replayUrl: resolveApiUrl(response.data?.replayUrl ?? null),
      replayExpiresAt: response.data?.expiresAt ?? response.data?.replayExpiresAt ?? null,
      mediaAuthType: response.data?.mediaAuthType ?? 'USER_BEARER',
      mediaExpirationSupported:
        typeof response.data?.mediaExpirationSupported === 'boolean' ? response.data.mediaExpirationSupported : false,
      preferredMedia: getPreferredMedia(streaming),
    };
  },

  snapshotUrl(cameraId: string, width = 640, height = 360) {
    return resolveApiUrl(`/api/v1/cameras/${cameraId}/snapshot?width=${width}&height=${height}`) || '';
  },

  imageStreamUrl(cameraId: string, width = 640, height = 360) {
    return resolveApiUrl(`/api/v1/cameras/${cameraId}/image-stream?width=${width}&height=${height}&intervalMs=1000`) || '';
  },
};
