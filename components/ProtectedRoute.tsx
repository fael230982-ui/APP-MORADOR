import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { hasPermission } from '../utils/permissionsManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Sua sessão não está ativa.</Text>
        </View>
    );
  }

  if (!hasPermission(user.role, requiredPermission)) {
    return (
      fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>Acesso negado</Text>
          <Text style={{ color: colors.textMuted, marginTop: 8 }}>
            Esta área não está disponível para a sua conta.
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}
