import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { facialService } from '../services/facialService';
import { facialStatusService } from '../services/facialStatus';
import { photoUploadService } from '../services/photoUpload';
import { residentProfileService } from '../services/residentProfile';
import { useAuthStore } from '../store/useAuthStore';

type PhotoSource = 'camera' | 'library';

export type ResidentPhotoUpdateResult = {
  photoUri: string;
  facialSyncStatus: 'PENDING_PROCESSING' | 'NOT_REGISTERED';
};

export type ResidentPhotoError = Error & {
  code?: string;
  uploadedPhotoUrl?: string;
  cause?: unknown;
};

function createError(message: string, code?: string, extra?: Partial<ResidentPhotoError>) {
  const error = new Error(message) as ResidentPhotoError;
  error.code = code;
  Object.assign(error, extra);
  return error;
}

async function requestPermission(source: PhotoSource) {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Precisamos da camera para registrar sua foto.');
      return false;
    }
    return true;
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permissao necessaria', 'Precisamos da galeria para selecionar sua foto.');
    return false;
  }
  return true;
}

export function useResidentPhoto() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [uploading, setUploading] = useState(false);

  async function openPicker(source: PhotoSource) {
    const granted = await requestPermission(source);
    if (!granted) return null;

    if (source === 'camera') {
      return ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        base64: true,
        cameraType: ImagePicker.CameraType.front,
      });
    }

    return ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });
  }

  async function updateResidentPhoto(source: PhotoSource): Promise<ResidentPhotoUpdateResult | null> {
    setUploading(true);

    try {
      const result = await openPicker(source);
      if (!result || result.canceled || !result.assets?.length) {
        return null;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        throw createError('Nao foi possivel preparar a imagem para envio.', 'PHOTO_READ_FAILED');
      }

      const upload = await photoUploadService.uploadPhoto({
        photoBase64: asset.base64,
        fileName: asset.fileName ?? `morador-${Date.now()}.jpg`,
      });

      let updatedProfile;
      try {
        updatedProfile = await residentProfileService.updateProfile({
          photoUrl: upload.photoUrl,
        });
      } catch (error) {
        throw createError('Nao foi possivel vincular a foto ao perfil.', 'PROFILE_UPDATE_FAILED_AFTER_UPLOAD', {
          uploadedPhotoUrl: upload.photoUrl,
          cause: error,
        });
      }

      updateUser(updatedProfile);

      let facialSyncStatus: ResidentPhotoUpdateResult['facialSyncStatus'] = 'NOT_REGISTERED';
      let backendState: 'PHOTO_ONLY' | 'FACE_PENDING_SYNC' = 'PHOTO_ONLY';
      const personId = updatedProfile.personId ?? user?.personId;

      if (personId) {
        try {
          await facialService.registerTemplate({
            personId,
            photoUrl: upload.photoUrl,
          });
          facialSyncStatus = 'PENDING_PROCESSING';
          backendState = 'FACE_PENDING_SYNC';
        } catch {
          facialSyncStatus = 'PENDING_PROCESSING';
          backendState = 'FACE_PENDING_SYNC';
        }
      }

      await facialStatusService.save({
        state: facialSyncStatus,
        backendState,
        updatedAt: new Date().toISOString(),
        photoUri: updatedProfile.photoUri ?? upload.photoUrl,
      });

      return {
        photoUri: updatedProfile.photoUri ?? upload.photoUrl,
        facialSyncStatus,
      };
    } finally {
      setUploading(false);
    }
  }

  return {
    uploading,
    takePhoto: () => updateResidentPhoto('camera'),
    pickPhoto: () => updateResidentPhoto('library'),
  };
}
