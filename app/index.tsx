import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

export default function IndexScreen() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
