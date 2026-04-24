import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

type Props = {
  visible: boolean;
  onClose?: () => void;
  locked?: boolean;
};

export default function UnitSelectionModal({ visible, onClose, locked = false }: Props) {
  const { user, selectedUnitId, preferredUnitId, selectUnit, setPreferredUnit, logout } = useAuthStore();
  const unitIds = user?.unitIds ?? [];
  const unitNames = user?.unitNames ?? [];

  const units = unitIds.map((id, index) => ({
    id,
    name: unitNames[index] || `Unidade ${index + 1}`,
  }));

  function handleSelect(unitId: string, unitName: string) {
    selectUnit(unitId, unitName);
    onClose?.();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={locked ? undefined : onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Escolha sua unidade</Text>
              <Text style={styles.subtitle}>Selecione qual unidade você quer acompanhar agora.</Text>
            </View>

            {!locked && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {units.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Nenhuma unidade foi encontrada para sua conta. Fale com o suporte para revisar seu vínculo.
              </Text>
              {locked ? (
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                  <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            units.map((unit) => {
              const active = unit.id === selectedUnitId;
              const preferred = unit.id === preferredUnitId;
              return (
                <View key={unit.id} style={[styles.unitButton, active && styles.unitButtonActive]}>
                  <TouchableOpacity style={styles.unitMainArea} activeOpacity={0.85} onPress={() => handleSelect(unit.id, unit.name)}>
                    <View>
                      <Text style={styles.unitName}>{unit.name}</Text>
                      <Text style={styles.unitId}>
                        {active ? 'Unidade em uso' : 'Toque para usar esta unidade'}
                      </Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={24} color={colors.success} />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.preferredButton, preferred && styles.preferredButtonActive]}
                    activeOpacity={0.85}
                    onPress={() => setPreferredUnit(preferred ? null : unit.id)}
                  >
                    <Ionicons
                      name={preferred ? 'star' : 'star-outline'}
                      size={16}
                      color={preferred ? colors.white : colors.primary}
                    />
                    <Text style={[styles.preferredText, preferred && styles.preferredTextActive]}>
                      {preferred ? 'Unidade padrão' : 'Definir como padrão'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  unitButton: {
    backgroundColor: colors.cardSoft,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  unitButtonActive: {
    borderColor: colors.success,
  },
  unitMainArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  unitName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  unitId: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  preferredButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  preferredButtonActive: {
    backgroundColor: colors.primary,
  },
  preferredText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  preferredTextActive: {
    color: colors.white,
  },
});
