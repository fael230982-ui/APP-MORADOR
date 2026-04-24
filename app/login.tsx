import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DeveloperSignature from '../components/DeveloperSignature';
import { BRAND } from '../constants/brand';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { humanizeApiError } from '../utils/humanizeApiError';

function getLoginErrorMessage(err: any) {
  return humanizeApiError(err, {
    fallback: 'Não foi possível concluir o login agora.',
    invalidCredentials: 'Usuário ou senha inválidos.',
  });
}

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Atenção', 'Preencha todos os campos.');
    }

    try {
      await signIn({ email, password });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erro', getLoginErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandCard}>
          <Image source={BRAND.logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{BRAND.residentAccessTitle}</Text>
          <Text style={styles.subtitle}>Encomendas, alertas e câmeras da sua unidade em tempo real.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail ou usuário"
            placeholderTextColor={colors.textSubtle}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textSubtle}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Entrar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/first-access')}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={styles.legalLink}>Termos de Uso</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>•</Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.legalLink}>Privacidade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {!keyboardVisible ? (
        <View style={styles.developerBlock}>
          <DeveloperSignature />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  brandCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginBottom: 18,
    alignItems: 'center',
  },
  logo: { width: 92, height: 92, marginBottom: 18 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  form: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    height: 55,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  forgotButton: { alignItems: 'center', paddingTop: 14 },
  forgotText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
  },
  legalLink: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  legalDivider: { color: colors.textSubtle, fontSize: 12 },
  developerBlock: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
  },
});
