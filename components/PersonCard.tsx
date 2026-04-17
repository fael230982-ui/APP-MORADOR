import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Person } from '../types/person';
import { maskEmail, maskPhone } from '../utils/privacy';
import StatusBadge from './StatusBadge';
import UserAvatar from './UserAvatar';

export default function PersonCard({ person, onPress }: { person: Person; onPress?: () => void }) {
  const theme = getTheme(person);
  const badgeType = person.status === 'ACTIVE' ? 'success' : person.status === 'EXPIRED' ? 'warning' : 'danger';
  const contact = person.phone
    ? maskPhone(person.phone)
    : person.email
      ? maskEmail(person.email)
      : 'Contato nao informado';
  const unit = person.unitName || person.unitNames?.[0] || 'Sua unidade';

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={[styles.leftBar, { backgroundColor: theme.color }]} />

      <View style={styles.topRow}>
        <UserAvatar
          name={person.name}
          photoUri={person.photoUrl}
          size={52}
          textSize={20}
          backgroundColor={theme.color}
        />

        <View style={styles.nameArea}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>

          <View style={[styles.categoryBadge, { backgroundColor: `${theme.color}15` }]}>
            <View style={[styles.categoryDot, { backgroundColor: theme.color }]} />
            <Text style={[styles.categoryText, { color: theme.color }]}>{theme.label}</Text>
          </View>
        </View>

        <StatusBadge label={person.statusLabel} type={badgeType} />
      </View>

      <Text style={styles.meta} numberOfLines={1}>
        {contact}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {unit}
      </Text>
    </TouchableOpacity>
  );
}

function getTheme(person: Person) {
  const cat = String(person.category || '').toUpperCase();
  const label = String(person.categoryLabel || '').toLowerCase();

  if (cat === 'RESIDENT' || label.includes('morador')) {
    return { color: '#34C759', label: 'Morador' };
  }

  if (cat === 'VISITOR' || label.includes('visitante')) {
    return { color: '#0A84FF', label: 'Visitante' };
  }

  if (cat === 'SERVICE_PROVIDER' || label.includes('prestador')) {
    return { color: '#FF9500', label: 'Prestador' };
  }

  if (cat === 'RENTER' || label.includes('locatario')) {
    return { color: '#AF52DE', label: 'Locatario' };
  }

  return { color: '#8E8E93', label: person.categoryLabel || 'Outro' };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    paddingLeft: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },
  leftBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  nameArea: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontSize: 17, fontWeight: '900', marginBottom: 8 },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 10 },
});
