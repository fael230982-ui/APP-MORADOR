import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

export default function CameraSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.titlePlaceholder, { opacity }]} />
        <Animated.View style={[styles.subtitlePlaceholder, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: colors.border },
  info: { padding: 16 },
  titlePlaceholder: { width: '60%', height: 16, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 },
  subtitlePlaceholder: { width: '40%', height: 12, backgroundColor: colors.border, borderRadius: 4 }
});
