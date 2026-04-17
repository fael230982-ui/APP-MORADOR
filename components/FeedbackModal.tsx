import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import PrimaryButton from './PrimaryButton';

type FeedbackModalProps = {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  description: string;
  buttonText: string;
  onClose: () => void;
};

export default function FeedbackModal({
  visible,
  type,
  title,
  description,
  buttonText,
  onClose,
}: FeedbackModalProps) {
  const iconColor = type === 'success' ? colors.success : type === 'error' ? colors.danger : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
             <View style={[styles.innerCircle, { backgroundColor: iconColor }]} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <PrimaryButton 
            title={buttonText} 
            onPress={onClose} 
            variant={type === 'error' ? 'danger' : 'primary'}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  innerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
});