import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type Props = { icon: any; title: string; description: string; };

export default function EmptyState({ icon, title, description }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  iconCircle: { width: 88, height: 88, borderRadius: 8, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  description: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }
});
