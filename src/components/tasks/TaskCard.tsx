import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Task, TaskPriority, TaskStatus } from '../../types';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: Colors.textMuted,
  medium: Colors.info,
  high: Colors.warning,
  urgent: Colors.error,
};

const PRIORITY_ICONS: Record<TaskPriority, string> = {
  low: 'arrow-down',
  medium: 'remove',
  high: 'arrow-up',
  urgent: 'warning',
};

interface Props {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
}

export const TaskCard: React.FC<Props> = ({ task, onPress, onLongPress, onStatusChange }) => {
  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <TouchableOpacity
      style={[styles.card, isDone && styles.cardDone]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      {/* Status toggle */}
      <TouchableOpacity
        style={[styles.check, { borderColor: PRIORITY_COLORS[task.priority] }, isDone && { backgroundColor: PRIORITY_COLORS[task.priority] }]}
        onPress={() => onStatusChange?.(isDone ? 'todo' : 'done')}
      >
        {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={styles.desc} numberOfLines={1}>{task.description}</Text>
        )}
        <View style={styles.meta}>
          {/* Priority badge */}
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + '20' }]}>
            <Ionicons name={PRIORITY_ICONS[task.priority] as any} size={10} color={PRIORITY_COLORS[task.priority]} />
            <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>
              {task.priority}
            </Text>
          </View>

          {/* Due date */}
          {task.dueDate && (
            <View style={[styles.dueBadge, isOverdue && styles.dueBadgeOverdue]}>
              <Ionicons name="calendar-outline" size={10} color={isOverdue ? Colors.error : Colors.textMuted} />
              <Text style={[styles.dueText, isOverdue && styles.dueTextOverdue]}>
                {format(new Date(task.dueDate), 'MMM d')}
              </Text>
            </View>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <View style={styles.subtaskBadge}>
              <Ionicons name="list-outline" size={10} color={Colors.textMuted} />
              <Text style={styles.subtaskText}>{completedSubtasks}/{task.subtasks.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* In progress dot */}
      {task.status === 'in_progress' && (
        <View style={styles.inProgressDot} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardDone: {
    opacity: 0.6,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  info: { flex: 1 },
  title: {
    fontSize: 15,
    color: Colors.textPrimary,
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  desc: {
    fontSize: 12,
    color: Colors.textMuted,
    ...Typography.body,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  priorityText: {
    fontSize: 10,
    ...Typography.bodyMedium,
    textTransform: 'capitalize',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueBadgeOverdue: {},
  dueText: {
    fontSize: 11,
    color: Colors.textMuted,
    ...Typography.body,
  },
  dueTextOverdue: {
    color: Colors.error,
    ...Typography.bodyMedium,
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  subtaskText: {
    fontSize: 11,
    color: Colors.textMuted,
    ...Typography.body,
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.info,
    marginTop: 6,
    flexShrink: 0,
  },
});
