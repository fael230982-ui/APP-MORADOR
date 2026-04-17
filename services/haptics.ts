import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const hapticFeedback = {
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      // Tenta o estilo moderno, se falhar tenta o legado
      if (Haptics.ImpactFeedbackStyle) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.impactAsync('light' as any);
      }
    } catch (e) {
      console.log('Haptic Light falhou');
    }
  },

  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('Haptic Success falhou');
    }
  },

  error: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      console.log('Haptic Error falhou');
    }
  }
};