import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import UnitSelectionModal from '../../components/UnitSelectionModal';
import { colors } from '../../constants/colors';
import { isResidentFeatureEnabled } from '../../services/residentFeatureAccess';
import { useAuthStore } from '../../store/useAuthStore';

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const residentAppConfig = useAuthStore((state) => state.residentAppConfig);
  const requiresUnitSelection = !!user?.requiresUnitSelection && !selectedUnitId;
  const slimMode = residentAppConfig?.slimMode === true;
  const camerasEnabled = isResidentFeatureEnabled(residentAppConfig, 'cameras');
  const accessEnabled = isResidentFeatureEnabled(residentAppConfig, 'access');

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            left: 18,
            right: 18,
            bottom: 14,
            backgroundColor: colors.nav,
            borderTopColor: 'transparent',
            height: 64,
            paddingBottom: 9,
            paddingTop: 8,
            borderRadius: 8,
            elevation: 12,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.16,
            shadowRadius: 24,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSubtle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alertas',
            tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="people"
          options={{
            href: accessEnabled && !slimMode ? undefined : null,
            title: 'Acessos',
            tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="cameras"
          options={{
            href: camerasEnabled && !slimMode ? undefined : null,
            title: 'Câmeras',
            tabBarIcon: ({ color }) => <Ionicons name="videocam-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="deliveries"
          options={{
            href: null,
            title: 'Encomendas',
            tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
      <UnitSelectionModal visible={requiresUnitSelection} locked />
    </>
  );
}
