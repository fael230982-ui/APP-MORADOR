import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BRAND } from '../constants/brand';
import { colors } from '../constants/colors';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function NotificationPermissionModal({ visible, onAccept, onDecline }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Ativar alertas de seguranca?</Text>
            <Text style={styles.description}>
              Para sua protecao, o {BRAND.appName} precisa enviar notificacoes em tempo real sobre eventos relevantes da
              sua unidade.
            </Text>

            <PrimaryButton title="Permitir notificacoes" onPress={onAccept} />

            <TouchableOpacity style={styles.maybeLater} onPress={onDecline}>
              <Text style={styles.maybeLaterText}>Agora nao</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  container: { alignItems: 'center' },
  card: {
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  description: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  maybeLater: { marginTop: 16, padding: 8 },
  maybeLaterText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
