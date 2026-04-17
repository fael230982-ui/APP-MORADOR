import { Stack, router, useSegments } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatureLockedState from '../../components/FeatureLockedState';
import { colors } from '../../constants/colors';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';

export default function PeopleLayout() {
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const segments = useSegments();
  const currentRoute = typeof segments[1] === 'string' ? segments[1] : '';
  const feature = currentRoute === 'vehicles' ? 'vehicles' : 'access';
  const enabled = isResidentFeatureEnabled(residentAppConfig, feature);

  if (!enabled) {
    const isVehiclesRoute = feature === 'vehicles';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <FeatureLockedState
          icon={isVehiclesRoute ? 'car-outline' : 'lock-closed-outline'}
          title={isVehiclesRoute ? 'Veiculos indisponiveis' : 'Acessos indisponiveis'}
          description={
            isVehiclesRoute
              ? 'Este condominio nao habilitou a gestao de veiculos para o app do morador.'
              : 'O controle de acesso desta unidade nao foi habilitado para esta conta ou para este condominio.'
          }
          actionLabel="Voltar para o inicio"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
