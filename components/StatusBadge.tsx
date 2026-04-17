import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type StatusBadgeProps = {
  label: string;
  type: 'success' | 'warning' | 'danger' | 'info';
};

export default function StatusBadge({ label, type }: StatusBadgeProps) {
  const badgeColor =
    type === 'success'
      ? colors.success
      : type === 'warning'
      ? colors.warning
      : type === 'danger'
      ? colors.danger
      : colors.primaryLight;

  return (
    <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}14` }]}>
      <Text style={[styles.badgeText, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
