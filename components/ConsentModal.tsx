import { router } from 'expo-router';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { hapticFeedback } from '../services/haptics';
import PrimaryButton from './PrimaryButton';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export default function ConsentModal({ visible, onAccept }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Privacidade e uso de dados</Text>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.text}>
            Para usar o app, tratamos dados da conta, notificações, acessos e biometria facial quando você optar por esse
            recurso.
          </Text>

          <View style={styles.list}>
            <Text style={styles.item}>
              <Text style={styles.bold}>Biometria facial:</Text> usada para identificação automatizada nos fluxos de acesso,
              quando habilitada.
            </Text>
            <Text style={styles.item}>
              <Text style={styles.bold}>Notificações e acessos:</Text> usados para encomendas, visitas, alertas e histórico
              operacional.
            </Text>
            <Text style={styles.item}>
              <Text style={styles.bold}>Minimização:</Text> documentos e telefones passam a ser exibidos de forma parcial quando o
              detalhe completo não for essencial.
            </Text>
          </View>

          <Text style={styles.text}>
            Ao continuar, você declara ciência dos Termos de Uso e da Política de Privacidade vigentes nesta versão do app.
          </Text>

          <View style={styles.links}>
            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/legal/terms')}>
              <Text style={styles.linkText}>Ler Termos de Uso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.linkText}>Ler Política de Privacidade</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            title="Concordar e continuar"
            onPress={() => {
              hapticFeedback.success();
              onAccept();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 20 },
  content: { flex: 1 },
  text: { color: colors.textMuted, fontSize: 16, lineHeight: 26, marginBottom: 18, textAlign: 'justify' },
  list: { gap: 12, marginBottom: 18 },
  item: { color: colors.textMuted, fontSize: 16, lineHeight: 24, textAlign: 'justify' },
  bold: { color: colors.text, fontWeight: '700' },
  links: { gap: 12, marginTop: 4 },
  linkButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  footer: { paddingTop: 20, paddingBottom: 20 },
});
