import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { passwordRecoveryService } from '../../services/passwordRecovery';
import { useAuthStore } from '../../store/useAuthStore';

export default function PasswordRecoveryRequestScreen() {
  const token = useAuthStore((state) => state.token);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  const handleContinue = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Atencao', 'Informe o e-mail da sua conta.');
      return;
    }

    try {
      setLoading(true);
      const result = await passwordRecoveryService.requestReset(normalizedEmail);
      Alert.alert('Confira seu e-mail', result.message);
      router.push({ pathname: '/first-access/reset-password', params: { email: normalizedEmail } });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error?.request
          ? 'Nao foi possivel conectar. Confira sua internet e tente novamente.'
          : 'Nao foi possivel solicitar a redefinicao agora.');
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Informe o e-mail da sua conta para receber o token de redefinicao.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <PrimaryButton title="Enviar token" onPress={handleContinue} loading={loading} />
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
