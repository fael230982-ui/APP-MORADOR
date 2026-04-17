import api, { resolveApiUrl } from './api';

type PhotoUploadPayload = {
  photoBase64: string;
  fileName?: string;
};

type PhotoUploadResponse = {
  photoUrl: string;
};

export const photoUploadService = {
  async uploadPhoto(payload: PhotoUploadPayload): Promise<PhotoUploadResponse> {
    const response = await api.post('/api/v1/people/photo/upload', payload);
    return {
      photoUrl: resolveApiUrl(response.data?.photoUrl) ?? response.data?.photoUrl,
    };
  },
};
