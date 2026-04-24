import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { facialService } from '../services/facialService';
import { facialStatusService } from '../services/facialStatus';
import { photoUploadService } from '../services/photoUpload';
import { residentProfileService } from '../services/residentProfile';
import { residentProfileDraftService } from '../services/residentProfileDraft';
import { useAuthStore } from '../store/useAuthStore';

type PhotoSource = 'camera' | 'library';

export type ResidentPhotoUpdateResult = {
  photoUri: string;
  localPhotoUri?: string | null;
  localPhotoDataUri?: string | null;
  facialSyncStatus: 'PENDING_PROCESSING' | 'NOT_REGISTERED';
};

export type ResidentPhotoError = Error & {
  code?: string;
  uploadedPhotoUrl?: string;
  cause?: unknown;
};

type PickerResult = {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    base64?: string | null;
    fileName?: string | null;
  }>;
};

function createError(message: string, code?: string, extra?: Partial<ResidentPhotoError>) {
  const error = new Error(message) as ResidentPhotoError;
  error.code = code;
  Object.assign(error, extra);
  return error;
}

function isIosExpoGo() {
  return Platform.OS === 'ios' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

async function requestPermission(source: PhotoSource) {
  if (source === 'library' && isIosExpoGo()) {
    Alert.alert(
      'Galeria indisponivel neste ambiente',
      'No iPhone com Expo Go, escolher foto pela galeria pode falhar nesta experiencia. Use "Tirar foto" ou teste uma build nativa.'
    );
    return false;
  }

  if (source === 'camera') {
    const currentPermission = await ImagePicker.getCameraPermissionsAsync();
    const permission = currentPermission.granted ? currentPermission : await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Precisamos da camera para registrar sua foto.');
      return false;
    }
    return true;
  }

  const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permissao necessaria', 'Precisamos da galeria para selecionar sua foto.');
    return false;
  }
  return true;
}

async function openLibraryFallback() {
  const fallbackResult = await DocumentPicker.getDocumentAsync({
    type: 'image/*',
    copyToCacheDirectory: true,
    multiple: false,
    base64: true,
  });

  if (fallbackResult.canceled) {
    return { canceled: true, assets: [] } as PickerResult;
  }

  const asset = fallbackResult.assets?.[0];
  if (!asset) {
    return { canceled: true, assets: [] } as PickerResult;
  }

  return {
    canceled: false,
    assets: [
      {
        uri: asset.uri,
        base64: asset.base64 ?? null,
        fileName: asset.name ?? null,
      },
    ],
  } as PickerResult;
}

export function useResidentPhoto() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [uploading, setUploading] = useState(false);

  async function openPicker(source: PhotoSource) {
    const granted = await requestPermission(source);
    if (!granted) return null;

    try {
      if (source === 'camera') {
        return await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.85,
          base64: true,
          cameraType: ImagePicker.CameraType.front,
        });
      }

      return await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });
    } catch (error) {
      if (source === 'library' && !isIosExpoGo()) {
        try {
          return await openLibraryFallback();
        } catch (fallbackError) {
          throw createError('Nao foi possivel abrir a galeria neste momento.', 'PHOTO_PICKER_PERMISSION_ERROR', {
            cause: fallbackError,
          });
        }
      }

      throw createError('Nao foi possivel abrir camera ou galeria neste momento.', 'PHOTO_PICKER_PERMISSION_ERROR', {
        cause: error,
      });
    }
  }

  async function updateResidentPhoto(source: PhotoSource): Promise<ResidentPhotoUpdateResult | null> {
    setUploading(true);

    try {
      const result = await openPicker(source);
      if (!result || result.canceled || !result.assets?.length) {
        return null;
      }

      const asset = result.assets[0];
      const preparedImage = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 512 } }],
        { compress: 0.72, format: SaveFormat.JPEG, base64: true }
      ).catch(() => null);

      const uploadBase64 = preparedImage?.base64 ?? asset.base64 ?? null;
      const localPhotoUri = preparedImage?.uri ?? asset.uri ?? null;
      const localPhotoDataUri = uploadBase64 ? `data:image/jpeg;base64,${uploadBase64}` : null;

      if (!uploadBase64) {
        throw createError('Nao foi possivel preparar a imagem para envio.', 'PHOTO_READ_FAILED');
      }

      const upload = await photoUploadService.uploadPhoto({
        photoBase64: uploadBase64,
        fileName: asset.fileName ?? `morador-${Date.now()}.jpg`,
      });

      let updatedProfile;
      try {
        updatedProfile = await residentProfileService.updateProfile({
          photoUrl: upload.photoUrl,
        });
      } catch {
        const fallbackProfile = {
          ...user,
          photoUri: upload.photoUrl,
        };

        if (fallbackProfile) {
          updateUser(fallbackProfile);
        }

        await facialStatusService.save({
          state: 'NOT_REGISTERED',
          backendState: 'PHOTO_ONLY',
          updatedAt: new Date().toISOString(),
          photoUri: upload.photoUrl,
          localPhotoUri,
          localPhotoDataUri,
        });
        await residentProfileDraftService.save({
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          photoUri: upload.photoUrl,
        }).catch(() => undefined);

        return {
          photoUri: upload.photoUrl,
          localPhotoUri,
          localPhotoDataUri,
          facialSyncStatus: 'NOT_REGISTERED',
        };
      }

      const profileWithPhoto = {
        ...user,
        ...updatedProfile,
        photoUri: updatedProfile.photoUri ?? upload.photoUrl,
      };

      updateUser(profileWithPhoto);

      let facialSyncStatus: ResidentPhotoUpdateResult['facialSyncStatus'] = 'NOT_REGISTERED';
      let backendState: 'PHOTO_ONLY' | 'FACE_PENDING_SYNC' = 'PHOTO_ONLY';
      const personId = profileWithPhoto.personId ?? user?.personId;

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
        photoUri: profileWithPhoto.photoUri ?? upload.photoUrl,
        localPhotoUri,
        localPhotoDataUri,
      });
      await residentProfileDraftService.save({
        name: profileWithPhoto.name,
        email: profileWithPhoto.email,
        phone: profileWithPhoto.phone,
        photoUri: profileWithPhoto.photoUri ?? upload.photoUrl,
      }).catch(() => undefined);

      return {
        photoUri: profileWithPhoto.photoUri ?? upload.photoUrl,
        localPhotoUri,
        localPhotoDataUri,
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
    isIosExpoGo,
  };
}
