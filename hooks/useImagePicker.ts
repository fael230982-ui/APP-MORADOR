import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useImagePicker() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da permissão da câmera para tirar a foto.'
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da permissão da galeria para selecionar a foto.'
      );
      return false;
    }
    return true;
  };

  const compressImage = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      return uri;
    }
  };

  const takePhoto = async (useFrontCamera = false) => {
    try {
      setLoading(true);
      const granted = await requestCameraPermission();
      if (!granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        cameraType: useFrontCamera ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const compressedUri = await compressImage(result.assets[0].uri);
        setImage(compressedUri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      const granted = await requestMediaLibraryPermission();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const compressedUri = await compressImage(result.assets[0].uri);
        setImage(compressedUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
  };

  return {
    image,
    setImage,
    loading,
    takePhoto,
    pickImage,
    clearImage,
  };
}
