import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type Stat = { day: string; count: number };

export default function ActivityChart({ data }: { data: Stat[] }) {
  const max = data.length > 0 ? Math.max(...data.map(d => d.count)) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: (item.count / max) * 80, 
                  backgroundColor: item.count === max ? colors.primary : colors.cardSoft 
                }
              ]} 
            />
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  chart: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    height: 100, 
    paddingBottom: 8 
  },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 14, borderRadius: 7, marginBottom: 8 },
  dayText: { color: colors.textMuted, fontSize: 10, fontWeight: '600' }
});