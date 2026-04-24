import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AuthenticatedImage from '../../components/AuthenticatedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { colors } from '../../constants/colors';
import { deliveriesService } from '../../services/deliveries';
import {
  getCanonicalWithdrawalCode,
  getCanonicalWithdrawalQrCodeUrl,
  getDeliveryStatusLabel,
  isDeliveryPending,
  type Delivery,
} from '../../types/delivery';

function statusType(status: Delivery['status']) {
  if (status === 'WITHDRAWN') return 'success';
  if (status === 'READY_FOR_WITHDRAWAL') return 'success';
  if (status === 'NOTIFIED') return 'info';
  return 'warning';
}

function formatDate(value?: string | null) {
  if (!value) return 'Nao informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Nao informado'}</Text>
    </View>
  );
}

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [withdrawalCodeInput, setWithdrawalCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const withdrawalCode = useMemo(() => getCanonicalWithdrawalCode(delivery), [delivery]);
  const withdrawalQrCodeUrl = useMemo(() => getCanonicalWithdrawalQrCodeUrl(delivery), [delivery]);

  const loadDelivery = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await deliveriesService.getResidentDelivery(String(id));
      setDelivery(result);
      setWithdrawalCodeInput(getCanonicalWithdrawalCode(result) || '');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Esta encomenda nao pertence a sua unidade.');
      } else if (err?.response?.status === 404) {
        setError('Nao encontramos os detalhes desta encomenda.');
      } else {
        setError('Nao foi possivel carregar esta encomenda agora.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  async function handleValidateWithdrawal() {
    if (!delivery) return;

    const code = withdrawalCodeInput.trim();
    if (!code) {
      Alert.alert('Codigo obrigatorio', 'Informe o codigo de retirada para validar.');
      return;
    }

    try {
      setValidating(true);
      const updatedDelivery = await deliveriesService.validateWithdrawal(delivery.id, code);
      if (updatedDelivery) {
        setDelivery((current) => ({ ...current, ...updatedDelivery } as Delivery));
      } else {
        await loadDelivery();
      }
      Alert.alert('Retirada validada', 'A retirada foi confirmada.');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel validar a retirada agora.';
      Alert.alert('Validacao nao concluida', String(message));
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Encomenda" showBack />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Carregando encomenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !delivery) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Encomenda" showBack />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || 'Encomenda nao encontrada.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Encomenda" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="cube-outline" size={30} color={colors.warning} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.title}>{delivery.deliveryCompany || 'Transportadora nao informada'}</Text>
              <Text style={styles.subtitle}>{delivery.trackingCode || 'Codigo de rastreio nao informado'}</Text>
            </View>
          </View>
          <StatusBadge label={getDeliveryStatusLabel(delivery.status)} type={statusType(delivery.status)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da encomenda</Text>
          <DetailRow label="Unidade" value={delivery.unitName || 'Unidade ativa'} />
          <DetailRow label="Destinatario" value={delivery.recipientPersonName} />
          <DetailRow label="Recebida em" value={formatDate(delivery.receivedAt)} />
          <DetailRow label="Recebida por" value={delivery.receivedByName || delivery.receivedBy} />
          {(delivery.performedAt || delivery.clientType || delivery.deviceName) ? (
            <>
              <DetailRow label="Registro operacional" value={formatDate(delivery.performedAt)} />
              <DetailRow label="Origem do cliente" value={delivery.clientType} />
              <DetailRow label="Dispositivo" value={delivery.deviceName} />
            </>
          ) : null}
          {delivery.status === 'WITHDRAWN' ? (
            <>
              <DetailRow label="Retirada em" value={formatDate(delivery.withdrawalValidatedAt || delivery.withdrawnAt)} />
              <DetailRow label="Retirada por" value={delivery.withdrawnByName || delivery.withdrawnBy} />
            </>
          ) : null}
          {delivery.notificationSentAt ? (
            <DetailRow label="Aviso enviado" value={formatDate(delivery.notificationSentAt)} />
          ) : (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>A encomenda ja esta disponivel para consulta no app do morador.</Text>
            </View>
          )}

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Retirada</Text>

          {delivery.withdrawalValidatedAt || delivery.withdrawnAt ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              <View style={styles.successTextArea}>
                <Text style={styles.successTitle}>Retirada validada</Text>
                <Text style={styles.successText}>
                  {formatDate(delivery.withdrawalValidatedAt || delivery.withdrawnAt)}
                  {delivery.withdrawnByName || delivery.withdrawnBy ? ` por ${delivery.withdrawnByName || delivery.withdrawnBy}` : ''}
                </Text>
              </View>
            </View>
          ) : null}

          {withdrawalCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Codigo para retirada</Text>
              <Text style={styles.codeValue}>{withdrawalCode}</Text>
            </View>
          ) : (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>Codigo de retirada ainda nao disponivel.</Text>
            </View>
          )}

          {withdrawalQrCodeUrl ? (
            <View style={styles.qrBox}>
              <AuthenticatedImage
                uri={withdrawalQrCodeUrl}
                style={styles.qrImage}
                contentFit="contain"
                fallbackTitle="QR Code indisponivel"
                fallbackSubtitle="O codigo continua valendo, mas a imagem do QR nao foi carregada."
                diagnosticSource={`deliveries.qr.${delivery.id}`}
              />
              <Text style={styles.qrText}>Apresente este QR Code na portaria.</Text>
            </View>
          ) : (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>QR Code ainda nao disponivel.</Text>
            </View>
          )}

          {isDeliveryPending(delivery.status) ? (
            <View style={styles.validationBox}>
              <Text style={styles.validationTitle}>Validar retirada</Text>
              <Text style={styles.validationHint}>Use o codigo informado pela portaria ou recebido com a encomenda.</Text>
              <TextInput
                value={withdrawalCodeInput}
                onChangeText={setWithdrawalCodeInput}
                placeholder="Codigo de retirada"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={styles.input}
              />
              <PrimaryButton
                title="Confirmar codigo"
                loading={validating}
                onPress={handleValidateWithdrawal}
                disabled={!withdrawalCodeInput.trim()}
              />
            </View>
          ) : null}
        </View>

        {delivery.photoUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagem da encomenda</Text>
            <AuthenticatedImage
              uri={delivery.photoUrl}
              style={styles.photo}
              fallbackTitle="Imagem da encomenda indisponivel"
              fallbackSubtitle="O cadastro da encomenda existe, mas a foto publicada nao esta acessivel agora."
              diagnosticSource={`deliveries.photo.${delivery.id}`}
            />
          </View>
        ) : null}

        {delivery.evidenceUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagem complementar</Text>
            <AuthenticatedImage
              uri={delivery.evidenceUrl}
              style={styles.photo}
              fallbackTitle="Imagem complementar indisponivel"
              fallbackSubtitle="A evidencia operacional nao foi carregada neste momento."
              diagnosticSource={`deliveries.evidence.${delivery.id}`}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  errorBox: {
    margin: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 8,
    padding: 16,
  },
  errorText: { color: colors.text, lineHeight: 20 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    gap: 16,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1 },
  title: { color: colors.text, fontSize: 20, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginBottom: 12 },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  noticeBox: {
    marginTop: 8,
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 12,
  },
  noticeText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  successBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successTextArea: { flex: 1 },
  successTitle: { color: colors.success, fontSize: 14, fontWeight: '900' },
  successText: { color: colors.text, fontSize: 13, lineHeight: 18, marginTop: 4 },
  codeBox: {
    alignItems: 'center',
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  codeLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  codeValue: { color: colors.text, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  qrBox: {
    alignItems: 'center',
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  qrImage: { width: 180, height: 180, marginBottom: 10 },
  qrText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  validationBox: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  validationTitle: { color: colors.text, fontSize: 14, fontWeight: '900', marginBottom: 4 },
  validationHint: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
  },
});
