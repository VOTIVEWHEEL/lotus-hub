import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Habit } from '../../types';
import { useHabitStore } from '../../store';

interface Props {
  habit: Habit;
  isDone: boolean;
  showDivider?: boolean;
}

export const HabitRow: React.FC<Props> = ({ habit, isDone, showDivider }) => {
  const { logCompletion, undoCompletion } = useHabitStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={[styles.row, showDivider && styles.rowBorder]}>
      <View style={[styles.iconBox, { backgroundColor: habit.color + '20' }]}>
        <Text style={styles.icon}>{habit.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, isDone && styles.nameDone]}>{habit.name}</Text>
        {habit.streak > 0 && (
          <Text style={styles.streak}>🔥 {habit.streak} day streak</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.check, { borderColor: habit.color }, isDone && { backgroundColor: habit.color }]}
        onPress={() => isDone ? undoCompletion(habit.id, today) : logCompletion(habit.id)}
      >
        {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    color: Colors.textPrimary,
    ...Typography.bodyMedium,
  },
  nameDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  streak: {
    fontSize: 11,
    color: Colors.warning,
    ...Typography.body,
    marginTop: 1,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
