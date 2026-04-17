import { Stack, router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatureLockedState from '../../components/FeatureLockedState';
import { colors } from '../../constants/colors';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';

export default function DeliveriesLayout() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const deliveriesEnabled = isResidentFeatureEnabled(residentAppConfig, 'deliveries');

  if (!deliveriesEnabled) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <FeatureLockedState
          icon="cube-outline"
          title="Encomendas indisponiveis"
          description="Este condominio nao habilitou o modulo de encomendas para o app do morador."
          actionLabel="Voltar para o inicio"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
