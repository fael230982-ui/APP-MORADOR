import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { hapticFeedback } from '../../services/haptics';
import { useAuthStore } from '../../store/useAuthStore';

export default function SuccessScreen() {
  const token = useAuthStore((state) => state.token);
  const params = useLocalSearchParams<{ mode?: string; message?: string }>();

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  const isPasswordReset = params.mode === 'password-reset';

  const handleFinish = () => {
    hapticFeedback.light();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-done-circle" size={100} color={colors.success} />
        </View>

        <Text style={styles.title}>{isPasswordReset ? 'Senha atualizada' : 'Tudo pronto'}</Text>
        <Text style={styles.subtitle}>
          {isPasswordReset
            ? 'Sua senha foi redefinida. Agora voce ja pode entrar no app com a nova senha.'
            : 'Sua conta foi ativada e sua biometria facial foi cadastrada com sucesso.'}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {typeof params.message === 'string' && params.message.trim()
              ? params.message
              : 'Agora voce ja pode monitorar suas cameras e gerenciar seus acessos em tempo real.'}
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton title={isPasswordReset ? 'Voltar ao login' : 'Entrar no app'} onPress={handleFinish} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconContainer: { marginBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: colors.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  infoBox: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  infoText: { color: colors.text, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footer: { width: '100%' },
});
