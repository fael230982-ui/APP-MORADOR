import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import EmptyState from './EmptyState';

type FeatureLockedStateProps = {
  icon: React.ComponentProps<typeof EmptyState>['icon'];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function FeatureLockedState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: FeatureLockedStateProps) {
  return (
    <View style={styles.container}>
      <EmptyState icon={icon} title={title} description={description} />
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.86} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
