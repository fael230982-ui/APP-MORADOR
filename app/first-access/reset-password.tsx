import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { passwordRecoveryService } from '../../services/passwordRecovery';
import { useAuthStore } from '../../store/useAuthStore';

export default function ResetPasswordScreen() {
  const sessionToken = useAuthStore((state) => state.token);
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const initialToken = useMemo(() => (typeof params.token === 'string' ? params.token : ''), [params.token]);
  const [resetToken, setResetToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (sessionToken) {
    return <Redirect href="/(tabs)" />;
  }

  const handleReset = async () => {
    if (!resetToken.trim()) {
      Alert.alert('Atencao', 'Cole o token que voce recebeu por e-mail.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atencao', 'A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atencao', 'As senhas nao coincidem.');
      return;
    }

    try {
      setLoading(true);
      const result = await passwordRecoveryService.resetPassword(resetToken.trim(), password);
      router.replace({
        pathname: '/first-access/success',
        params: {
          mode: 'password-reset',
          email: typeof params.email === 'string' ? params.email : '',
          message: result.message,
        },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.request
          ? 'Nao foi possivel conectar. Confira sua internet e tente novamente.'
          : 'Nao foi possivel redefinir a senha.');
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Definir nova senha</Text>
        <Text style={styles.subtitle}>
          Cole o token recebido por e-mail e defina a nova senha da sua conta.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Token de redefinicao</Text>
          <TextInput
            style={styles.input}
            placeholder="Cole aqui o token"
            placeholderTextColor={colors.textMuted}
            value={resetToken}
            onChangeText={setResetToken}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Nova senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Minimo de 6 caracteres"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Repita a nova senha"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <PrimaryButton title="Definir senha" onPress={handleReset} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginBottom: 40 },
  form: { marginBottom: 32 },
  label: { color: colors.text, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', opacity: 0.6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
});
