import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { hapticFeedback } from '../../services/haptics';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { hapticFeedback.light(); router.back(); }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdate}>Ultima atualizacao: 12 de abril de 2026</Text>

        <Text style={styles.sectionTitle}>1. Uso do aplicativo</Text>
        <Text style={styles.text}>
          O app do morador permite acompanhar encomendas, visitas, mensagens, alertas, cameras e dados da propria unidade.
          O acesso deve ser usado apenas pelo titular da conta ou por pessoa autorizada pela administracao responsavel.
        </Text>

        <Text style={styles.sectionTitle}>2. Dados tratados</Text>
        <Text style={styles.text}>
          O funcionamento do aplicativo envolve dados cadastrais, dados de acesso, notificacoes operacionais e, quando
          habilitado, biometria facial para apoio a identificacao automatizada.
        </Text>

        <Text style={styles.sectionTitle}>3. Responsabilidade do usuario</Text>
        <Text style={styles.text}>
          O morador e responsavel pela veracidade dos dados que informar em acessos previstos, visitantes, prestadores,
          locatarios e solicitacoes feitas pelo proprio aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>4. Seguranca e operacao</Text>
        <Text style={styles.text}>
          O sistema pode enviar notificacoes de encomendas, visitas, mensagens e alertas relacionados a unidade. Parte
          dessas informacoes pode depender de integracoes entre app, portaria, guarita e backend.
        </Text>

        <Text style={styles.sectionTitle}>5. Leitura complementar</Text>
        <Text style={styles.text}>
          Este termo deve ser lido em conjunto com a Politica de Privacidade e com as orientacoes operacionais do
          condominio ou empreendimento em que a conta estiver vinculada.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  content: { padding: 24 },
  lastUpdate: { color: colors.textMuted, fontSize: 12, marginBottom: 20 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 24 },
});
