import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function FaceRegister() {
  const token = useAuthStore((state) => state.token);
  const [captured, setCaptured] = useState(false);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Biometria facial</Text>
        <Text style={styles.subtitle}>Posicione seu rosto no centro do círculo para concluir o cadastro.</Text>

        <View style={styles.cameraContainer}>
          <View style={[styles.faceOval, captured && styles.faceOvalSuccess]}>
            <Ionicons
              name={captured ? 'checkmark-circle' : 'person-outline'}
              size={80}
              color={captured ? colors.success : colors.border}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {!captured ? (
            <TouchableOpacity style={styles.captureBtn} onPress={() => setCaptured(true)}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          ) : (
            <PrimaryButton title="Finalizar cadastro" onPress={() => router.push('/first-access/success')} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 40 },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  faceOval: {
    width: 280,
    height: 380,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  faceOvalSuccess: { borderStyle: 'solid', borderColor: colors.success, backgroundColor: colors.cardSoft },
  footer: { width: '100%', paddingBottom: 20 },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: colors.white,
    padding: 4,
    alignSelf: 'center',
  },
  captureInner: { flex: 1, backgroundColor: colors.white, borderRadius: 30 },
});
