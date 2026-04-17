import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import type { AlarmItem } from '../types/alarm';
import StatusBadge from './StatusBadge';

type AlertCardProps = {
  alarm: AlarmItem;
  onPress?: () => void;
};

export default function AlertCard({ alarm, onPress }: AlertCardProps) {
  const badgeType =
    alarm.status === 'UNAUTHORIZED'
      ? 'danger'
      : alarm.status === 'AUTHORIZED'
      ? 'success'
      : alarm.status === 'UNDER_REVIEW'
      ? 'warning'
      : 'info';

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{alarm.title}</Text>
          <Text style={styles.location}>{alarm.location}</Text>
        </View>

        <StatusBadge label={alarm.statusLabel} type={badgeType} />
      </View>

      <View style={styles.separator} />

      <Text style={styles.meta}>Horário: {alarm.detectedAt}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  location: {
    color: colors.textMuted,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
});
