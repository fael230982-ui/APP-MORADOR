import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Camera } from '../types/camera';

type CameraCardProps = {
  camera: Camera;
  onPress: () => void;
};

export default function CameraCard({ camera, onPress }: CameraCardProps) {
  const isOnline = camera.status === 'online';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={!isOnline}
    >
      <View style={styles.preview}>
        <Ionicons 
          name={isOnline ? "videocam" : "videocam-off"} 
          size={32} 
          color={isOnline ? colors.primaryLight : colors.textMuted} 
        />
        {!isOnline && <Text style={styles.offlineText}>OFFLINE</Text>}
      </View>

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name}>{camera.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
        </View>
        <Text style={styles.location}>{camera.location}</Text>
        {camera.lastActivity && (
          <Text style={styles.activity}>{camera.lastActivity}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.cardSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  offlineText: { color: colors.danger, fontSize: 10, fontWeight: '800', marginTop: 4 },
  info: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  location: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  activity: { color: colors.primaryLight, fontSize: 11, marginTop: 6, fontWeight: '600' },
});