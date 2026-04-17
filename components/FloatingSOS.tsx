import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { hapticFeedback } from '../services/haptics';

export default function FloatingSOS() {
  const triggerSOS = () => {
    hapticFeedback.error();
    router.push('/resident-actions');
  };

  return (
    <TouchableOpacity style={styles.button} onPress={triggerSOS}>
      <Text style={styles.text}>SOS</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  text: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
