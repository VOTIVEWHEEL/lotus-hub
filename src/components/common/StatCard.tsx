import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

interface Props {
  label: string;
  value: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

export const StatCard: React.FC<Props> = ({ label, value, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderColor: color + '30' }]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    gap: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    ...Typography.heading,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    ...Typography.body,
    textAlign: 'center',
  },
});
